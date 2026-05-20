const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const proofGrid = document.querySelector("#proof-grid");
const proofSearch = document.querySelector("#proof-search");
const proofCount = document.querySelector("#proof-count");
const filterButtons = [...document.querySelectorAll("[data-filter]")];

if (proofGrid && proofSearch && proofCount) {
  let records = [];
  let activeFilter = "all";

  const params = new URLSearchParams(window.location.search);
  const initialProject = params.get("project");
  if (initialProject) {
    proofSearch.value = initialProject;
  }

  const normalize = (value) => String(value || "").toLowerCase();

  const render = () => {
    const query = normalize(proofSearch.value);
    const filtered = records.filter((item) => {
      const typeMatch = activeFilter === "all" || normalize(item.proofType) === activeFilter;
      const haystack = normalize([
        item.title,
        item.summary,
        item.relatedProject,
        item.relatedSkill,
        item.proofType,
        ...(item.tags || [])
      ].join(" "));
      return typeMatch && (!query || haystack.includes(query));
    });

    proofCount.textContent = `${filtered.length} proof artifact${filtered.length === 1 ? "" : "s"} shown`;
    proofGrid.innerHTML = filtered.map((item) => `
      <article class="card proof-card">
        <span class="badge">${item.proofType || "proof"}</span>
        <h2>${item.title}</h2>
        <p>${item.summary}</p>
        <p class="meta">${item.relatedProject || "Portfolio evidence"} · ${item.relatedSkill || "IT operations"} · ${item.fileType || "file"}</p>
        <a class="button" href="/${item.path}">Open artifact</a>
      </article>
    `).join("");
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";
      filterButtons.forEach((item) => item.classList.toggle("active", item === button));
      render();
    });
  });

  proofSearch.addEventListener("input", render);

  fetch("/evidence-library/evidence-search-index.json")
    .then((response) => {
      if (!response.ok) throw new Error(`Proof index unavailable: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      records = Array.isArray(data) ? data : [];
      render();
    })
    .catch(() => {
      proofCount.textContent = "Proof index could not be loaded.";
      proofGrid.innerHTML = `
        <article class="card proof-card">
          <h2>Proof artifacts remain available</h2>
          <p>The static proof files are preserved under /evidence-library/ and /evidence/public/ even if the search index fails to load.</p>
          <a class="button" href="/evidence-library/README.md">Open evidence library README</a>
        </article>
      `;
    });
}
