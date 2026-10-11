#!/bin/bash
# Claude: + → Connectors (Aljam3 on) → question → send
set -e
cd "$(dirname "$0")"
export GAP=60 TAB=claude
c() { node c.mjs "$@" >/dev/null; }
Q='ابحث في الجامع عن حديث «إنما الأعمال بالنيات» في رياض الصالحين، واذكر رقم الصفحة مع رابط المصدر.'
c nav https://claude.ai/new 4000
node c.mjs eval '(async () => { const ce = document.querySelector("[contenteditable=true]"); ce.focus(); document.execCommand("selectAll"); document.execCommand("delete"); ce.blur(); return JSON.stringify(ce.innerText); })()'
node c.mjs calib
rm -rf ../../archive/captures/claude-chat
c rec start claude-chat
c wait 1500
EXPECT='document.querySelectorAll("[role=menuitem]").length > 0' c tapel 'document.querySelector("button[aria-label=\"Add files, connectors, and more\"]")'
c wait 900
c hover "text~=Connectors"
c wait 1300
c hover '[role=switch]'
c wait 1600
c key Escape
c wait 200
c key Escape
c wait 700
EXPECT='document.activeElement?.isContentEditable' c tap '[contenteditable=true]'
c wait 500
c typeslow "$Q"
c wait 1200
c key Enter
c wait 3000
node c.mjs eval '(() => { const id = location.pathname.split("/").pop(); const allow = JSON.parse(localStorage.getItem("aljam3MaskAllow") ?? "[]"); if (!allow.includes(id)) allow.push(id); localStorage.setItem("aljam3MaskAllow", JSON.stringify(allow)); return location.pathname; })()'
