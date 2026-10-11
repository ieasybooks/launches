#!/bin/bash
# Claude: Customize → Connectors → Add → Add custom connector → name + URL → Continue
set -e
cd "$(dirname "$0")"
export GAP=60 TAB=claude
c() { node c.mjs "$@" >/dev/null; }
c nav https://claude.ai/new 4000
node c.mjs calib
rm -rf ../../archive/captures/claude-add
c rec start claude-add
c wait 1500
EXPECT='location.pathname.startsWith("/customize")' c tap "text=Customize"
c wait 1800
EXPECT='/connectors/.test(location.pathname) || document.querySelector("[role=tab][aria-selected=true]")?.innerText.trim() === "Connectors"' c tap "text=Connectors"
c wait 1500
EXPECT='[...document.querySelectorAll("[role=menuitem]")].some(m => /Add custom connector/.test(m.innerText))' c tapel '[...document.querySelectorAll("button")].find(b => b.innerText.trim() === "Add" && b.offsetParent)'
c wait 1000
EXPECT='!!document.querySelector("input[placeholder=Name]")' c tap "text=Add custom connector"
c wait 1500
EXPECT='document.activeElement?.placeholder === "Name"' c tap 'input[placeholder=Name]'
c wait 400
c typeslow Aljam3
c wait 900
EXPECT='document.activeElement?.placeholder === "MCP server URL"' c tap 'input[placeholder="MCP server URL"]'
c wait 500
c paste https://aljam3.com/mcp
c wait 1400
