(() => {
  if (window.location.hostname.startsWith("www.")) {
    window.location.replace(window.location.href.replace("//www.", "//"));
    return;
  }

  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-links");
  if (toggle && menu) {
    const setOpen = (open) => {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    };
    toggle.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));
    menu.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Node)) return;
      if (!menu.classList.contains("is-open")) return;
      if (menu.contains(event.target) || toggle.contains(event.target)) return;
      setOpen(false);
    });
  }

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealNodes = [...document.querySelectorAll("[data-reveal]")];
  if (!prefersReduced && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }
})();
