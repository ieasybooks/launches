#!/bin/bash
# ChatGPT: Work mode → @Aljam3 → question → streamed answer
set -e
cd "$(dirname "$0")"
export GAP=60 TAB=gpt
c() { node c.mjs "$@" >/dev/null; }
Q='ابحث عن حديث «إنما الأعمال بالنيات» في رياض الصالحين، واذكر رقم الصفحة مع رابط المصدر.'
c nav https://chatgpt.com/ 3500
# start from the Chat tab so switching to Work is on camera
node c.mjs eval '(() => { const b = [...document.querySelectorAll("button")].find(b => b.innerText.trim() === "الدردشة"); b?.click(); return !!b; })()'
sleep 1.5
node c.mjs eval '(async () => { const ce = document.querySelector("[contenteditable=true]"); ce.focus(); document.execCommand("selectAll"); document.execCommand("delete"); ce.blur(); return JSON.stringify(ce.innerText); })()'
node c.mjs calib
rm -rf ../../archive/captures/gpt-chat
c rec start gpt-chat
c wait 1500
EXPECT='[...document.querySelectorAll("button")].some(b => b.innerText.includes("GPT-6.1"))' c tap "text=العمل"
c wait 1600
EXPECT='document.activeElement?.isContentEditable' c tap '[contenteditable=true]'
c wait 500
c typeslow @Alj
c wait 1000
EXPECT='document.querySelector("[contenteditable=true]")?.innerHTML.includes("app-mention-name=\"aljam3\"")' c tapel '[...document.querySelectorAll("button")].find(b => !b.closest("[contenteditable]") && b.offsetParent && b.innerText.trim().startsWith("Aljam3"))'
c wait 300
c hover '[contenteditable=true]'
c wait 700
c typeslow "$Q"
c wait 1200
c key Enter
c wait 4000
node c.mjs eval '(() => { const id = location.pathname.split("/").pop(); const allow = JSON.parse(localStorage.getItem("aljam3MaskAllow") ?? "[]"); if (!allow.includes(id)) allow.push(id); localStorage.setItem("aljam3MaskAllow", JSON.stringify(allow)); return location.pathname; })()'
