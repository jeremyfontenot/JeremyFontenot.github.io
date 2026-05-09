(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }

  const navToggle = document.getElementById("nav-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      mobileMenu.classList.toggle("hidden", expanded);
    });
  }

  // Documentation search
  const searchInput = document.getElementById("doc-search");
  if (searchInput) {
    const docLinks = Array.from(document.querySelectorAll(".doc-link"));
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      docLinks.forEach((link) => {
        const text = link.textContent.toLowerCase();
        const keywords = (link.getAttribute("data-doc-keywords") || "").toLowerCase();
        const match = !query || text.includes(query) || keywords.includes(query);
        link.parentElement.classList.toggle("hidden", !match);
      });
    });
  }

  // Copy buttons
  const copyButtons = document.querySelectorAll(".copy-btn");
  copyButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy") || "";
      try {
        await navigator.clipboard.writeText(text);
        const original = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => {
          btn.textContent = original;
        }, 1500);
      } catch {
        // Silent failure; no console noise for recruiters
      }
    });
  });

  // Contact form validation (client-side only)
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = document.getElementById("form-status");
      const name = document.getElementById("name");
      const email = document.getElementById("email");
      const subject = document.getElementById("subject");
      const message = document.getElementById("message");
      const website = document.getElementById("website");

      let valid = true;

      function setError(id, msg) {
        const el = document.getElementById(id);
        if (el) el.textContent = msg;
      }

      setError("name-error", "");
      setError("email-error", "");
      setError("subject-error", "");
      setError("message-error", "");

      if (!name.value.trim()) {
        setError("name-error", "Please enter your name.");
        valid = false;
      }
      if (!email.value.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
        setError("email-error", "Please enter a valid email address.");
        valid = false;
      }
      if (!subject.value.trim()) {
        setError("subject-error", "Please enter a subject.");
        valid = false;
      }
      if (!message.value.trim()) {
        setError("message-error", "Please enter a message.");
        valid = false;
      }
      if (website && website.value.trim()) {
        valid = false; // spam
      }

      if (!valid) {
        if (status) {
          status.textContent = "Please correct the highlighted fields.";
        }
        return;
      }

      if (status) {
        status.textContent = "Thank you. Your message has been prepared. Please send it using your email client.";
      }

      const mailto = `mailto:contact@jeremyfontenot.online?subject=${encodeURIComponent(
        subject.value
      )}&body=${encodeURIComponent(
        `Name: ${name.value}\nEmail: ${email.value}\n\n${message.value}`
      )}`;
      window.location.href = mailto;
    });
  }
})();
