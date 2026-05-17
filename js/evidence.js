document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".evidence-item");

  items.forEach(item => {
    // Make item focusable + accessible
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.setAttribute("aria-expanded", "false");

    // Toggle function
    const toggleItem = () => {
      const isOpen = item.classList.toggle("open");
      item.setAttribute("aria-expanded", isOpen ? "true" : "false");
    };

    // CLICK HANDLER
    item.addEventListener("click", e => {
      // Ignore clicks on links inside the item
      if (e.target.closest("a")) return;
      toggleItem();
    });

    // KEYBOARD HANDLER
    item.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleItem();
      }
    });
  });
});
