(function () {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear().toString();

  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("primary-menu");
  if (toggle && menu) {
    menu.dataset.collapsed = "true";
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      menu.dataset.collapsed = expanded ? "true" : "false";
    });
  }

  // Smooth-scroll for anchor links. Handles both same-page hashes and
  // links that point to the homepage (e.g. /index.html#skills-title).
  document.querySelectorAll('a[href*="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      try {
        const url = new URL(link.href, location.href);
        const hash = url.hash;
        if (!hash) return;

        // If the link targets the current page (or the homepage path),
        // intercept and smooth-scroll instead of navigating/reloading.
        const isTargetIndex = url.pathname === location.pathname || url.pathname === '/' || url.pathname.endsWith('/index.html');
        const onCurrentPage = location.pathname === '/' || location.pathname.endsWith('/index.html');

        if (isTargetIndex && onCurrentPage) {
          const target = document.querySelector(hash);
          if (!target) return;
          event.preventDefault();
          // account for sticky header height
          const header = document.querySelector('.site-header');
          const headerHeight = header ? header.offsetHeight : 0;
          const rect = target.getBoundingClientRect();
          const top = rect.top + window.scrollY - headerHeight - 12; // 12px breathing room
          window.scrollTo({ top, behavior: 'smooth' });
          // collapse mobile nav if open
          if (toggle && menu) {
            toggle.setAttribute("aria-expanded", "false");
            menu.dataset.collapsed = "true";
          }
        }
      } catch (e) {
        // ignore malformed URLs
      }
    });
  });

  // If the page loads with a hash, perform a smooth scroll to the target.
  if (location.hash) {
    window.requestAnimationFrame(() => {
      const el = document.querySelector(location.hash);
      if (!el) return;
      const header = document.querySelector('.site-header');
      const headerHeight = header ? header.offsetHeight : 0;
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY - headerHeight - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  }

  const search = document.getElementById("doc-search");
  if (search) {
    const cards = Array.from(document.querySelectorAll("[data-doc-card]"));
    const count = document.getElementById("doc-count");
    const update = () => {
      const query = search.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const match = !query || card.textContent.toLowerCase().includes(query);
        card.classList.toggle("hidden", !match);
        if (match) visible += 1;
      });
      if (count) count.textContent = `${visible} result${visible === 1 ? "" : "s"}`;
    };
    search.addEventListener("input", update);
    update();
  }

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copy);
      const text = target ? target.textContent.trim() : "";
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        const label = button.textContent;
        button.textContent = "Copied";
        setTimeout(() => {
          button.textContent = label;
        }, 1400);
      } catch {
        button.textContent = "Copy unavailable";
      }
    });
  });

  const escapeHtml = (value) => value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const highlightCode = (source, language) => {
    let html = escapeHtml(source);

    if (language === "json") {
      html = html.replace(/"([^"\\]|\\.)*"(?=\s*:)/g, '<span class="tok-key">$&</span>');
      html = html.replace(/"([^"\\]|\\.)*"/g, '<span class="tok-str">$&</span>');
      html = html.replace(/\b(true|false|null)\b/g, '<span class="tok-bool">$1</span>');
      html = html.replace(/\b\d+(?:\.\d+)?\b/g, '<span class="tok-num">$&</span>');
      return html;
    }

    if (language === "yaml") {
      html = html.replace(/^(\s*[A-Za-z0-9_-]+)(:)/gm, '<span class="tok-key">$1</span>$2');
      html = html.replace(/:\s*([^\n]+)/g, ': <span class="tok-str">$1</span>');
      html = html.replace(/\b(true|false|null)\b/g, '<span class="tok-bool">$1</span>');
      return html;
    }

    if (language === "powershell") {
      html = html.replace(/(^|\s)(function|param|if|throw|ForEach-Object|Import-Csv|New-ADUser|Add-ADGroupMember|Write-Information|Get-Module)\b/g, '$1<span class="tok-kw">$2</span>');
      html = html.replace(/\$[A-Za-z_][A-Za-z0-9_]*/g, '<span class="tok-var">$&</span>');
      html = html.replace(/"([^"\\]|\\.)*"/g, '<span class="tok-str">$&</span>');
      return html;
    }

    return html.replace(/\[(OK|RCA)\]/g, '<span class="tok-bool">[$1]</span>');
  };

  document.querySelectorAll("pre[data-lang]").forEach((block) => {
    const language = (block.dataset.lang || "text").toLowerCase();
    const source = block.textContent || "";
    block.innerHTML = highlightCode(source, language);
    block.classList.add("syntax-ready");
  });

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
      if (status) status.textContent = "Opening your email client with the message prepared.";
      window.location.href = `mailto:contact@jeremyfontenot.online?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
    });
  }
})();
