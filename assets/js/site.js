if (window.location.hostname.startsWith("www.")) {
  window.location.replace(`${window.location.protocol}//${window.location.hostname.slice(4)}${window.location.pathname}${window.location.search}${window.location.hash}`);
}

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
