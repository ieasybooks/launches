// Hides the account owner's personal data in ChatGPT while recording (runs on every page load).
// Edit PRIVATE to list your own plugins; everything else (chat history, suggestions, avatar) is generic.
(() => {
  if (window.__aljam3MaskGpt) return;
  window.__aljam3MaskGpt = true;
  const PRIVATE = /^(Faqieh|Namecheap|GitHub|Plugin Creator)$/;
  const allowChats = () => JSON.parse(localStorage.getItem("aljam3MaskAllow") ?? "[]");
  const AVATAR = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#c9c4bf"/><circle cx="12" cy="9.5" r="4" fill="#fff"/><path d="M4.5 20.2c1.6-3.2 4.3-4.7 7.5-4.7s5.9 1.5 7.5 4.7" fill="#fff"/></svg>');
  const css = `
    section[class*="home-suggestions"] { display: none !important; }
    [data-aljam3-hide] { display: none !important; }
  `;
  const hide = (el, on = true) => el && el.toggleAttribute("data-aljam3-hide", on);
  const apply = () => {
    if (!document.getElementById("aljam3-mask") && document.head) {
      const st = document.createElement("style");
      st.id = "aljam3-mask";
      st.textContent = css;
      document.head.appendChild(st);
    }
    // chat history, except chats recorded for the film (their ids go in localStorage.aljam3MaskAllow)
    const allow = allowChats();
    for (const a of document.querySelectorAll('a[href^="/c/"]')) hide(a.closest("div.group") ?? a, !allow.includes(a.getAttribute("href").split("/")[2]));
    // the owner's other plugins: sidebar, pickers, @-mention lists, and files from their library
    for (const a of document.querySelectorAll('a[href^="/plugins/plugin_"]')) if (PRIVATE.test((a.innerText ?? "").trim())) hide(a.parentElement);
    for (const b of document.querySelectorAll('button, [role="option"], [role="menuitem"], [role="menuitemcheckbox"], li')) {
      const first = (b.innerText ?? "").split("\n").map((t) => t.trim()).find(Boolean) ?? "";
      if ((PRIVATE.test(first) || /\.(pdf|json|md|txt|docx?|csv|xlsx?|pptx?|png|jpe?g|zip)$/i.test(first)) && !b.querySelector("button")) hide(b);
    }
    for (const h of document.querySelectorAll("div, span, p, h2, h3")) {
      if (!h.children.length && (h.textContent ?? "").trim() === "الملفات" && !h.closest("button")) hide(h);
    }
    for (const img of document.querySelectorAll('img[src*="avatars/"], img[src*="googleusercontent"], img[src*="gravatar"]')) img.src = AVATAR;
    for (const b of document.querySelectorAll("nav button, nav a")) if (/dot الخاص بك|Your dot/.test(b.getAttribute("aria-label") ?? b.innerText ?? "")) hide(b);
    for (const h of document.querySelectorAll("nav button")) {
      if (!/المحادثات الأخيرة|Recents/.test(h.innerText ?? "")) continue;
      const section = h.closest("div.group\\/nav-section") ?? h.parentElement?.parentElement;
      const visible = section && [...section.querySelectorAll('a[href^="/c/"]')].some((a) => !a.closest("[data-aljam3-hide]"));
      hide(section ?? h, !visible);
    }
  };
  const start = () => {
    apply();
    new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
