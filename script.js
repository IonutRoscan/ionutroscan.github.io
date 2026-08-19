document.addEventListener("DOMContentLoaded", async () => {

    // enables the CSS reveal animation only once JS has run
    document.documentElement.classList.add("js-ready");

    // ---- Load and Render Creations from JSON ----
    const panel = document.getElementById("tab-all");
    
    if (panel) {
        try {
            const response = await fetch("creations.json");
            const creations = await response.json();

            panel.innerHTML = ""; // clear loader/placeholder

            creations.forEach(item => {
                const article = document.createElement("article");
                article.className = item.isPlanned ? "entry entry-empty" : "entry";
                article.setAttribute("data-status", item.status);

                if (item.isPlanned) {
                    article.innerHTML = `
                        <div class="entry-index">${item.id}</div>
                        <div class="entry-body">
                            <div class="entry-top">
                                <h3 class="entry-name entry-name-muted">${item.name}</h3>
                                <span class="status-tag status-planned">${item.statusLabel}</span>
                            </div>
                            <p class="entry-desc entry-desc-muted">${item.desc}</p>
                        </div>
                    `;
                } else {
                    let stackHtml = "";
                    if (item.stack && item.stack.length > 0) {
                        stackHtml = `<ul class="stack-list">${item.stack.map(s => `<li>${s}</li>`).join("")}</ul>`;
                    }

                    article.innerHTML = `
                        <div class="entry-index">${item.id}</div>
                        <div class="entry-body has-media">
                            <figure class="entry-media">
                                <img src="${item.previewImg}" alt="Screenshot of ${item.name}">
                                ${item.stamp ? `<span class="stamp-badge">${item.stamp}</span>` : ""}
                                ${item.caption ? `<figcaption class="media-caption">${item.caption}</figcaption>` : ""}
                            </figure>

                            <div class="entry-content">
                                <div class="entry-top">
                                    <h3 class="entry-name">${item.name}</h3>
                                    <span class="status-tag status-stable">${item.statusLabel}</span>
                                </div>

                                <p class="entry-meta">${item.meta}</p>
                                <p class="entry-desc">${item.desc}</p>

                                ${item.codeBlock ? `
                                <details class="entry-detail">
                                    <summary>${item.detailTitle || "Details"}</summary>
                                    <pre class="code-block"><code>${item.codeBlock}</code></pre>
                                    ${stackHtml}
                                </details>` : ""}

                                <div class="entry-actions">
                                    <a class="btn-primary" href="${item.downloadUrl}" download>${item.downloadText}</a>
                                    <span class="entry-hint">${item.hint}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }
                panel.appendChild(article);
            });

            // Update Counts dynamically after injection
            updateCounts();
            setupTabs();

        } catch (e) {
            console.error("Could not load creations.json", e);
        }
    }

    // ---- floating background sparkles / confetti ----
    const confettiContainer = document.querySelector(".confetti-container");
    if (confettiContainer) {
        const symbols = ["✿", "✨", "⭐", "♡", "🌸"];
        const particleCount = 12;

        for (let i = 0; i < particleCount; i++) {
            const span = document.createElement("span");
            span.className = "sparkle-particle";
            span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            span.style.left = `${Math.random() * 100}vw`;
            span.style.animationDelay = `${Math.random() * 8}s`;
            span.style.animationDuration = `${6 + Math.random() * 6}s`;
            confettiContainer.appendChild(span);
        }
    }

    // ---- theme toggle: cream (light) <-> soft dark ----
    const toggle = document.getElementById("theme-toggle");
    const icon = toggle ? toggle.querySelector(".theme-toggle-icon") : null;
    const label = toggle ? toggle.querySelector(".theme-toggle-label") : null;

    const applyThemeUI = isDark => {
        if (icon) icon.textContent = isDark ? "☾" : "☀";
        if (label) label.textContent = isDark ? "Dusk" : "Cream";
        if (toggle) toggle.setAttribute("aria-pressed", String(isDark));
    };

    applyThemeUI(document.documentElement.getAttribute("data-theme") === "dark");

    if (toggle) {
        toggle.addEventListener("click", () => {
            const isDark = document.documentElement.getAttribute("data-theme") === "dark";
            const next = isDark ? "light" : "dark";
            if (next === "dark") {
                document.documentElement.setAttribute("data-theme", "dark");
            } else {
                document.documentElement.removeAttribute("data-theme");
            }
            applyThemeUI(next === "dark");
            try { localStorage.setItem("dxk-theme", next); } catch (e) {}
        });
    }
});

function updateCounts() {
    const count = document.querySelectorAll(".registry .entry").length;
    const countEl = document.getElementById("entry-count");
    if (countEl) countEl.textContent = String(count);

    const stable = document.querySelectorAll('.entry[data-status="stable"]').length;
    const planned = document.querySelectorAll('.entry[data-status="planned"]').length;
    const statusEl = document.getElementById("system-status");
    if (statusEl) statusEl.textContent = `${stable} stable · ${planned} planned`;
}

function setupTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const panel = document.getElementById("tab-all");

    if (tabButtons.length > 0 && panel) {
        tabButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                tabButtons.forEach(b => {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-selected", "true");

                const targetType = btn.getAttribute("data-target");
                const entries = panel.querySelectorAll(".entry");

                entries.forEach(entry => {
                    const status = entry.getAttribute("data-status");
                    if (targetType === "tab-all") {
                        entry.style.display = "grid";
                    } else if (targetType === "tab-stable" && status === "stable") {
                        entry.style.display = "grid";
                    } else if (targetType === "tab-planned" && status === "planned") {
                        entry.style.display = "grid";
                    } else {
                        entry.style.display = "none";
                    }
                });
            });
        });
    }
}
