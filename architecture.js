let scale = 1;
        let offsetX = 0;
        let offsetY = 0;
        let particleIntervals = [];
        let currentLevel = "main";
        let currentNode = null;

        const canvas = document.getElementById("architecture-canvas");
        const backControl = document.getElementById("arch-back-control");
        const archPopup = document.getElementById("arch-node-popup");
        const archLegendMode = document.getElementById("arch-legend-mode");

        function hideNodePopup() {
            if (!archPopup) return;
            archPopup.classList.remove("is-visible");
            archPopup.setAttribute("aria-hidden", "true");
            archPopup.innerHTML = "";
        }

        function showNodePopup(title, description, event, options = {}) {
            if (!archPopup || !canvas || !event) return;

            const viewport = canvas.closest(".architecture-viewport");
            if (!viewport) return;

            const popupTitle = String(title || "Node");
            const popupDescription = String(description || "No description available.");
            const badge = options.badge ? `<span class="arch-node-popup-badge">${options.badge}</span>` : "";

            archPopup.innerHTML = `
                <button type="button" class="arch-node-popup-close" aria-label="Close node details">×</button>
                ${badge}
                <strong>${popupTitle}</strong>
                <p>${popupDescription}</p>
            `;

            const closeButton = archPopup.querySelector(".arch-node-popup-close");
            if (closeButton) {
                closeButton.addEventListener("click", (closeEvent) => {
                    closeEvent.stopPropagation();
                    hideNodePopup();
                });
            }

            const viewportRect = viewport.getBoundingClientRect();
            const xInViewport = event.clientX - viewportRect.left;
            const yInViewport = event.clientY - viewportRect.top;

            const maxLeft = Math.max(12, viewport.clientWidth - 286);
            const left = Math.min(maxLeft, Math.max(12, xInViewport + 16));
            const top = Math.max(12, yInViewport - 18);

            archPopup.style.left = `${left}px`;
            archPopup.style.top = `${top}px`;
            archPopup.classList.add("is-visible");
            archPopup.setAttribute("aria-hidden", "false");
        }

        function setBackControlVisibility(isVisible) {
            if (!backControl) return;
            backControl.classList.toggle("is-visible", Boolean(isVisible));
        }

        const projectsData = {
            "home-lab": {
                title: "Home Lab",
                desc: "Lab environment infrastructure, topology, security baseline, and operations documentation.",
                icon: "🏗️",
                links: [
                    { label: "Infrastructure Overview", href: "./docs/home-lab/index.html" },
                    { label: "Architecture & Topology", href: "./docs/home-lab/architecture-and-topology.html" },
                    { label: "Identity & Access", href: "./docs/home-lab/identity-and-access.html" },
                    { label: "Security Baseline", href: "./docs/home-lab/security-baseline.html" },
                    { label: "Monitoring & Logging", href: "./docs/home-lab/monitoring-and-logging.html" },
                    { label: "Backup & Disaster Recovery", href: "./docs/home-lab/backup-and-disaster-recovery.html" }
                ]
            },
            "m365-docs": {
                title: "M365 Automation",
                desc: "Microsoft 365 cloud infrastructure, automation workflows, and architectural documentation.",
                icon: "☁️",
                links: [
                    { label: "Architecture Overview", href: "./docs/m365-documentation-archive/index.html" },
                    { label: "Automation Workflows", href: "./docs/m365-documentation-archive/aspx/Automation.aspx" },
                    { label: "Artifacts & Index", href: "./docs/m365-documentation-archive/aspx/Artifacts-Index.aspx" },
                    { label: "Architecture Details", href: "./docs/m365-documentation-archive/aspx/Architecture.aspx" }
                ]
            },
            "scripts": {
                title: "Script Documentation",
                desc: "Comprehensive library of PowerShell and automation scripts with validation reports.",
                icon: "⚙️",
                links: [
                    { label: "Script Library", href: "./docs/script-documentation/index.html" },
                    { label: "Validation Results", href: "./docs/script-documentation/validation-results.json" },
                    { label: "M365 Automation Scripts", href: "./scripts/docs/script-documentation/library/m365-automation/index.html" },
                    { label: "Cloud Lab Scripts", href: "./scripts/docs/script-documentation/library/m365-cloud-lab-scripts/index.html" }
                ]
            },
            "brand": {
                title: "Brand Guide",
                desc: "Complete brand identity system with logos, color palettes, and design guidelines.",
                icon: "🎨",
                links: [
                    { label: "Brand Guide Archive", href: "./docs/brandguide-archive/index.html" },
                    { label: "Home", href: "./docs/brandguide-archive/html/Home.html" },
                    { label: "Brand Guidelines", href: "./docs/brandguide-archive/html/Brand-Guidelines.html" },
                    { label: "Logos", href: "./docs/brandguide-archive/html/Logos.html" },
                    { label: "Social Media Kit", href: "./docs/brandguide-archive/html/SocialMediaKit.html" }
                ]
            }
        };

        function updateTransform() {
            canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
        }

        document.addEventListener("wheel", (e) => {
            if (!e.ctrlKey) return;
            if (!e.target.closest(".architecture-viewport")) return;

            e.preventDefault();

            const delta = -e.deltaY * 0.001;
            scale = Math.min(Math.max(0.6, scale + delta), 1.8);

            updateTransform();
        }, { passive: false });

        let isDragging = false;
        let startX, startY;

        canvas.addEventListener("mousedown", (e) => {
            if (currentLevel === "projects") return;
            isDragging = true;
            startX = e.clientX - offsetX;
            startY = e.clientY - offsetY;
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;

            offsetX = e.clientX - startX;
            offsetY = e.clientY - startY;

            updateTransform();
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
        });

function renderDiagram() {
            const svg = document.getElementById("architecture-lines");
            const isProjectsMode = currentLevel === "projects";
            if (archLegendMode) {
                archLegendMode.textContent = isProjectsMode ? "Project Drilldown" : "Main Map";
            }
            particleIntervals.forEach(timerId => clearInterval(timerId));
            particleIntervals = [];
            hideNodePopup();
            canvas.style.minHeight = isProjectsMode ? `${Math.max(600, canvas.closest(".architecture-viewport")?.clientHeight || 600)}px` : "600px";
            canvas.classList.remove("projects-mode");
            canvas.classList.remove("arch-locked");
            setBackControlVisibility(false);

            canvas.querySelectorAll(".arch-card").forEach(card => card.remove());
            svg.innerHTML = `
                <g id="line-layer"></g>
                <g id="particle-layer"></g>
            `;

            const lineLayer = document.getElementById("line-layer");
            const particleLayer = document.getElementById("particle-layer");

    function getNodeAnchor(node, position) {
        const width = node.element ? node.element.offsetWidth : 120;
        const height = node.element ? node.element.offsetHeight : 30;
        const x = (typeof node.x === "number" ? node.x : 0) + width / 2;

        if (position === "bottom") {
            return { x, y: (typeof node.y === "number" ? node.y : 0) + height };
        }

        return { x, y: typeof node.y === "number" ? node.y : 0 };
    }

    function drawDrillLine(start, end) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const controlY = (start.y + end.y) / 2;
        const d = `
        M ${start.x},${start.y}
        C ${start.x},${controlY}
          ${end.x},${controlY}
          ${end.x},${end.y}
    `;

        path.setAttribute("d", d);
        path.setAttribute("class", "arch-line highlight project-drill");
        lineLayer.appendChild(path);

        const timerId = setInterval(() => {
            createParticle(path, true);
        }, 720);

        particleIntervals.push(timerId);
    }

    const nodes = [
        { id: "root", label: "Jeremy Fontenot Site" },
        { id: "shell", label: "index.html" },

        { id: "hero", label: "Landing", desc: "Landing entry point and primary branding section." },
        { id: "about", label: "About", desc: "Professional summary and technical background." },
        { id: "exp", label: "Experience", desc: "Career timeline and technical roles." },
        { id: "projects", label: "Projects", desc: "Core system integrations and documentation hubs.", highlight: true },

        { id: "brand", label: "Brand", desc: "Visual identity system and assets." },
        { id: "tools", label: "Tools", desc: "Operational utilities and workflows." },
        { id: "certs", label: "Certifications", desc: "Professional certifications and credentials." },
        { id: "contact", label: "Contact", desc: "Communication entry point and forms." }
    ];

    const levels = {
        root: 0,
        shell: 1,

        hero: 2,
        about: 2,
        exp: 2,
        projects: 2,

        brand: 3,
        tools: 3,
        certs: 3,
        contact: 3
    };

    function layoutNodes(nodes) {
        const levelMap = {};

        nodes.forEach(n => {
            const level = levels[n.id] || 0;
            if (!levelMap[level]) levelMap[level] = [];
            levelMap[level].push(n);
        });

        // Responsive spacing based on viewport width
        const viewportWidth = canvas.offsetWidth || window.innerWidth;
        const isMobile = viewportWidth < 600;
        const isTablet = viewportWidth < 1024;
        
        let horizontalSpacing = 160;
        let verticalSpacing = 140;
        let canvasWidth = 800;

        if (isMobile) {
            horizontalSpacing = 100;
            verticalSpacing = 180;
            canvasWidth = Math.max(viewportWidth - 40, 300);
        } else if (isTablet) {
            horizontalSpacing = 130;
            verticalSpacing = 160;
            canvasWidth = viewportWidth - 60;
        }

        Object.keys(levelMap).forEach(level => {
            const row = levelMap[level];
            const y = 60 + level * verticalSpacing;

            row.forEach((node, index) => {
                const totalWidth = row.length * horizontalSpacing;
                const startX = (canvasWidth - totalWidth) / 2;

                node.x = startX + index * horizontalSpacing;
                node.y = y;
            });
        });

        return nodes;
    }

    layoutNodes(nodes);

    const connections = [
        ["root", "shell"],

        ["shell", "hero"],
        ["shell", "about"],
        ["shell", "exp"],
        ["shell", "projects"],

        ["shell", "brand"],
        ["shell", "tools"],
        ["shell", "certs"],
        ["shell", "contact"]
    ];

    const graph = {};
    const reverseGraph = {};

    connections.forEach(([from, to]) => {
        if (!graph[from]) graph[from] = [];
        graph[from].push(to);

        if (!reverseGraph[to]) reverseGraph[to] = [];
        reverseGraph[to].push(from);
    });

    function getConnectedNodes(startId) {
        const visited = new Set();
        const result = new Set();

        function dfs(node) {
            if (!graph[node]) return;

            for (const next of graph[node]) {
                if (!visited.has(next)) {
                    visited.add(next);
                    result.add(next);
                    dfs(next);
                }
            }
        }

        visited.add(startId);
        dfs(startId);

        return result;
    }

    function clearTraces() {
        document.querySelectorAll(".arch-line").forEach((line) => {
            line.classList.remove("traced", "faded");
        });
    }

    function collectDirectional(startId, directionalGraph) {
        const visited = new Set();
        const queue = [startId];

        visited.add(startId);

        while (queue.length > 0) {
            const current = queue.shift();
            const neighbors = directionalGraph[current] || [];

            neighbors.forEach((neighbor) => {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            });
        }

        return visited;
    }

    function traceNodePaths(nodeId) {
        if (canvas.classList.contains("arch-locked")) {
            return;
        }

        const descendantSet = collectDirectional(nodeId, graph);
        const ancestorSet = collectDirectional(nodeId, reverseGraph);

        document.querySelectorAll(".arch-line").forEach((line) => {
            const from = line.dataset.from;
            const to = line.dataset.to;
            const sameNode = from === nodeId || to === nodeId;
            const directionalPath = descendantSet.has(from) && descendantSet.has(to);
            const reversePath = ancestorSet.has(from) && ancestorSet.has(to);
            const isRelated = sameNode || directionalPath || reversePath;

            line.classList.toggle("traced", isRelated);
            line.classList.toggle("faded", !isRelated);
        });
    }

    nodes.forEach(node => {
        const el = document.createElement("div");
        el.className = "arch-card";
        if (node.highlight) el.classList.add("highlight");

        el.textContent = node.label;
        el.style.left = node.x + "px";
        el.style.top = node.y + "px";

        canvas.appendChild(el);
        node.element = el;

        el.addEventListener("mouseenter", () => {
            traceNodePaths(node.id);
        });

        el.addEventListener("mouseleave", () => {
            clearTraces();
        });

        el.addEventListener("click", (e) => {
            e.stopPropagation();
            showNodePopup(node.label, node.desc || "No metadata available", e, {
                badge: currentLevel === "projects" ? "Project" : "Node"
            });

            const canvas = document.getElementById("architecture-canvas");
            const inspector = document.getElementById("arch-inspector-body");

            // Check if this is the Projects node and we're on main level
            if (node.id === "projects" && currentLevel === "main") {
                // Switch to projects drill-down view
                currentLevel = "projects";
                currentNode = node;

                const activeViewport = canvas.closest(".architecture-viewport");
                if (activeViewport) {
                    const headerOffset = 112;
                    activeViewport.scrollIntoView({ behavior: "smooth", block: "start" });
                    window.setTimeout(() => {
                        const rect = activeViewport.getBoundingClientRect();
                        const delta = rect.top - headerOffset;
                        if (Math.abs(delta) > 6) {
                            window.scrollBy({ top: delta, behavior: "smooth" });
                        }
                    }, 120);
                }

                // Reset zoom/pan for a predictable centered drill-down layout.
                scale = 1;
                offsetX = 0;
                offsetY = 0;
                updateTransform();

                // Clear canvas and render projects
                canvas.classList.remove("arch-locked");
                canvas.classList.add("projects-mode");
                particleIntervals.forEach(timerId => clearInterval(timerId));
                particleIntervals = [];
                lineLayer.innerHTML = "";
                particleLayer.innerHTML = "";
                canvas.querySelectorAll(".arch-card").forEach(card => card.remove());
                
                inspector.innerHTML = `
                    <strong>Projects & Documentation</strong><br/><br/>
                    Select a project hub to view detailed documentation and structure.
                `;

                // Create project cards
                const projectKeys = Object.keys(projectsData);
                const projectCount = projectKeys.length;
                const viewportElement = canvas.closest(".architecture-viewport");
                const viewportWidth = viewportElement?.clientWidth || canvas.clientWidth || canvas.offsetWidth || window.innerWidth;
                const viewportHeight = viewportElement?.clientHeight || canvas.clientHeight || canvas.offsetHeight || 600;
                canvas.style.minHeight = `${Math.max(600, viewportHeight)}px`;
                const viewportRect = viewportElement?.getBoundingClientRect();
                const isMobile = window.innerWidth < 600;
                const isTablet = window.innerWidth < 1024;
                const isCompactArchitecture = window.innerWidth < 1024;
                const hiddenTop = Math.max(0, -Math.round(viewportRect?.top || 0));
                const topGutter = isMobile ? 24 : (isTablet ? 104 : 116);
                const topSafeY = Math.min(viewportHeight - 220, hiddenTop + topGutter);
                const inspectorPanel = document.getElementById("arch-inspector");
                const inspectorVisible = Boolean(inspectorPanel && !inspectorPanel.classList.contains("is-hidden") && !isMobile);
                const inspectorReservedWidth = inspectorVisible
                    ? (isCompactArchitecture ? 0 : Math.round((isTablet ? 0.72 : 0.82) * inspectorPanel.offsetWidth) + 20)
                    : 0;
                const sidePadding = isMobile ? 16 : isTablet ? 34 : 52;
                const safeLeft = sidePadding;
                const safeRight = Math.max(sidePadding, viewportWidth - sidePadding - inspectorReservedWidth);
                const safeWidth = Math.max(260, safeRight - safeLeft);
                const centerX = safeLeft + safeWidth / 2;
                const centerY = isMobile ? Math.max(250, viewportHeight * 0.36) : isTablet ? Math.max(300, viewportHeight * 0.42) : Math.max(320, viewportHeight * 0.44);
                const angle = (2 * Math.PI) / projectCount;
                const radius = isMobile ? Math.min(132, safeWidth * 0.28) : isTablet ? Math.min(168, safeWidth * 0.33) : Math.min(212, safeWidth * 0.36);
                const cardWidth = isMobile ? Math.max(120, Math.min(145, Math.floor((viewportWidth - 48) / 2))) : isTablet ? 160 : 176;
                const cardHeight = isMobile ? 74 : 80;
                const horizontalSpread = isTablet
                    ? Math.min(300, Math.max(246, safeWidth * 0.36))
                    : Math.min(430, Math.max(340, safeWidth * 0.42));
                const topSpread = isTablet ? 236 : 286;
                const bottomSpread = isTablet ? 250 : 306;
                const mobileGridGap = 16;
                const mobileGridTop = Math.max(170, Math.round(viewportHeight * 0.18));
                const mobileGridLeft = Math.max(16, Math.round((viewportWidth - (cardWidth * 2 + mobileGridGap)) / 2));
                const mobileGridRows = [0, 1].map(row => mobileGridTop + row * 116);
                const drillLayout = [];
                const sideRowY = Math.round(centerY - cardHeight / 2);
                const minScriptGap = isTablet ? 188 : 236;
                const bottomPadding = 20;
                const backControlReserve = isMobile ? 76 : 84;
                const maxScriptY = viewportHeight - cardHeight - backControlReserve - bottomPadding;
                const scriptRowY = Math.min(maxScriptY, sideRowY + minScriptGap);

                const diamondSlots = !isMobile ? {
                    "home-lab": {
                        x: Math.round(centerX - cardWidth / 2),
                        y: Math.round(Math.max(140, centerY - topSpread - cardHeight))
                    },
                    "brand": {
                        x: Math.round(Math.max(safeLeft, centerX - horizontalSpread - cardWidth)),
                        y: Math.round(centerY - cardHeight / 2)
                    },
                    "m365-docs": {
                        x: Math.round(Math.min(safeRight - cardWidth, centerX + horizontalSpread)),
                        y: Math.round(centerY - cardHeight / 2)
                    },
                    "scripts": {
                        x: Math.round(centerX - cardWidth / 2),
                        y: Math.round(scriptRowY)
                    }
                } : null;

                if (diamondSlots) {
                    const topSafe = Math.max(topSafeY + 8, isTablet ? 146 : 136);
                    const bottomSafe = 18;

                    let minY = Math.min(
                        diamondSlots["home-lab"].y,
                        diamondSlots.brand.y,
                        diamondSlots["m365-docs"].y,
                        diamondSlots.scripts.y
                    );

                    let maxY = Math.max(
                        diamondSlots.brand.y + cardHeight,
                        diamondSlots["m365-docs"].y + cardHeight,
                        diamondSlots.scripts.y + cardHeight
                    );

                    let shiftY = 0;

                    if (minY < topSafe) {
                        shiftY += topSafe - minY;
                    }

                    if (maxY + shiftY > viewportHeight - bottomSafe) {
                        shiftY -= (maxY + shiftY) - (viewportHeight - bottomSafe);
                    }

                    if (shiftY !== 0) {
                        Object.keys(diamondSlots).forEach((slotKey) => {
                            diamondSlots[slotKey].y = Math.round(diamondSlots[slotKey].y + shiftY);
                        });
                    }
                }

                projectKeys.forEach((key, idx) => {
                    const project = projectsData[key];
                    const radialX = centerX + radius * Math.cos(idx * angle - Math.PI / 2) - cardWidth / 2;
                    const radialY = centerY + radius * Math.sin(idx * angle - Math.PI / 2) - 14;
                    const rawX = isMobile
                        ? mobileGridLeft + (idx % 2) * (cardWidth + mobileGridGap)
                        : (diamondSlots && diamondSlots[key] ? diamondSlots[key].x : radialX);
                    const x = isMobile
                        ? rawX
                        : Math.max(safeLeft, Math.min(safeRight - cardWidth, rawX));
                    const y = isMobile
                        ? mobileGridRows[Math.floor(idx / 2)]
                        : (diamondSlots && diamondSlots[key] ? diamondSlots[key].y : radialY);

                    const projectCard = document.createElement("div");
                    projectCard.className = "arch-card project-card-drill";
                    projectCard.textContent = `${project.icon} ${project.title}`;
                    projectCard.style.left = x + "px";
                    projectCard.style.top = y + "px";
                    projectCard.style.width = cardWidth + "px";
                    projectCard.style.minHeight = cardHeight + "px";
                    projectCard.style.whiteSpace = "normal";
                    projectCard.dataset.projectKey = key;

                    projectCard.addEventListener("click", (evt) => {
                        evt.stopPropagation();
                        
                        // Show project details in inspector
                        const projectData = projectsData[key];
                        showNodePopup(projectData.title, projectData.desc, evt, { badge: "Project" });
                        let linksHtml = "<div style='max-height: 400px; overflow-y: auto;'>";
                        
                        linksHtml += `<strong>${projectData.icon} ${projectData.title}</strong><br/><br/>`;
                        linksHtml += `<p style='font-size: 0.85rem; color: #a0b5cf; margin-bottom: 1rem;'>${projectData.desc}</p>`;
                        linksHtml += "<div style='border-top: 1px solid rgba(56,189,248,0.2); padding-top: 0.8rem;'>";
                        linksHtml += "<p style='font-size: 0.8rem; font-weight: 600; margin-bottom: 0.6rem; color: #38bdf8;'>Documentation:</p>";
                        
                        projectData.links.forEach(link => {
                            linksHtml += `<a href="${link.href}" target="_blank" rel="noopener noreferrer" style='display: block; padding: 0.5rem 0.8rem; margin-bottom: 0.4rem; background: rgba(56,189,248,0.08); border-left: 2px solid #0ea5e9; color: #38bdf8; text-decoration: none; border-radius: 4px; font-size: 0.85rem; transition: all 0.2s;'>→ ${link.label}</a>`;
                        });
                        
                        linksHtml += "</div></div>";
                        inspector.innerHTML = linksHtml;

                        // Highlight this project card
                        document.querySelectorAll(".project-card-drill").forEach(c => c.classList.remove("focused"));
                        projectCard.classList.add("focused");
                    });

                    canvas.appendChild(projectCard);
                    drillLayout.push({ key, x, y, card: projectCard, isAboveHub: y < centerY });
                });

                if (!isMobile) {
                    const hub = { x: centerX, y: centerY };
                    const hubDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    hubDot.setAttribute("cx", String(hub.x));
                    hubDot.setAttribute("cy", String(hub.y));
                    hubDot.setAttribute("r", "5");
                    hubDot.setAttribute("class", "flow-particle highlight project-hub-dot");
                    particleLayer.appendChild(hubDot);

                    drillLayout.forEach(item => {
                        const projectCardHeight = item.card.offsetHeight || cardHeight;
                        const projectCardWidth = item.card.offsetWidth || cardWidth;
                        const cardCenterX = item.x + cardWidth / 2;
                        const cardCenterY = item.y + projectCardHeight / 2;

                        let targetX = cardCenterX;
                        let targetY = cardCenterY;

                        const dx = cardCenterX - hub.x;
                        const dy = cardCenterY - hub.y;

                        if (Math.abs(dx) > Math.abs(dy) * 1.15) {
                            targetX = dx > 0 ? item.x : item.x + projectCardWidth;
                            targetY = cardCenterY;
                        } else {
                            targetX = cardCenterX;
                            targetY = dy > 0 ? item.y : item.y + projectCardHeight;
                        }

                        drawDrillLine(
                            { x: hub.x, y: hub.y },
                            { x: targetX, y: targetY }
                        );
                    });
                }
                setBackControlVisibility(true);
                return;
            }

            // If we're in projects view and clicking something else, go back
            if (currentLevel === "projects" && node.id !== "projects") {
                return;
            }

            // Standard node click for main level
            inspector.innerHTML = `
                <strong>${node.label}</strong><br/><br/>
                ${node.desc || "No metadata available"}
            `;

            // toggle lock
            const isLocked = canvas.classList.contains("arch-locked");

            // reset everything first
            document.querySelectorAll(".arch-card").forEach(c => {
                c.classList.remove("focused");
            });

            document.querySelectorAll(".arch-line").forEach(l => {
                l.classList.remove("focused");
            });

            if (!isLocked) {
                canvas.classList.add("arch-locked");

                el.classList.add("focused");

                const connected = getConnectedNodes(node.id);

                document.querySelectorAll(".arch-line").forEach(l => {
                    const isRelated = l.dataset.from === node.id || l.dataset.to === node.id;
                    if (isRelated) {
                        l.classList.add("focused");
                    }
                });

            } else {
                canvas.classList.remove("arch-locked");
            }
        });
    });

    document.getElementById("architecture-canvas").addEventListener("click", () => {
        const canvas = document.getElementById("architecture-canvas");
        hideNodePopup();

        // If we're in projects view, return to main
        if (currentLevel === "projects") {
            currentLevel = "main";
            currentNode = null;
            renderDiagram();
            return;
        }

        canvas.classList.remove("arch-locked");
        clearTraces();

        document.querySelectorAll(".arch-card").forEach(c => {
            c.classList.remove("focused");
        });

        document.querySelectorAll(".arch-line").forEach(l => {
            l.classList.remove("focused");
        });
    });


    function connect(a, b, highlight = false) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        const start = getNodeAnchor(a, "bottom");
        const end = getNodeAnchor(b, "top");
        const startX = start.x;
        const startY = start.y;
        const endX = end.x;
        const endY = end.y;

        // control points for smooth curve
        const controlY = (startY + endY) / 2;

        const d = `
        M ${startX},${startY}
        C ${startX},${controlY}
          ${endX},${controlY}
          ${endX},${endY}
    `;

        path.setAttribute("d", d);
        path.setAttribute("class", highlight ? "arch-line highlight" : "arch-line");
        path.dataset.from = a.id;
        path.dataset.to = b.id;

        lineLayer.appendChild(path);

        const timerId = setInterval(() => {
            const shouldHighlight = path.classList.contains("highlight");
            createParticle(path, shouldHighlight);
        }, 900);

        particleIntervals.push(timerId);
    }

    function createParticle(path, highlight = false) {
        const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        particle.setAttribute("r", "3");
        particle.setAttribute("class", highlight ? "flow-particle highlight" : "flow-particle");

        particleLayer.appendChild(particle);

        const length = path.getTotalLength();
        let progress = 0;

        function animate() {
            progress += 1.2;

            if (progress > length) {
                particle.remove();
                return;
            }

            const point = path.getPointAtLength(progress);

            particle.setAttribute("cx", point.x);
            particle.setAttribute("cy", point.y);

            requestAnimationFrame(animate);
        }

        animate();
    }

    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

    connections.forEach(([from, to]) => {
        connect(nodeMap[from], nodeMap[to], to === "projects");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderDiagram();

    if (backControl) {
        backControl.addEventListener("click", (evt) => {
            evt.stopPropagation();
            if (currentLevel !== "projects") return;
            currentLevel = "main";
            currentNode = null;
            renderDiagram();
        });
    }

    const architectureSection = document.getElementById("architecture");
    const inspector = document.getElementById("arch-inspector");
    const hideInspectorButton = document.getElementById("arch-inspector-hide");
    const showInspectorButton = document.getElementById("arch-inspector-show");
    let inspectorManuallyHidden = false;

    function isArchitectureSectionVisible() {
        if (!architectureSection) return false;

        const rect = architectureSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        return rect.top < viewportHeight * 0.85 && rect.bottom > viewportHeight * 0.2;
    }

    function syncInspectorVisibility() {
        if (!inspector || !showInspectorButton) return;

        const inArchitectureView = isArchitectureSectionVisible();

        if (!inArchitectureView) {
            inspector.classList.add("is-hidden");
            showInspectorButton.classList.remove("is-visible");
            return;
        }

        if (inspectorManuallyHidden) {
            inspector.classList.add("is-hidden");
            showInspectorButton.classList.add("is-visible");
        } else {
            inspector.classList.remove("is-hidden");
            showInspectorButton.classList.remove("is-visible");
        }
    }

    if (inspector && hideInspectorButton && showInspectorButton) {
        hideInspectorButton.addEventListener("click", () => {
            inspectorManuallyHidden = true;
            syncInspectorVisibility();
        });

        showInspectorButton.addEventListener("click", () => {
            inspectorManuallyHidden = false;
            syncInspectorVisibility();
        });

        window.addEventListener("scroll", syncInspectorVisibility, { passive: true });
        window.addEventListener("resize", syncInspectorVisibility);
        syncInspectorVisibility();
    }

    let resizeRenderTimer = null;
    window.addEventListener("resize", () => {
        if (resizeRenderTimer) {
            clearTimeout(resizeRenderTimer);
        }

        resizeRenderTimer = setTimeout(() => {
            renderDiagram();
        }, 120);
    });
});
