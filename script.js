/* ============================================================
   DXK — LITTLE WORKSHOP
   V2 JavaScript
   ============================================================ */


/* ============================================================
   01. CONFIG
   ============================================================ */

const CONFIG = {
    dataFile: "creations.json",

    themeStorageKey: "dxk-theme",

    defaultTheme: "light",

    sparkleCount: 18,

    searchDelay: 80
};


/* ============================================================
   02. GLOBAL STATE
   ============================================================ */

const state = {
    creations: [],

    activeFilter: "all",

    searchTerm: "",

    theme:
        localStorage.getItem(
            CONFIG.themeStorageKey
        ) || CONFIG.defaultTheme
};


/* ============================================================
   03. DOM HELPERS
   ============================================================ */

function $(selector) {
    return document.querySelector(selector);
}


function $all(selector) {
    return Array.from(
        document.querySelectorAll(selector)
    );
}


/* ============================================================
   04. INITIALIZATION
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    init
);


async function init() {

    applyTheme();

    setupThemeToggle();

    setupMascot();

    createSparkles();

    setupSearch();

    setupTabs();

    updateWorkshopStatus(
        "workshop is open ✦"
    );


    try {

        const creations =
            await loadCreations();

        state.creations =
            Array.isArray(creations)
                ? creations
                : [];


        renderCreations();

        updateCounts();

        updateVisibleCount();

    } catch (error) {

        console.error(
            "DXK workshop failed to load:",
            error
        );

        showLoadError();

        updateWorkshopStatus(
            "something spilled on the desk..."
        );

    }

}


/* ============================================================
   05. LOAD CREATIONS
   ============================================================ */

async function loadCreations() {

    const response =
        await fetch(
            CONFIG.dataFile,
            {
                cache: "no-cache"
            }
        );


    if (!response.ok) {

        throw new Error(
            `Could not load ${CONFIG.dataFile}`
        );

    }


    return await response.json();

}


/* ============================================================
   06. RENDER CREATIONS
   ============================================================ */

function renderCreations() {

    const panel =
        $("#tab-all");


    if (!panel) {
        return;
    }


    panel.innerHTML = "";


    if (!state.creations.length) {

        panel.innerHTML =
            createEmptyState(
                "The shelves are empty",
                "Nothing has been logged in the workshop yet. 🌱"
            );

        updateVisibleCount();

        return;
    }


    state.creations.forEach(
        (creation, index) => {

            const entry =
                createEntry(
                    creation,
                    index
                );


            panel.appendChild(entry);

        }
    );


    applyFilters();

}


/* ============================================================
   07. CREATE PROJECT ENTRY
   ============================================================ */

function createEntry(
    creation,
    index
) {

    const article =
        document.createElement("article");


    const status =
        creation.status || "planned";


    const isPlanned =
        creation.isPlanned === true ||
        status === "planned";


    const statusClass =
        isPlanned
            ? "status-planned"
            : "status-stable";


    const statusLabel =
        creation.statusLabel ||
        (
            isPlanned
                ? "☁ sprouting"
                : "✦ ready!"
        );


    const type =
        getProjectType(creation);


    const typeLabel =
        creation.typeLabel ||
        getTypeLabel(type);


    article.className =
        [
            "entry",
            isPlanned
                ? "entry-planned"
                : "entry-stable",
            creation.featured
                ? "entry-featured"
                : ""
        ]
        .filter(Boolean)
        .join(" ");


    article.dataset.status =
        isPlanned
            ? "planned"
            : "stable";


    article.dataset.type =
        type;


    article.dataset.search =
        buildSearchText(
            creation,
            typeLabel
        );


    article.innerHTML = `

        <div class="entry-index">
            ${formatIndex(index + 1)}
        </div>


        <div class="entry-body ${creation.previewImg ? "has-media" : ""}">

            ${
                creation.previewImg
                    ? createMediaHTML(creation)
                    : ""
            }


            <div class="entry-content">

                <div class="entry-top">

                    <div>

                        <h3 class="entry-name">
                            ${escapeHTML(
                                creation.name ||
                                "Untitled creation"
                            )}
                        </h3>

                        <div class="entry-type">
                            ${escapeHTML(typeLabel)}
                        </div>

                    </div>


                    <span class="status-tag ${statusClass}">
                        ${escapeHTML(statusLabel)}
                    </span>

                </div>


                ${
                    creation.meta
                        ? `
                            <p class="entry-meta">
                                ${escapeHTML(
                                    creation.meta
                                )}
                            </p>
                        `
                        : ""
                }


                <p class="entry-desc ${
                    isPlanned
                        ? "entry-desc-muted"
                        : ""
                }">
                    ${
                        escapeHTML(
                            creation.desc ||
                            "No description has been added yet."
                        )
                    }
                </p>


                ${
                    createTagsHTML(creation)
                }


                ${
                    createDetailsHTML(creation)
                }


                <div class="entry-actions">

                    ${
                        createPrimaryAction(
                            creation
                        )
                    }

                    ${
                        createSecondaryAction(
                            creation
                        )
                    }

                    ${
                        creation.hint
                            ? `
                                <span class="entry-hint">
                                    ${sanitizeInlineHTML(
                                        creation.hint
                                    )}
                                </span>
                            `
                            : ""
                    }

                </div>

            </div>

        </div>

    `;


    return article;

}


/* ============================================================
   08. MEDIA
   ============================================================ */

function createMediaHTML(
    creation
) {

    const image =
        creation.previewImg;


    const caption =
        creation.caption ||
        "a little workshop treasure";


    return `

        <figure class="entry-media">

            <img
                src="${escapeAttribute(image)}"
                alt="${escapeAttribute(
                    creation.name || "Project preview"
                )}"
                loading="lazy"
                onerror="this.closest('.entry-media').classList.add('media-error'); this.style.display='none';"
            >


            <div
                class="entry-media-placeholder"
                aria-hidden="true"
            >
                ✿
            </div>


            <figcaption class="media-caption">
                ${escapeHTML(caption)}
            </figcaption>


            ${
                creation.stamp
                    ? `
                        <span class="stamp-badge">
                            ${escapeHTML(
                                creation.stamp
                            )}
                        </span>
                    `
                    : ""
            }

        </figure>

    `;

}


/* ============================================================
   09. TAGS
   ============================================================ */

function createTagsHTML(
    creation
) {

    const tags =
        Array.isArray(creation.tags)
            ? creation.tags
            : [];


    if (!tags.length) {
        return "";
    }


    return `

        <div class="entry-tags">

            ${
                tags
                    .map(
                        tag => `
                            <span class="project-tag">
                                ${escapeHTML(tag)}
                            </span>
                        `
                    )
                    .join("")
            }

        </div>

    `;

}


/* ============================================================
   10. DETAILS
   ============================================================ */

function createDetailsHTML(
    creation
) {

    const hasCode =
        Boolean(
            creation.detailTitle &&
            creation.codeBlock
        );


    const hasStack =
        Array.isArray(
            creation.stack
        ) &&
        creation.stack.length > 0;


    if (!hasCode && !hasStack) {
        return "";
    }


    return `

        <details class="entry-detail">

            <summary>
                ${escapeHTML(
                    creation.detailTitle ||
                    "workshop notes"
                )}
            </summary>


            ${
                hasCode
                    ? `
                        <pre class="code-block"><code>${escapeHTML(
                            creation.codeBlock
                        )}</code></pre>
                    `
                    : ""
            }


            ${
                hasStack
                    ? `
                        <ul class="stack-list">

                            ${
                                creation.stack
                                    .map(
                                        item => `
                                            <li>
                                                ${sanitizeInlineHTML(
                                                    item
                                                )}
                                            </li>
                                        `
                                    )
                                    .join("")
                            }

                        </ul>
                    `
                    : ""
            }

        </details>

    `;

}


/* ============================================================
   11. PRIMARY ACTION
   ============================================================ */

function createPrimaryAction(
    creation
) {

    if (
        creation.downloadUrl
    ) {

        return `

            <a
                class="btn-primary"
                href="${escapeAttribute(
                    creation.downloadUrl
                )}"
                download
            >
                ${escapeHTML(
                    creation.downloadText ||
                    "Get it ✿"
                )}
            </a>

        `;

    }


    if (
        creation.url
    ) {

        return `

            <a
                class="btn-primary"
                href="${escapeAttribute(
                    creation.url
                )}"
                target="_blank"
                rel="noopener noreferrer"
            >
                Open project ↗
            </a>

        `;

    }


    return "";

}


/* ============================================================
   12. SECONDARY ACTION
   ============================================================ */

function createSecondaryAction(
    creation
) {

    if (
        !creation.github
    ) {
        return "";
    }


    return `

        <a
            class="btn-secondary"
            href="${escapeAttribute(
                creation.github
            )}"
            target="_blank"
            rel="noopener noreferrer"
        >
            GitHub ↗
        </a>

    `;

}


/* ============================================================
   13. PROJECT TYPE
   ============================================================ */

/*
    New JSON entries can eventually contain:

        "type": "extension"

    or:

        "type": "tool"
        "type": "game"
        "type": "experiment"

    Existing entries without a type get a conservative
    fallback based on their metadata.
*/

function getProjectType(
    creation
) {

    if (creation.type) {

        return String(
            creation.type
        ).toLowerCase();

    }


    const meta =
        String(
            creation.meta || ""
        ).toLowerCase();


    if (
        meta.includes("browser extension") ||
        meta.includes("extension")
    ) {

        return "extension";

    }


    return "experiment";

}


function getTypeLabel(
    type
) {

    const labels = {

        extension:
            "🌸 Browser extension",

        tool:
            "🧰 Tool",

        game:
            "🎮 Game / game-dev",

        experiment:
            "🧪 Experiment"

    };


    return (
        labels[type] ||
        labels.experiment
    );

}


/* ============================================================
   14. SEARCH TEXT
   ============================================================ */

function buildSearchText(
    creation,
    typeLabel
) {

    const values = [

        creation.name,

        creation.desc,

        creation.meta,

        creation.statusLabel,

        creation.type,

        typeLabel,

        ...(Array.isArray(creation.tags)
            ? creation.tags
            : [])

    ];


    return values
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

}


/* ============================================================
   15. FILTER TABS
   ============================================================ */

function setupTabs() {

    const tabs =
        $all(".tab-btn");


    tabs.forEach(
        tab => {

            tab.addEventListener(
                "click",
                () => {

                    const target =
                        tab.dataset.target ||
                        "tab-all";


                    setActiveFilter(
                        target
                    );

                }
            );

        }
    );

}


function setActiveFilter(
    filter
) {

    state.activeFilter =
        normalizeFilter(filter);


    $all(".tab-btn")
        .forEach(
            tab => {

                const tabFilter =
                    normalizeFilter(
                        tab.dataset.target ||
                        "all"
                    );


                const active =
                    tabFilter ===
                    state.activeFilter;


                tab.classList.toggle(
                    "active",
                    active
                );


                tab.setAttribute(
                    "aria-selected",
                    String(active)
                );

            }
        );


    applyFilters();

}


/* ============================================================
   16. NORMALIZE FILTER
   ============================================================ */

function normalizeFilter(
    filter
) {

    if (!filter) {
        return "all";
    }


    const value =
        String(filter)
            .toLowerCase()
            .trim();


    if (
        value === "tab-all" ||
        value === "all"
    ) {

        return "all";

    }


    if (
        value === "tab-stable" ||
        value === "stable"
    ) {

        return "stable";

    }


    if (
        value === "tab-planned" ||
        value === "planned"
    ) {

        return "planned";

    }


    if (
        value.startsWith("type-")
    ) {

        return value.replace(
            "type-",
            ""
        );

    }


    return value;

}


/* ============================================================
   17. SEARCH
   ============================================================ */

function setupSearch() {

    const input =
        $("#project-search");


    if (!input) {
        return;
    }


    let timeout;


    input.addEventListener(
        "input",
        () => {

            clearTimeout(
                timeout
            );


            timeout =
                setTimeout(
                    () => {

                        state.searchTerm =
                            input.value
                                .trim()
                                .toLowerCase();


                        applyFilters();

                    },
                    CONFIG.searchDelay
                );

        }
    );


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                input.value = "";

                state.searchTerm = "";

                applyFilters();

                input.blur();

            }

        }
    );

}


/* ============================================================
   18. APPLY FILTERS
   ============================================================ */

function applyFilters() {

    const entries =
        $all(".entry");


    if (!entries.length) {

        updateVisibleCount();

        return;
    }


    entries.forEach(
        entry => {

            const matchesFilter =
                matchesActiveFilter(
                    entry
                );


            const matchesSearch =
                matchesSearchTerm(
                    entry
                );


            const visible =
                matchesFilter &&
                matchesSearch;


            entry.hidden =
                !visible;

        }
    );


    updateVisibleCount();

}


/* ============================================================
   19. FILTER MATCH
   ============================================================ */

function matchesActiveFilter(
    entry
) {

    const filter =
        state.activeFilter;


    if (
        filter === "all"
    ) {

        return true;

    }


    if (
        filter === "stable" ||
        filter === "planned"
    ) {

        return (
            entry.dataset.status ===
            filter
        );

    }


    return (
        entry.dataset.type ===
        filter
    );

}


/* ============================================================
   20. SEARCH MATCH
   ============================================================ */

function matchesSearchTerm(
    entry
) {

    if (
        !state.searchTerm
    ) {

        return true;

    }


    return (
        entry.dataset.search || ""
    ).includes(
        state.searchTerm
    );

}


/* ============================================================
   21. COUNTERS
   ============================================================ */

function updateCounts() {

    const total =
        state.creations.length;


    const count =
        $("#entry-count");


    if (count) {

        count.textContent =
            String(total);

    }

}


function updateVisibleCount() {

    const entries =
        $all(".entry");


    const visible =
        entries.filter(
            entry => !entry.hidden
        ).length;


    const count =
        $("#visible-count");


    if (count) {

        count.textContent =
            String(visible);

    }


    const noResults =
        $("#no-results");


    if (noResults) {

        noResults.hidden =
            !entries.length ||
            visible > 0;

    }

}


/* ============================================================
   22. LOAD ERROR
   ============================================================ */

function showLoadError() {

    const panel =
        $("#tab-all");


    if (!panel) {
        return;
    }


    panel.innerHTML = `

        <div class="no-results">

            <div class="no-results-icon">
                🍓
            </div>


            <h3>
                The shelves wouldn't open...
            </h3>


            <p>
                Check that
                <code>creations.json</code>
                is in the same folder as this page.
            </p>

        </div>

    `;

}


/* ============================================================
   23. EMPTY STATE
   ============================================================ */

function createEmptyState(
    title,
    message
) {

    return `

        <div class="no-results">

            <div class="no-results-icon">
                🌱
            </div>


            <h3>
                ${escapeHTML(title)}
            </h3>


            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


/* ============================================================
   24. THEME
   ============================================================ */

function applyTheme() {

    const root =
        document.documentElement;


    const isDark =
        state.theme === "dark";


    if (isDark) {

        root.setAttribute(
            "data-theme",
            "dark"
        );

    } else {

        root.removeAttribute(
            "data-theme"
        );

    }


    updateThemeButton();

}


function setupThemeToggle() {

    const button =
        $("#theme-toggle");


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            state.theme =
                state.theme === "dark"
                    ? "light"
                    : "dark";


            localStorage.setItem(
                CONFIG.themeStorageKey,
                state.theme
            );


            applyTheme();

        }
    );

}


function updateThemeButton() {

    const button =
        $("#theme-toggle");


    if (!button) {
        return;
    }


    const icon =
        button.querySelector(
            ".theme-toggle-icon"
        );


    const label =
        button.querySelector(
            ".theme-toggle-label"
        );


    const isDark =
        state.theme === "dark";


    if (icon) {

        icon.textContent =
            isDark
                ? "☾"
                : "☀";

    }


    if (label) {

        label.textContent =
            isDark
                ? "Dusk"
                : "Cream";

    }


    button.setAttribute(
        "aria-pressed",
        String(isDark)
    );


    button.setAttribute(
        "title",
        isDark
            ? "Switch to Cream theme"
            : "Switch to Dusk theme"
    );

}


/* ============================================================
   25. MASCOT
   ============================================================ */

function setupMascot() {

    const bubble =
        $(".mascot-bubble");


    if (!bubble) {
        return;
    }


    const messages = [

        "welcome! ☁️",

        "please enjoy the little workshop ✿",

        "something cute is brewing... 🌱",

        "don't touch the mysterious button ♡",

        "welcome home, developer ✨",

        "everything here was made with love",

        "the shelves are open! 🌸"

    ];


    let index = 0;


    bubble.addEventListener(
        "click",
        () => {

            index =
                (
                    index + 1
                ) %
                messages.length;


            bubble.textContent =
                messages[index];

        }
    );

}


/* ============================================================
   26. SPARKLES
   ============================================================ */

function createSparkles() {

    const container =
        $(".confetti-container");


    if (!container) {
        return;
    }


    const symbols = [
        "✦",
        "✧",
        "✿",
        "♡",
        "·"
    ];


    for (
        let i = 0;
        i < CONFIG.sparkleCount;
        i++
    ) {

        const sparkle =
            document.createElement(
                "span"
            );


        sparkle.className =
            "sparkle-particle";


        sparkle.textContent =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];


        sparkle.style.left =
            `${Math.random() * 100}%`;


        sparkle.style.animationDuration =
            `${10 + Math.random() * 15}s`;


        sparkle.style.animationDelay =
            `${Math.random() * -20}s`;


        sparkle.style.fontSize =
            `${0.55 + Math.random() * 0.65}rem`;


        container.appendChild(
            sparkle
        );

    }

}


/* ============================================================
   27. WORKSHOP STATUS
   ============================================================ */

function updateWorkshopStatus(
    message
) {

    const status =
        $("#system-status");


    if (status) {

        status.textContent =
            message;

    }


    const deskStatus =
        $("#desk-status");


    if (deskStatus) {

        deskStatus.textContent =
            message;

    }

}


/* ============================================================
   28. INDEX FORMAT
   ============================================================ */

function formatIndex(
    number
) {

    return String(
        number
    ).padStart(
        2,
        "0"
    );

}


/* ============================================================
   29. HTML ESCAPING
   ============================================================ */

/*
    Regular text from JSON goes through these functions
    before being inserted into HTML.

    This is important because creations.json is editable
    content and shouldn't be allowed to accidentally inject
    arbitrary HTML.
*/

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/* ============================================================
   30. LIMITED INLINE HTML
   ============================================================ */

/*
    Your current JSON deliberately contains things like:

        <code>manifest.json</code>

    in the stack.

    We preserve only a tiny whitelist of formatting tags.
    Everything else is escaped.

    Allowed:
        <code>
        <strong>
        <em>
*/

function sanitizeInlineHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    const placeholderOpenCode =
        "___DXK_CODE_OPEN___";

    const placeholderCloseCode =
        "___DXK_CODE_CLOSE___";

    const placeholderOpenStrong =
        "___DXK_STRONG_OPEN___";

    const placeholderCloseStrong =
        "___DXK_STRONG_CLOSE___";

    const placeholderOpenEm =
        "___DXK_EM_OPEN___";

    const placeholderCloseEm =
        "___DXK_EM_CLOSE___";


    let text =
        String(value);


    text =
        text
            .replaceAll(
                "<code>",
                placeholderOpenCode
            )
            .replaceAll(
                "</code>",
                placeholderCloseCode
            )
            .replaceAll(
                "<strong>",
                placeholderOpenStrong
            )
            .replaceAll(
                "</strong>",
                placeholderCloseStrong
            )
            .replaceAll(
                "<em>",
                placeholderOpenEm
            )
            .replaceAll(
                "</em>",
                placeholderCloseEm
            );


    text =
        escapeHTML(text);


    return text
        .replaceAll(
            placeholderOpenCode,
            "<code>"
        )
        .replaceAll(
            placeholderCloseCode,
            "</code>"
        )
        .replaceAll(
            placeholderOpenStrong,
            "<strong>"
        )
        .replaceAll(
            placeholderCloseStrong,
            "</strong>"
        )
        .replaceAll(
            placeholderOpenEm,
            "<em>"
        )
        .replaceAll(
            placeholderCloseEm,
            "</em>"
        );

}