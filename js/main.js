(function () {
  // ============================
  // YEAR AUTO-UPDATE
  // ============================
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear().toString();

  // ============================
  // NAVIGATION TOGGLE (MOBILE)
  // ============================
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("primary-menu");

  if (toggle && menu) {
    menu.dataset.collapsed = "true";
    toggle.setAttribute("aria-expanded", "false");

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      menu.dataset.collapsed = expanded ? "true" : "false";
    });
  }

  // ============================
  // BACKGROUND IMAGE TOGGLE
  // ============================
  const bgToggle = document.getElementById("bg-toggle");
  const body = document.body;
  const BG_KEY = "bgLogoDisabled";

  const applyBgState = (disabled) => {
    body.classList.toggle("bg-logo-disabled", !!disabled);
    if (bgToggle) bgToggle.setAttribute("aria-pressed", disabled ? "true" : "false");
  };

  try {
    const stored = localStorage.getItem(BG_KEY);
    const defaultDisabled = true;
    const isDisabled = stored === null ? defaultDisabled : stored === "true";
    applyBgState(isDisabled);
  } catch (e) {}

  if (bgToggle) {
    bgToggle.addEventListener("click", () => {
      try {
        const nowDisabled = !body.classList.contains("bg-logo-disabled");
        applyBgState(nowDisabled);
        localStorage.setItem(BG_KEY, nowDisabled ? "true" : "false");
      } catch (e) {
        applyBgState(!body.classList.contains("bg-logo-disabled"));
      }
    });
  }

  // ============================
  // SMOOTH SCROLL FOR ANCHORS
  // ============================
  document.querySelectorAll('a[href*="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      try {
        const url = new URL(link.href, location.href);
        const hash = url.hash;
        if (!hash) return;

        const target = document.querySelector(hash);
        if (!target) return;

        event.preventDefault();

        const header = document.querySelector(".site-header");
        const headerHeight = header ? header.offsetHeight : 0;
        const rect = target.getBoundingClientRect();
        const top = rect.top + window.scrollY - headerHeight - 12;

        window.scrollTo({ top, behavior: "smooth" });

        if (toggle && menu) {
          toggle.setAttribute("aria-expanded", "false");
          menu.dataset.collapsed = "true";
        }
      } catch (e) {}
    });
  });

  // ============================
  // CONTACT FORM VALIDATION
  // ============================
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const status = document.getElementById("form-status");
      const fields = ["name", "email", "subject", "message"];
      let valid = true;

      fields.forEach((id) => {
        const field = document.getElementById(id);
        const error = document.getElementById(`${id}-error`);
        const value = field ? field.value.trim() : "";
        let message = "";

        if (!value) message = "This field is required.";
        if (id === "email" && value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
          message = "Enter a valid email address.";
        }

        if (error) error.textContent = message;
        if (message) valid = false;
      });

      const website = document.getElementById("website");
      if (website && website.value.trim()) valid = false;

      if (!valid) {
        if (status) status.textContent = "Please correct the highlighted fields.";
        return;
      }

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const subject = document.getElementById("subject").value.trim();
      const message = document.getElementById("message").value.trim();

      const mailto = `mailto:contact@jeremyfontenot.online?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;

      if (status) status.textContent = "Opening your email client…";
      window.location.href = mailto;
    });
  }

  // ============================
  // DOCUMENTATION SEARCH FILTER
  // ============================
  const docSearch = document.getElementById("doc-search");
  const docCount = document.getElementById("doc-count");
  const docCards = Array.from(document.querySelectorAll("[data-doc-card]"));

  const updateDocSearch = () => {
    if (!docCards.length) return;

    const query = (docSearch ? docSearch.value : "").trim().toLowerCase();
    let visibleCount = 0;

    docCards.forEach((card) => {
      const content = (card.textContent || "").toLowerCase();
      const matches = !query || content.includes(query);
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    if (docCount) {
      docCount.textContent = `${visibleCount} result${visibleCount === 1 ? "" : "s"}`;
    }
  };

  if (docCards.length) {
    if (docSearch) {
      docSearch.addEventListener("input", updateDocSearch);
    }
    updateDocSearch();
  }
})();
