/* FILE: app.js
  FINAL FIX: Robust Tab Switching + Order Logic
*/

function qs(sel) { return document.querySelector(sel); }

function showToast(message) {
  const toast = qs("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

/* 1. THE BULLETPROOF TAB SWITCHER */
function initTabs() {
  const links = document.querySelectorAll("[data-tab-link]");
  const panels = document.querySelectorAll("[data-tab-panel]");

  if (links.length === 0 || panels.length === 0) return;

  function switchTab(targetId) {
    console.log("Switching to tab:", targetId); // Helpful for debugging

    // Loop through all panels
    panels.forEach(panel => {
      const panelId = panel.getAttribute("data-tab-panel");
      if (panelId === targetId) {
        panel.style.display = "block"; // Force visibility
        panel.classList.add("is-active");
      } else {
        panel.style.display = "none"; // Force hide
        panel.classList.remove("is-active");
      }
    });

    // Loop through all links to update "active" UI state
    links.forEach(link => {
      const linkId = link.getAttribute("data-tab-link");
      link.classList.toggle("is-active", linkId === targetId);
    });

    // Sync hash without jumping the page
    if (window.location.hash !== `#${targetId}`) {
      history.pushState(null, null, `#${targetId}`);
    }
  }

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.getAttribute("data-tab-link");
      switchTab(id);
    });
  });

  // Handle page load / direct links
  const currentHash = window.location.hash.replace("#", "");
  const defaultTab = currentHash || "services";
  switchTab(defaultTab);
}

/* 2. ORDER LOGIC (Keeping your working code) */
function initOrderForm() {
  const form = qs("#order-form");
  if (!form) return;

  const weightEl = document.getElementById('est-weight');
  const piecesEl = document.getElementById('est-pieces');
  const serviceChecks = document.querySelectorAll('#services-check input');

  function updateSummary() {
    const checks = document.querySelectorAll('#services-check input:checked');
    const weight = parseFloat(weightEl.value) || 1;
    const pieces = parseInt(piecesEl.value) || 1;
    const summary = document.getElementById('order-summary');
    const items = document.getElementById('summary-items');
    const total = document.getElementById('summary-total');

    if (!summary) return;
    if (checks.length === 0) { 
      summary.style.display = 'none'; 
      return; 
    }

    summary.style.display = 'block';
    let html = ''; 
    let grand = 0;

    checks.forEach(c => {
      const svc = c.value; 
      const price = parseInt(c.dataset.price) || 0;
      let unit, amt;

      if (svc === 'Wash & Fold') { 
        unit = `${weight}kg`; amt = price * weight; 
      } else if (svc === 'Pickup & Delivery') { 
        unit = 'Free'; amt = 0; 
      } else { 
        unit = `${pieces} pieces`; amt = price * pieces; 
      }

      grand += amt;
      html += `<div class="summary-item"><span>${svc} (${unit})</span><span>${amt === 0 ? 'Free' : 'UGX ' + amt.toLocaleString()}</span></div>`;
    });

    items.innerHTML = html;
    total.textContent = grand === 0 ? 'Free' : 'UGX ' + grand.toLocaleString();
  }

  serviceChecks.forEach(c => c.addEventListener('change', updateSummary));
  if (weightEl) weightEl.addEventListener('input', updateSummary);
  if (piecesEl) piecesEl.addEventListener('input', updateSummary);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const services = [...document.querySelectorAll('#services-check input:checked')].map(c => c.value);
    const totalVal = document.getElementById('summary-total').textContent;

    const msg = `🧺 *New Dobby Order*\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n✅ Services: ${services.join(', ')}\n💰 Total Est: ${totalVal}`;
    window.open(`https://wa.me/256708748558?text=${encodeURIComponent(msg)}`, '_blank');
  });
}

/* 3. VISUALS */
function initBubbles() {
  const container = qs("#bubbles");
  if (!container) return;
  for (let i = 0; i < 15; i++) {
    const b = document.createElement("div");
    b.className = "bubble";
    const size = 20 + Math.random() * 40;
    b.style.width = b.style.height = `${size}px`;
    b.style.left = `${Math.random() * 100}%`;
    b.style.animationDuration = `${10 + Math.random() * 15}s`;
    container.appendChild(b);
  }
}

function initMobileMenu() {
  const ham = qs("#hamburger"), menu = qs("#mobile-menu");
  if (ham && menu) {
    ham.addEventListener("click", () => menu.classList.toggle("open"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTabs();      
  initOrderForm(); 
  initBubbles();
  initMobileMenu();
});
