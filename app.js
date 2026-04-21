/*
  FILE: app.js
  PURPOSE: All interactivity for the landing page (no frameworks needed).

  What this script controls:
  - Background bubbles animation (creates .bubble divs inside #bubbles)
  - Mobile menu open/close (toggles .open on #mobile-menu)
  - Floating chat widget open/close + message rendering (demo behavior)
  - Toast notifications (small pop-up confirmations)
  - Order form submission (demo handler)

  Note: This is currently "frontend-only" demo logic. When you add a backend,
  you’ll replace the order/chat demo parts with real API calls.
*/

/* Small helper: shorter querySelector */
function qs(sel) {
  return document.querySelector(sel);
}

/* Shows a temporary toast message at the bottom of the page */
function showToast(message) {
  const toast = qs("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

/* Creates decorative bubbles (visual only) and lets CSS animate them */
function initBubbles() {
  const container = qs("#bubbles");
  if (!container) return;

  const bubbleCount = 18;
  for (let i = 0; i < bubbleCount; i += 1) {
    const b = document.createElement("div");
    b.className = "bubble";

    const size = 16 + Math.random() * 64;
    b.style.width = `${size}px`;
    b.style.height = `${size}px`;
    b.style.left = `${Math.random() * 100}%`;
    b.style.animationDuration = `${10 + Math.random() * 18}s`;
    b.style.animationDelay = `${Math.random() * 8}s`;
    b.style.opacity = `${0.35 + Math.random() * 0.45}`;

    container.appendChild(b);
  }
}

/* Controls the hamburger menu behavior on small screens */
function initMobileMenu() {
  const hamburger = qs("#hamburger");
  const menu = qs("#mobile-menu");
  if (!hamburger || !menu) return;

  function toggle() {
    menu.classList.toggle("open");
  }

  hamburger.addEventListener("click", toggle);
  hamburger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") toggle();
  });

  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => menu.classList.remove("open"));
  });
}

/* Tabs:
   - Clicking a nav link shows a single tab panel
   - Also supports direct linking via URL hash (e.g. #pricing) */
function initTabs() {
  const links = Array.from(document.querySelectorAll("[data-tab-link]"));
  const panels = Array.from(document.querySelectorAll("[data-tab-panel]"));
  if (links.length === 0 || panels.length === 0) return;

  function setActive(tabId) {
    const valid = panels.some((p) => p.getAttribute("data-tab-panel") === tabId);
    const next = valid ? tabId : panels[0].getAttribute("data-tab-panel");

    panels.forEach((p) => {
      p.classList.toggle("is-active", p.getAttribute("data-tab-panel") === next);
    });

    links.forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("data-tab-link") === next);
      a.setAttribute("aria-current", a.getAttribute("data-tab-link") === next ? "page" : "false");
    });
  }

  links.forEach((a) => {
    a.addEventListener("click", () => {
      const tabId = a.getAttribute("data-tab-link");
      setActive(tabId);
    });
  });

  function fromHash() {
    const raw = (window.location.hash || "").replace("#", "");
    setActive(raw || "services");
  }

  window.addEventListener("hashchange", fromHash);
  fromHash();
}

/* Demo chat widget:
   - toggles open/close
   - renders messages into the scrollable message list */
function initChat() {
  const toggle = qs("#chat-toggle");
  const win = qs("#chat-window");
  const close = qs("#chat-close");
  const input = qs("#chat-input");
  const send = qs("#chat-send");
  const messages = qs("#chat-messages");

  if (!toggle || !win || !close || !input || !send || !messages) return;

  // Primary contact channel for quick help / orders
  const WHATSAPP_NUMBER = "256708748558";
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

  function open() {
    win.classList.add("open");
    input.focus();
  }
  function shut() {
    win.classList.remove("open");
  }

  toggle.addEventListener("click", () => (win.classList.contains("open") ? shut() : open()));
  close.addEventListener("click", shut);

  // Adds a message bubble to the chat.
  // - user messages are always plain text
  // - bot messages can optionally include a small amount of trusted HTML (links)
  function addMsg(text, who, opts = {}) {
    const div = document.createElement("div");
    div.className = `msg ${who}`;
    if (opts.html) {
      div.innerHTML = text; // trusted templates only (we don't insert user input here)
    } else {
      div.textContent = text;
    }
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function normalize(s) {
    return (s || "").toLowerCase().trim();
  }

  function botReply(userText) {
    const t = normalize(userText);

    // Very small "rules" based bot for common questions.
    if (t.includes("price") || t.includes("cost") || t.includes("pricing") || t.includes("how much")) {
      return (
        `Pricing starts from:\n` +
        `- Wash & Fold: UGX 3,000\n` +
        `- Ironing: UGX 1,000\n` +
        `- Dry Cleaning: UGX 8,000\n` +
        `- Pickup & Delivery: UGX 2,000`
      );
    }

    if (t.includes("service") || t.includes("wash") || t.includes("fold") || t.includes("iron") || t.includes("dry")) {
      return (
        `We offer Wash & Fold, Ironing, Dry Cleaning, plus Pickup & Delivery around Kikoni. ` +
        `Tell me what items you have and I’ll guide you.`
      );
    }

    if (t.includes("location") || t.includes("where") || t.includes("kikoni") || t.includes("olympia")) {
      return `We’re in Makerere Kikoni (opposite Olympia Hostel).`;
    }

    if (t.includes("pickup") || t.includes("delivery") || t.includes("collect")) {
      return `Yes—pickup & delivery is available around Kikoni. Share your location and preferred pickup time.`;
    }

    // Default helpful response
    return `I can help with services, pricing, pickup, delivery, and location. What do you need?`;
  }

  function whatsappSuggestionHtml() {
    return (
      `For the fastest help, WhatsApp us: ` +
      `<a href="${WHATSAPP_URL}" target="_blank" rel="noreferrer">+256 708 748 558</a>`
    );
  }

  function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    addMsg(text, "user");
    window.setTimeout(() => {
      addMsg(botReply(text), "bot");
      addMsg(whatsappSuggestionHtml(), "bot", { html: true });
    }, 250);
  }

  send.addEventListener("click", handleSend);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend();
  });
}

/* Demo order form submit:
   - prevents page reload
   - shows a toast confirmation
   - clears the form */
function initOrderForm() {
  const form = qs("#order-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Order received! (demo)");
    form.reset();
  });
}

/* Wait until HTML is loaded, then initialize all behaviors safely */
document.addEventListener("DOMContentLoaded", () => {
  initBubbles();
  initMobileMenu();
  initTabs();
  initChat();
  initOrderForm();
});

