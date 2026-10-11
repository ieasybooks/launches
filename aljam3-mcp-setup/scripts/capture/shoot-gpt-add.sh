#!/bin/bash
# ChatGPT: plugins → add custom MCP server → fill → create
set -e
cd "$(dirname "$0")"
export GAP=60 TAB=gpt
c() { node c.mjs "$@" >/dev/null; }
c nav https://chatgpt.com/ 3500
sleep 1.5
rm -rf ../../archive/captures/gpt-add
node c.mjs calib
c rec start gpt-add
c wait 1500
EXPECT='location.pathname === "/plugins"' c click 1254 182
c wait 2000
EXPECT='document.querySelectorAll("[role=menuitem]").length > 0' c tap "text=إضافة"
c wait 1100
EXPECT='!!document.querySelector("[role=dialog] input[placeholder=\"أداة مخصصة\"]")' c tap "text=إضافة خادم MCP مخصص"
c wait 1500
EXPECT='document.activeElement?.placeholder === "أداة مخصصة"' c tap 'input[placeholder="أداة مخصصة"]'
c wait 400
c typeslow Aljam3
c wait 900
EXPECT='document.activeElement?.placeholder === "https://example.com/mcp"' c tap 'input[placeholder="https://example.com/mcp"]'
c wait 500
c paste https://aljam3.com/mcp
c wait 1200
c hover '[role=dialog] select'
c wait 350
c mark click select
c wait 900
c mark select "بدون مصادقة"
node c.mjs eval '(() => { const sel = document.querySelector("[role=dialog] select"); const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set; const opt = [...sel.options].find(o => o.text.trim() === "بدون مصادقة"); setter.call(sel, opt.value); sel.dispatchEvent(new Event("change", {bubbles: true})); return sel.options[sel.selectedIndex].text; })()'
c wait 1400
EXPECT='document.querySelector("[role=dialog] button[role=checkbox]")?.getAttribute("aria-checked") === "true"' c tap '[role=dialog] button[role=checkbox]'
c wait 1000
node c.mjs eval '(() => { const d = document.querySelector("[role=dialog]"); return JSON.stringify({name: d.querySelector("input[placeholder=\"أداة مخصصة\"]").value, url: d.querySelector("input[placeholder=\"https://example.com/mcp\"]").value, auth: d.querySelector("select").selectedOptions[0].text}); })()'
EXPECT='!document.querySelector("[role=dialog] input[placeholder=\"أداة مخصصة\"]") || /بالفعل|خطأ|error/i.test(document.querySelector("[role=dialog]")?.innerText ?? "")' c tap "text=إنشاء كمكوّن إضافي"
c wait 4000
node c.mjs shot gpt-after-create
node c.mjs eval 'location.href + " | " + (document.querySelector("[role=dialog]")?.innerText ?? "no dialog").slice(0, 700).replace(/\n+/g, " / ")'
