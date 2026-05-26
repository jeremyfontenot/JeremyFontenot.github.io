if (window.location.hostname.startsWith("www.")) {
  window.location.replace(`${window.location.protocol}//${window.location.hostname.slice(4)}${window.location.pathname}${window.location.search}${window.location.hash}`);
}

// Animate numeric counters when they appear in the viewport
(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const counters = [...document.querySelectorAll(".count[data-count]")];
  if (!counters.length) return;

  const animate = (el, to) => {
    if (prefersReducedMotion) {
      el.textContent = String(to);
      return;
    }
    const duration = 900;
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const val = Math.floor(from + (to - from) * t);
      el.textContent = String(val);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = String(to);
    };
    requestAnimationFrame(tick);
  };

  const onIntersect = (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const to = Number(el.getAttribute("data-count")) || 0;
      animate(el, to);
      obs.unobserve(el);
    });
  };

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const obs = new IntersectionObserver(onIntersect, { threshold: 0.2 });
    counters.forEach((c) => obs.observe(c));
  } else {
    counters.forEach((c) => {
      const to = Number(c.getAttribute("data-count")) || 0;
      c.textContent = String(to);
    });
  }

  // Make proof cards and governance signals keyboard accessible
  const cards = [...document.querySelectorAll('.proof-card')];
  cards.forEach((card) => {
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
  });

  const signals = [...document.querySelectorAll('.governance-console .signal')];
  signals.forEach((s) => {
    if (!s.hasAttribute('tabindex')) s.setAttribute('tabindex', '0');
  });

})();

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const filterGroups = document.querySelectorAll("[data-filter-group]");

filterGroups.forEach((group) => {
  const targetSelector = group.getAttribute("data-filter-target");
  if (!targetSelector) return;

  const buttons = [...group.querySelectorAll("[data-filter]")];
  const cards = [...document.querySelectorAll(targetSelector)];

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter") || "all";

      buttons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      cards.forEach((card) => {
        const category = card.getAttribute("data-category") || "";
        const isVisible = filter === "all" || category.split(" ").includes(filter);
        card.hidden = !isVisible;
        if (isVisible) card.classList.add("is-visible");
      });
    });
  });
});

const revealNodes = [...document.querySelectorAll("[data-reveal]")];

if (revealNodes.length) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
    );

    revealNodes.forEach((node) => revealObserver.observe(node));
  }
}
