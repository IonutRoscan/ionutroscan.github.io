/* ============================================================
   DXK — LITTLE WORKSHOP
   Main site controller
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

    /* ----------------------------------------------------------
       INITIAL STATE
       ---------------------------------------------------------- */

    document.documentElement.classList.add("js-ready");

    const panel = document.getElementById("tab-all");

    if (!panel) {
        console.warn("DXK: #tab-all was not found.");
        return;
    }


    /* ----------------------------------------------------------
       THEME
       ---------------------------------------------------------- */

    setupTheme();


    /* ----------------------------------------------------------
       BACKGROUND SPARKLES
       ---------------------------------------------------------- */

    createSparkles();


    /* ----------------------------------------------------------
       LOAD PROJECTS
       ---------------------------------------------------------- */

    let creations = [];

    try {
        const response = await fetch("creations.json", {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        creations = await response.json();

        if (!Array.isArray(creations)) {
            throw new Error("creations.json must contain an array.");
        }

    } catch (error) {
        console.error("DXK: Could not load creations.json.", error);

        panel.innerHTML = `
            <article class="entry entry-empty">
                <div class="entry-index">!</div>

                <div class="entry-body">
                    <div class="entry-top">
                        <h3 class="entry-name entry-name-muted">
                            Workshop sleepy...
                        </h3>

                        <span class="status-tag status-planned">
                            ☁ error
                        </span>
                    </div>

                    <p class="entry-desc entry-desc-muted">
                        I couldn't open the workshop inventory right now.
                        Please check that <code>creations.json</code> exists
                        and is valid JSON.
                    </p>
                </div>
            </article>
        `;

        return;
    }


    /* ----------------------------------------------------------
       RENDER
       ---------------------------------------------------------- */

    renderCreations(creations, panel);

    updateCounts(creations);

    setupTabs(creations, panel);

    setupSearch(creations, panel);

    setupMascot();

});


/* ============================================================
   RENDER PROJECTS
   ============================================================ */

function renderCreations(creations, panel) {

    panel.innerHTML = "";

    if (creations.length === 0) {
        panel.innerHTML = `
            <article class="entry entry-empty">
                <div class="entry-index">♡</div>

                <div class="entry-body">
                    <div class="entry-top">
                        <h3 class="entry-name entry-name-muted">
                            The shelves are empty...
                        </h3>

                        <span class="status-tag status-planned">
                            ☁ quiet
                        </span>
                    </div>

                    <p class="entry-desc entry-desc-muted">
                        Nothing has been added to the workshop yet.
                    </p>
                </div>
            </article>
        `;

        return;
    }


    creations.forEach((item, index) => {

        const article = document.createElement("article");

        article.className =
            item.isPlanned
                ? "entry entry-empty"
                : "entry";

        article.dataset.status = item.status || "unknown";
        article.dataset.type = item.type || "other";
        article.dataset.name = (item.name || "").toLowerCase();
        article.dataset.index = index;


        /* ------------------------------------------------------
           PLANNED / WIP ENTRY
           ------------------------------------------------------ */

        if (item.isPlanned) {

            article.innerHTML = `
                <div class="entry-index">
                    ${escapeHTML(item.id || String(index + 1).padStart(3, "0"))}
                </div>

                <div class="entry-body">

                    <div class="entry-top">

                        <h3 class="entry-name entry-name-muted">
                            ${escapeHTML(item.name || "Unnamed project")}
                        </h3>

                        <span class="status-tag status-planned">
                            ${escapeHTML(item.statusLabel || "☁ sprouting")}
                        </span>

                    </div>

                    ${
                        item.typeLabel
                            ? `<p class="entry-meta">
                                ${escapeHTML(item.typeLabel)}
                               </p>`
                            : ""
                    }

                    <p class="entry-desc entry-desc-muted">
                        ${escapeHTML(item.desc || "")}
                    </p>

                </div>
            `;

            panel.appendChild(article);

            return;
        }


        /* ------------------------------------------------------
           NORMAL PROJECT
           ------------------------------------------------------ */

        const stackHtml =
            Array.isArray(item.stack) && item.stack.length
                ? `
                    <ul class="stack-list">
                        ${item.stack
                            .map(stackItem =>
                                `<li>${escapeHTML(stackItem)}</li>`
                            )
                            .join("")}
                    </ul>
                  `
                : "";


        const tagsHtml =
            Array.isArray(item.tags) && item.tags.length
                ? `
                    <div class="entry-tags">
                        ${item.tags
                            .map(tag =>
                                `<span class="project-tag">
                                    ${escapeHTML(tag)}
                                 </span>`
                            )
                            .join("")}
                    </div>
                  `
                : "";


        const githubButton =
            item.githubUrl
                ? `
                    <a
                        class="btn-secondary"
                        href="${escapeAttribute(item.githubUrl)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ♡ GitHub
                    </a>
                  `
                : "";


        article.innerHTML = `

            <div class="entry-index">
                ${escapeHTML(item.id || String(index + 1).padStart(3, "0"))}
            </div>

            <div class="entry-body has-media">

                <figure class="entry-media">

                    ${
                        item.previewImg
                            ? `
                                <img
                                    src="${escapeAttribute(item.previewImg)}"
                                    alt="Preview of ${escapeAttribute(item.name || "project")}"
                                    loading="lazy"
                                >
                              `
                            : `
                                <div class="entry-media-placeholder">
                                    ${escapeHTML(item.icon || "✿")}
                                </div>
                              `
                    }

                    ${
                        item.stamp
                            ? `
                                <span class="stamp-badge">
                                    ${escapeHTML(item.stamp)}
                                </span>
                              `
                            : ""
                    }

                    ${
                        item.caption
                            ? `
                                <figcaption class="media-caption">
                                    ${escapeHTML(item.caption)}
                                </figcaption>
                              `
                            : ""
                    }

                </figure>


                <div class="entry-content">

                    <div class="entry-top">

                        <h3 class="entry-name">
                            ${escapeHTML(item.name || "Unnamed project")}
                        </h3>

                        <span class="status-tag status-stable">
                            ${escapeHTML(item.statusLabel || "✦ ready!")}
                        </span>

                    </div>


                    ${
                        item.typeLabel
                            ? `
                                <p class="entry-type">
                                    ${escapeHTML(item.typeLabel)}
                                </p>
                              `
                            : ""
                    }


                    ${
                        item.meta
                            ? `
                                <p class="entry-meta">
                                    ${escapeHTML(item.meta)}
                                </p>
                              `
                            : ""
                    }


                    <p class="entry-desc">
                        ${escapeHTML(item.desc || "")}
                    </p>


                    ${tagsHtml}


                    ${
                        item.codeBlock
                            ? `
                                <details class="entry-detail">

                                    <summary>
                                        ${escapeHTML(
                                            item.detailTitle || "Details"
                                        )}
                                    </summary>

                                    <pre class="code-block"><code>${escapeHTML(
                                        item.codeBlock
                                    )}</code></pre>

                                    ${stackHtml}

                                </details>
                              `
                            : stackHtml
                              ? `
                                <details class="entry-detail">

                                    <summary>
                                        ✿ little details
                                    </summary>

                                    ${stackHtml}

                                </details>
                              `
                              : ""
                    }


                    <div class="entry-actions">

                        ${
                            item.downloadUrl
                                ? `
                                    <a
                                        class="btn-primary"
                                        href="${escapeAttribute(item.downloadUrl)}"
                                        ${
                                            item.downloadUrl.endsWith(".zip")
                                                ? "download"
                                                : ""
                                        }
                                    >
                                        ${escapeHTML(
                                            item.downloadText || "♡ Open"
                                        )}
                                    </a>
                                  `
                                : ""
                        }

                        ${githubButton}

                        ${
                            item.hint
                                ? `
                                    <span class="entry-hint">
                                        ${escapeHTML(item.hint)}
                                    </span>
                                  `
                                : ""
                        }

                    </div>

                </div>

            </div>
        `;


        /* ------------------------------------------------------
           FEATURED PROJECT
           ------------------------------------------------------ */

        if (item.featured) {
            article.classList.add("entry-featured");
        }


        panel.appendChild(article);

    });

}


/* ============================================================
   TABS / FILTERS
   ============================================================ */

function setupTabs(creations, panel) {

    const tabButtons = document.querySelectorAll(".tab-btn");

    if (!tabButtons.length) {
        return;
    }


    tabButtons.forEach(button => {

        button.addEventListener("click", () => {

            tabButtons.forEach(btn => {
                btn.classList.remove("active");
                btn.setAttribute("aria-selected", "false");
            });


            button.classList.add("active");
            button.setAttribute("aria-selected", "true");


            const target = button.dataset.target || "tab-all";


            panel.querySelectorAll(".entry").forEach(entry => {

                const status = entry.dataset.status;
                const type = entry.dataset.type;


                let visible = true;


                if (target === "tab-stable") {
                    visible = status === "stable";
                }

                else if (target === "tab-planned") {
                    visible =
                        status === "planned" ||
                        status === "wip";
                }

                else if (target.startsWith("type-")) {
                    const targetType =
                        target.replace("type-", "");

                    visible = type === targetType;
                }


                entry.hidden = !visible;

            });


            updateVisibleCount(panel);

        });

    });

}


/* ============================================================
   SEARCH
   ============================================================ */

function setupSearch(creations, panel) {

    const search =
        document.getElementById("project-search");

    if (!search) {
        return;
    }


    search.addEventListener("input", () => {

        const query =
            search.value
                .trim()
                .toLowerCase();


        panel.querySelectorAll(".entry").forEach(entry => {

            const name =
                entry.dataset.name || "";

            const type =
                entry.dataset.type || "";

            const text =
                entry.textContent.toLowerCase();


            const matches =
                !query ||
                name.includes(query) ||
                type.includes(query) ||
                text.includes(query);


            entry.hidden = !matches;

        });


        updateVisibleCount(panel);

    });

}


/* ============================================================
   COUNTERS
   ============================================================ */

function updateCounts(creations) {

    const countEl =
        document.getElementById("entry-count");

    const statusEl =
        document.getElementById("system-status");


    const stable =
        creations.filter(
            item => item.status === "stable"
        ).length;


    const planned =
        creations.filter(
            item =>
                item.status === "planned" ||
                item.status === "wip"
        ).length;


    if (countEl) {
        countEl.textContent =
            String(creations.length);
    }


    if (statusEl) {

        statusEl.textContent =
            `${stable} stable · ${planned} sprouting`;

    }

}


/* ============================================================
   VISIBLE RESULT COUNTER
   ============================================================ */

function updateVisibleCount(panel) {

    const visible =
        panel.querySelectorAll(
            ".entry:not([hidden])"
        ).length;


    const countEl =
        document.getElementById("visible-count");


    if (countEl) {
        countEl.textContent =
            String(visible);
    }

}


/* ============================================================
   THEME
   ============================================================ */

function setupTheme() {

    const toggle =
        document.getElementById("theme-toggle");

    const icon =
        toggle
            ? toggle.querySelector(".theme-toggle-icon")
            : null;

    const label =
        toggle
            ? toggle.querySelector(".theme-toggle-label")
            : null;


    let savedTheme = null;

    try {
        savedTheme =
            localStorage.getItem("dxk-theme");
    } catch (error) {
        savedTheme = null;
    }


    if (savedTheme === "dark") {
        document.documentElement.dataset.theme = "dark";
    }


    function updateUI(isDark) {

        if (icon) {
            icon.textContent =
                isDark ? "☾" : "☀";
        }

        if (label) {
            label.textContent =
                isDark ? "Dusk" : "Cream";
        }

        if (toggle) {
            toggle.setAttribute(
                "aria-pressed",
                String(isDark)
            );
        }

    }


    updateUI(
        document.documentElement.dataset.theme === "dark"
    );


    if (!toggle) {
        return;
    }


    toggle.addEventListener("click", () => {

        const isDark =
            document.documentElement.dataset.theme === "dark";


        if (isDark) {

            document.documentElement.removeAttribute(
                "data-theme"
            );

            updateUI(false);

            try {
                localStorage.setItem(
                    "dxk-theme",
                    "light"
                );
            } catch (error) {}

        }

        else {

            document.documentElement.dataset.theme =
                "dark";

            updateUI(true);

            try {
                localStorage.setItem(
                    "dxk-theme",
                    "dark"
                );
            } catch (error) {}

        }

    });

}


/* ============================================================
   FLOATING SPARKLES
   ============================================================ */

function createSparkles() {

    const container =
        document.querySelector(
            ".confetti-container"
        );


    if (!container) {
        return;
    }


    const symbols = [
        "✿",
        "✧",
        "♡",
        "✦",
        "·"
    ];


    const particleCount = 14;


    for (
        let i = 0;
        i < particleCount;
        i++
    ) {

        const particle =
            document.createElement("span");


        particle.className =
            "sparkle-particle";


        particle.textContent =
            symbols[
                Math.floor(
                    Math.random() * symbols.length
                )
            ];


        particle.style.left =
            `${Math.random() * 100}vw`;


        particle.style.animationDelay =
            `${Math.random() * 8}s`;


        particle.style.animationDuration =
            `${7 + Math.random() * 7}s`;


        particle.style.fontSize =
            `${0.6 + Math.random() * 0.5}rem`;


        container.appendChild(particle);

    }

}


/* ============================================================
   MASCOT
   ============================================================ */

function setupMascot() {

    const mascot =
        document.querySelector(".hero-mascot");


    if (!mascot) {
        return;
    }


    const bubble =
        mascot.querySelector(".mascot-bubble");


    if (!bubble) {
        return;
    }


    const messages = [
        "welcome! ♡",
        "have a look around ✿",
        "something cute is brewing...",
        "ooh, shiny! ✨",
        "welcome to my workshop!",
        "please don't break anything... ♡"
    ];


    mascot.addEventListener("mouseenter", () => {

        const message =
            messages[
                Math.floor(
                    Math.random() * messages.length
                )
            ];


        bubble.textContent =
            message;

    });

}


/* ============================================================
   HTML SAFETY HELPERS
   ============================================================ */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}