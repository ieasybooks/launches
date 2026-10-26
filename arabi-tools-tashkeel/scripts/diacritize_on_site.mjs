// A real visitor flow on the live site: for each input, choose the model, paste the text (or
// upload the document), wait for the result and save it unedited.
// NODE_PATH=/path/to/playwright/node_modules node scripts/diacritize_on_site.mjs data/inputs.json
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const require = createRequire(path.join(process.env.NODE_PATH ?? '.', 'x.js'));
const {chromium} = require('playwright');
const inputs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const only = new Set(process.argv.slice(3));
const qa = path.resolve('out/qa/site');
fs.mkdirSync(qa, {recursive: true});
const outFile = path.resolve('src/data/site.json');
const results = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : {};
const sha = (b) => createHash('sha256').update(b).digest('hex');
const browser = await chromium.launch({executablePath:'/usr/bin/google-chrome', headless:true, args:['--no-sandbox','--disable-dev-shm-usage']});
try {
  for (const input of inputs) {
    if (only.size && !only.has(input.id)) continue;
    const page = await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});
    await page.goto('https://arabi.tools/diacritize', {waitUntil:'networkidle'});
    if (!fs.existsSync(path.join(qa,'input-reference.png'))) await page.screenshot({path:path.join(qa,'input-reference.png'),fullPage:true});
    await page.locator(`label:has(input[name=model][value=${input.model}])`).click();
    const submitted = Date.now();
    if (input.text) {
      await page.locator('#source-text').fill(input.text);
      await page.locator('#diacritize-text-panel button[type=submit]').click();
    } else {
      await page.locator('label:has(input[name=input_mode][value=document])').click();
      await page.locator('#document').setInputFiles(path.resolve(input.file));
      await page.locator('#diacritize-document-panel button[type=submit]').click();
    }
    let last = '', state = ''; const states = [];
    for (const start = Date.now(); Date.now() - start < 240000;) {
      state = await page.evaluate(() => {
        const job = document.querySelector('.job');
        if (job) return `${job.dataset.state} ${document.querySelector('#job-status')?.textContent ?? ''} ${document.querySelector('.percent')?.textContent ?? ''}`.trim();
        const error = document.querySelector('#diacritize-form .error:not([hidden])');
        return error ? `error ${error.textContent}` : 'submitting';
      }).catch(() => 'navigating');
      if (state !== last) { states.push({ms: Date.now() - submitted, state}); console.log(input.id, state); last = state; }
      if (/^(done|failed|cancelled|error)/.test(state)) break;
      await page.waitForTimeout(250);
    }
    const doneMs = Date.now() - submitted;
    await page.screenshot({path:path.join(qa,`${input.id}-result.png`),fullPage:true});
    if (!state.startsWith('done')) throw new Error(`${input.id} did not complete: ${state}`);
    const record = {id: input.id, model: input.model, source: 'https://arabi.tools/diacritize', capturedAt: new Date().toISOString(), secondsToDone: doneMs / 1000, states};
    if (input.text) {
      record.input = input.text;
      record.output = await page.locator('#diacritized-text').inputValue();
    } else {
      record.input = input.file;
      record.inputSha256 = sha(fs.readFileSync(input.file));
    }
    const event = page.waitForEvent('download');
    await page.locator('.downloads a').first().click();
    const download = await event;
    const ext = path.extname(download.suggestedFilename()) || (input.text ? '.txt' : path.extname(input.file));
    const dest = path.resolve(`src/data/${input.id}-result${ext}`);
    await download.saveAs(dest);
    const bytes = fs.readFileSync(dest);
    record.download = {file: path.basename(dest), suggestedName: download.suggestedFilename(), bytes: bytes.length, sha256: sha(bytes)};
    if (input.text) record.downloadMatchesTextarea = bytes.toString('utf8').replace(/\s+$/, '') === record.output.replace(/\s+$/, '');
    results[input.id] = record;
    fs.writeFileSync(outFile, JSON.stringify(results, null, 2) + '\n');
    console.log(input.id, `${record.secondsToDone}s`, record.output ?? record.download.file);
    await page.close();
  }
} finally { await browser.close(); }
