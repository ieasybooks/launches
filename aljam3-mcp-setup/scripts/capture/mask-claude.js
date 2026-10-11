// Hides the account owner's personal data in Claude while recording (runs on every page load).
// Edit PRIVATE (your own connectors) and OWNER (your first name, used in greetings).
(() => {
  if (window.__aljam3MaskClaude) return;
  window.__aljam3MaskClaude = true;
  const PRIVATE = /^(PasteHTML|GitHub Integration|Faqieh|Claude in Chrome)$/;
  const OWNER = "Ali";
  const owner = new RegExp(`\\b${OWNER}\\b`);
  const allowChats = () => JSON.parse(localStorage.getItem("aljam3MaskAllow") ?? "[]");
  const css = `
    [data-aljam3-hide] { display: none !important; }
    [data-testid="user-menu-button"] .df-user-menu-trailing { visibility: hidden !important; }
    [data-testid="user-menu-button"] [data-cds="Avatar"] { color: transparent !important; background: #d9d4cc !important; }
  `;
  const hide = (el, on = true) => el && el.toggleAttribute("data-aljam3-hide", on);
  const apply = () => {
    if (!document.getElementById("aljam3-mask") && document.head) {
      const st = document.createElement("style");
      st.id = "aljam3-mask";
      st.textContent = css;
      document.head.appendChild(st);
    }
    const allow = allowChats();
    for (const a of document.querySelectorAll('a[href^="/chat/"], a[href^="/cowork/cse_"]')) hide(a.closest("div.group") ?? a, !allow.includes(a.getAttribute("href").split("/")[2]));
    for (const b of document.querySelectorAll("a, button")) if (/^View all$/.test((b.innerText ?? "").trim())) hide(b);
    for (const box of document.querySelectorAll(".df-recents-anchor")) hide(box, ![...box.querySelectorAll('a[href^="/chat/"]')].some((a) => !a.closest("[data-aljam3-hide]")));
    // the owner's other connectors in tables and menus, and the warning badge they cause
    for (const s of document.querySelectorAll("span, div, p")) {
      if (s.children.length || !PRIVATE.test((s.textContent ?? "").trim())) continue;
      hide(s.closest("tr") ?? s.closest('[role="menuitem"], [role="menuitemcheckbox"], [role="option"], li') ?? null);
    }
    for (const m of document.querySelectorAll('[role="menuitem"]')) {
      if (/Connectors/.test(m.innerText ?? "") && !/Manage|Add/.test(m.innerText ?? "")) for (const el of m.querySelectorAll('[data-cds="Badge"]')) hide(el);
    }
    // greetings such as "Ali returns!" become the name-free "Back at it"
    const walker = document.createTreeWalker(document.body ?? document.documentElement, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!owner.test(n.nodeValue) || n.parentElement?.closest("[contenteditable], .font-claude-response")) continue;
      n.nodeValue = n.nodeValue.length < 40 ? "Back at it" : n.nodeValue.replace(new RegExp(`,?\\s*\\b${OWNER}\\b`, "g"), "");
    }
  };
  const start = () => {
    apply();
    new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
