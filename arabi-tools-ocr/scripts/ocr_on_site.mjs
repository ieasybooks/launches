// A real visitor flow: upload the small PDF, wait for extraction, click all three downloads.
// NODE_PATH=/path/to/playwright/node_modules node scripts/ocr_on_site.mjs src/data/تاريخ-الطبري.pdf
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const require = createRequire(path.join(process.env.NODE_PATH ?? '.', 'x.js'));
const {chromium} = require('playwright');
const file = path.resolve(process.argv[2]);
const qa = path.resolve('out/qa');
fs.mkdirSync(qa, {recursive: true});
const browser = await chromium.launch({executablePath:'/usr/bin/google-chrome', headless:true, args:['--no-sandbox','--disable-dev-shm-usage']});
try {
  const page = await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});
  await page.goto('https://arabi.tools/ocr', {waitUntil:'networkidle'});
  await page.screenshot({path:path.join(qa,'site-upload-reference.png'),fullPage:true});
  await page.locator('#upload-form input[type=file]').setInputFiles(file);
  await page.locator('#upload-form button[type=submit]').click();
  let last='', state=''; const states=[];
  for (const start=Date.now(); Date.now()-start<240000;) {
    state=await page.evaluate(()=>{
      const job=document.querySelector('.job');
      if(job) return `${job.dataset.state} ${document.querySelector('#job-status')?.textContent??''} ${document.querySelector('.percent')?.textContent??''}`;
      const error=document.querySelector('#upload-form .error:not([hidden])');
      return error?`error ${error.textContent}`:'uploading';
    });
    if(state!==last) {states.push({at:new Date().toISOString(),state});console.log(state);last=state;}
    if(/^(done|failed|error)/.test(state)) break;
    await page.waitForTimeout(1500);
  }
  fs.writeFileSync(path.join(qa,'site-states.json'),JSON.stringify(states,null,2)+'\n');
  if(!state.startsWith('done')) {
    fs.writeFileSync(path.join(qa,'site-failure.txt'),await page.locator('body').innerText());
    throw new Error(`OCR did not complete: ${state}`);
  }
  const ui=await page.evaluate(()=>({text:document.body.innerText,links:[...document.querySelectorAll('.downloads a')].map(a=>({label:a.textContent,href:a.href})),resultHtml:document.querySelector('.job')?.outerHTML}));
  fs.writeFileSync(path.join(qa,'site-result-reference.json'),JSON.stringify(ui,null,2)+'\n');
  await page.screenshot({path:path.join(qa,'site-result-reference.png'),fullPage:true});
  const downloads=[];
  for (const ext of ['txt','docx','json']) {
    const link=ui.links.find(a=>new URL(a.href).pathname.endsWith(`.${ext}`)||a.label.toLowerCase().includes(ext));
    if(!link) throw new Error(`Missing ${ext} download`);
    const event=page.waitForEvent('download');
    await page.locator('.downloads a').filter({hasText:link.label.trim()}).click();
    const download=await event;
    const dest=path.resolve(`src/data/ocr.${ext}`);
    await download.saveAs(dest);
    downloads.push({format:ext,file:`ocr.${ext}`,downloadName:download.suggestedFilename(),bytes:fs.statSync(dest).size,sha256:createHash('sha256').update(fs.readFileSync(dest)).digest('hex')});
  }
  fs.writeFileSync('src/data/ocr-provenance.json',JSON.stringify({source:'https://arabi.tools/ocr',input:path.basename(file),extractedAt:new Date().toISOString(),downloads,note:'Unedited downloads from a real browser upload on the live site. The film displays literal excerpts from ocr.json.'},null,2)+'\n');
  console.log(JSON.stringify(downloads));
} finally {await browser.close();}
