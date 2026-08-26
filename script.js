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
   MASCOT MESSAGES
   ============================================================ */

const MASCOT_MESSAGES = [
    "welcome! ☁️",
    "please enjoy the little workshop ✿",
    "something cute is brewing... 🌱",
    "don't touch the mysterious button ♡",
    "welcome home, developer ✨",
    "everything here was made with love",
    "the shelves are open! 🌸",
    "take your time looking around ♡",
    "a quiet corner for little tools ☁️"
];


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
        ) || CONFIG.defaultTheme,

    /* Used so closing the scrapbook returns focus */
    lastFocusedCard: null
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
   07. PROJECT PREVIEW MEDIA
   ============================================================ */

/*
    Projects can use either the original single-image format:

        "previewImg": "example.png"

    or the newer gallery format:

        "previewImages": [
            "example-a.png",
            {
                "src": "example-b.png",
                "caption": "another view",
                "alt": "Description of the image"
            }
        ]

    Keeping both formats means older workshop entries continue to work.
*/
function getCreationPreviewImages(
    creation
) {

    const rawItems =
        Array.isArray(
            creation.previewImages
        )
            ? creation.previewImages
            : (
                creation.previewImg
                    ? [
                        {
                            src:
                                creation.previewImg,
                            caption:
                                creation.caption || "",
                            alt:
                                creation.name ||
                                "Project preview"
                        }
                    ]
                    : []
            );


    return rawItems
        .map(
            item => {

                if (
                    typeof item === "string"
                ) {

                    return {
                        src:
                            item,
                        caption:
                            "",
                        alt:
                            creation.name ||
                            "Project preview"
                    };

                }


                if (
                    !item ||
                    typeof item !== "object" ||
                    typeof item.src !== "string"
                ) {
                    return null;
                }


                return {
                    src:
                        item.src,
                    caption:
                        item.caption || "",
                    alt:
                        item.alt ||
                        creation.name ||
                        "Project preview"
                };

            }
        )
        .filter(
            item =>
                item &&
                item.src.trim()
        );

}


function getPrimaryPreview(
    creation
) {

    return (
        getCreationPreviewImages(
            creation
        )[0] ||
        null
    );

}


/* ============================================================
   08. CREATE PROJECT ENTRY
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


    /* Stable ID for scrapbook lookup (preferred over array index) */
    if (creation.id) {
        article.dataset.id =
            String(creation.id);
    }


    article.innerHTML = `

        <div class="entry-index">
            ${formatIndex(index + 1)}
        </div>


        <div class="entry-body ${getCreationPreviewImages(creation).length ? "has-media" : ""}">

            ${
                getCreationPreviewImages(creation).length
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

    const previews =
        getCreationPreviewImages(
            creation
        );


    const image =
        previews[0];


    if (!image) {
        return "";
    }


    const caption =
        image.caption ||
        creation.caption ||
        "a little workshop treasure";


    const extraCount =
        Math.max(
            0,
            previews.length - 1
        );


    return `

        <figure class="entry-media">

            <img
                src="${escapeAttribute(image.src)}"
                alt="${escapeAttribute(image.alt)}"
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
                extraCount > 0
                    ? `
                        <span
                            class="entry-media-count"
                            title="${previews.length} preview images"
                        >
                            +${extraCount} photo${extraCount === 1 ? "" : "s"}
                        </span>
                    `
                    : ""
            }


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


    /* Global "/" focuses the search box (when not typing) */
    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "/" ||
                event.metaKey ||
                event.ctrlKey ||
                event.altKey
            ) {
                return;
            }


            const active =
                document.activeElement;


            const isTyping =
                active &&
                (
                    active.tagName === "INPUT" ||
                    active.tagName === "TEXTAREA" ||
                    active.isContentEditable
                );


            if (isTyping) {
                return;
            }


            /* Don't steal focus while scrapbook is open */
            if (
                scrapbookOverlay &&
                !scrapbookOverlay.hidden
            ) {
                return;
            }


            event.preventDefault();

            input.focus();

            input.select();

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


    /* Random greeting on every visit */
    let index =
        Math.floor(
            Math.random() *
            MASCOT_MESSAGES.length
        );


    bubble.textContent =
        MASCOT_MESSAGES[index];


    bubble.addEventListener(
        "click",
        () => {

            index =
                (
                    index + 1
                ) %
                MASCOT_MESSAGES.length;


            bubble.textContent =
                MASCOT_MESSAGES[index];

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

/* ============================================================
   31. SCRAPBOOK PROJECT VIEWER
   ============================================================ */

let scrapbookOverlay = null;


/* ------------------------------------------------------------
   CREATE VIEWER
   ------------------------------------------------------------ */

function createScrapbookViewer() {

    if (document.querySelector(".scrapbook-overlay")) {
        return;
    }


    const overlay =
        document.createElement("div");


    overlay.className =
        "scrapbook-overlay";


    overlay.hidden = true;


    overlay.innerHTML = `

        <div
            class="scrapbook-backdrop"
            data-scrapbook-close
        ></div>


        <section
            class="scrapbook-window"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scrapbook-title"
            tabindex="-1"
        >

            <button
                class="scrapbook-close"
                type="button"
                aria-label="Close project"
                data-scrapbook-close
            >
                ×
            </button>


            <div class="scrapbook-paper">


                <div class="scrapbook-header">

                    <div class="scrapbook-eyebrow">
                        <span
                            id="scrapbook-type"
                        >
                            🧪 PROJECT
                        </span>

                        <span
                            id="scrapbook-status"
                        >
                            ✦ ready!
                        </span>
                    </div>


                    <h2
                        id="scrapbook-title"
                        class="scrapbook-title"
                    >
                        Project
                    </h2>


                    <p
                        id="scrapbook-meta"
                        class="scrapbook-meta"
                    ></p>

                </div>


                <div class="scrapbook-content">


                    <div
                        id="scrapbook-media"
                        class="scrapbook-media"
                    >
                    </div>


                    <div
                        id="scrapbook-description"
                        class="scrapbook-description"
                    >
                    </div>


                    <div
                        id="scrapbook-tags"
                        class="scrapbook-tags"
                    >
                    </div>


                    <div
                        id="scrapbook-details"
                        class="scrapbook-details"
                    >
                    </div>


                    <div
                        id="scrapbook-stack"
                        class="scrapbook-stack"
                    >
                    </div>


                    <div
                        id="scrapbook-actions"
                        class="scrapbook-actions"
                    >
                    </div>


                </div>


                <div class="scrapbook-footer">

                    <span>
                        ✿ little workshop archive ✿
                    </span>

                </div>


            </div>

        </section>

    `;


    document.body.appendChild(
        overlay
    );


    scrapbookOverlay =
        overlay;


    setupScrapbookEvents();

}


/* ------------------------------------------------------------
   EVENTS
   ------------------------------------------------------------ */

function setupScrapbookEvents() {

    if (!scrapbookOverlay) {
        return;
    }


    scrapbookOverlay.addEventListener(
        "click",
        event => {

            const closeTarget =
                event.target.closest(
                    "[data-scrapbook-close]"
                );


            if (closeTarget) {

                closeScrapbook();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !scrapbookOverlay.hidden
            ) {

                closeScrapbook();

            }

        }
    );

}


/* ------------------------------------------------------------
   OPEN PROJECT
   ------------------------------------------------------------ */

function openScrapbook(
    creation
) {

    if (!creation) {
        return;
    }


    if (!scrapbookOverlay) {

        createScrapbookViewer();

    }


    populateScrapbook(
        creation
    );


    scrapbookOverlay.hidden =
        false;


    document.body.classList.add(
        "scrapbook-open"
    );


    requestAnimationFrame(
        () => {

            scrapbookOverlay.classList.add(
                "is-visible"
            );

        }
    );


    const windowElement =
        scrapbookOverlay.querySelector(
            ".scrapbook-window"
        );


    if (windowElement) {

        windowElement.focus();

    }


    document.body.dataset.previousOverflow =
        document.body.style.overflow;


    document.body.style.overflow =
        "hidden";

}


/* ------------------------------------------------------------
   CLOSE PROJECT
   ------------------------------------------------------------ */

function closeScrapbook() {

    if (
        !scrapbookOverlay ||
        scrapbookOverlay.hidden
    ) {

        return;

    }


    scrapbookOverlay.classList.remove(
        "is-visible"
    );


    setTimeout(
        () => {

            if (!scrapbookOverlay) {
                return;
            }


            scrapbookOverlay.hidden =
                true;


            document.body.classList.remove(
                "scrapbook-open"
            );


            document.body.style.overflow =
                document.body.dataset.previousOverflow ||
                "";


            /* Return focus to the card that opened the viewer */
            if (
                state.lastFocusedCard &&
                document.body.contains(
                    state.lastFocusedCard
                )
            ) {

                state.lastFocusedCard.focus({
                    preventScroll: true
                });

            }


            state.lastFocusedCard = null;

        },
        220
    );

}


/* ------------------------------------------------------------
   POPULATE VIEWER
   ------------------------------------------------------------ */

function populateScrapbook(
    creation
) {

    const type =
        creation.type ||
        getProjectType(
            creation
        );


    const typeLabel =
        creation.typeLabel ||
        getTypeLabel(
            type
        );


    const status =
        creation.status ||
        "planned";


    const isPlanned =
        creation.isPlanned === true ||
        status === "planned";


    const statusLabel =
        creation.statusLabel ||
        (
            isPlanned
                ? "☁ sprouting"
                : "✦ ready!"
        );


    const title =
        $("#scrapbook-title");


    const typeElement =
        $("#scrapbook-type");


    const statusElement =
        $("#scrapbook-status");


    const meta =
        $("#scrapbook-meta");


    if (title) {

        title.textContent =
            creation.name ||
            "Untitled creation";

    }


    if (typeElement) {

        typeElement.textContent =
            typeLabel;

    }


    if (statusElement) {

        statusElement.textContent =
            statusLabel;


        statusElement.classList.toggle(
            "scrapbook-status-planned",
            isPlanned
        );

    }


    if (meta) {

        meta.textContent =
            creation.meta ||
            "";

        meta.hidden =
            !creation.meta;

    }


    populateScrapbookMedia(
        creation
    );


    populateScrapbookDescription(
        creation
    );


    populateScrapbookTags(
        creation
    );


    populateScrapbookDetails(
        creation
    );


    populateScrapbookStack(
        creation
    );


    populateScrapbookActions(
        creation
    );

}


/* ------------------------------------------------------------
   MEDIA
   ------------------------------------------------------------ */

function populateScrapbookMedia(
    creation
) {

    const container =
        $("#scrapbook-media");


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    const previews =
        getCreationPreviewImages(
            creation
        );


    if (!previews.length) {

        container.hidden =
            true;

        return;

    }


    container.hidden =
        false;


    const gallery =
        document.createElement(
            "div"
        );


    gallery.className =
        "scrapbook-gallery";


    const figure =
        document.createElement(
            "figure"
        );


    figure.className =
        "scrapbook-preview";


    const image =
        document.createElement(
            "img"
        );


    const caption =
        document.createElement(
            "figcaption"
        );


    figure.append(
        image,
        caption
    );


    gallery.appendChild(
        figure
    );


    let activeIndex =
        0;


    function showPreview(
        index
    ) {

        activeIndex =
            (
                index +
                previews.length
            ) %
            previews.length;


        const preview =
            previews[activeIndex];


        figure.classList.remove(
            "preview-error"
        );


        const fallback =
            figure.querySelector(
                ".scrapbook-preview-fallback"
            );


        if (fallback) {
            fallback.remove();
        }


        image.style.display =
            "block";


        image.src =
            preview.src;


        image.alt =
            preview.alt;


        caption.textContent =
            preview.caption ||
            creation.caption ||
            "";


        caption.hidden =
            !caption.textContent;


        gallery
            .querySelectorAll(
                ".scrapbook-gallery-thumb"
            )
            .forEach(
                (button, buttonIndex) => {

                    const selected =
                        buttonIndex ===
                        activeIndex;


                    button.classList.toggle(
                        "is-active",
                        selected
                    );


                    button.setAttribute(
                        "aria-current",
                        selected
                            ? "true"
                            : "false"
                    );

                }
            );


        const counter =
            gallery.querySelector(
                ".scrapbook-gallery-counter"
            );


        if (counter) {

            counter.textContent =
                `${activeIndex + 1} / ${previews.length}`;

        }

    }


    image.addEventListener(
        "error",
        () => {

            figure.classList.add(
                "preview-error"
            );


            image.style.display =
                "none";


            if (
                !figure.querySelector(
                    ".scrapbook-preview-fallback"
                )
            ) {

                const fallback =
                    document.createElement(
                        "div"
                    );


                fallback.className =
                    "scrapbook-preview-fallback";


                fallback.setAttribute(
                    "aria-hidden",
                    "true"
                );


                fallback.textContent =
                    "✿";


                figure.insertBefore(
                    fallback,
                    figure.firstChild
                );

            }

        }
    );


    if (
        previews.length > 1
    ) {

        const controls =
            document.createElement(
                "div"
            );


        controls.className =
            "scrapbook-gallery-controls";


        controls.innerHTML = `

            <button
                class="scrapbook-gallery-arrow"
                type="button"
                data-gallery-previous
                aria-label="Previous preview image"
            >
                ←
            </button>


            <span
                class="scrapbook-gallery-counter"
                aria-live="polite"
            ></span>


            <button
                class="scrapbook-gallery-arrow"
                type="button"
                data-gallery-next
                aria-label="Next preview image"
            >
                →
            </button>

        `;


        controls
            .querySelector(
                "[data-gallery-previous]"
            )
            .addEventListener(
                "click",
                () => {
                    showPreview(
                        activeIndex - 1
                    );
                }
            );


        controls
            .querySelector(
                "[data-gallery-next]"
            )
            .addEventListener(
                "click",
                () => {
                    showPreview(
                        activeIndex + 1
                    );
                }
            );


        gallery.appendChild(
            controls
        );


        const thumbnails =
            document.createElement(
                "div"
            );


        thumbnails.className =
            "scrapbook-gallery-thumbs";


        previews.forEach(
            (preview, index) => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.className =
                    "scrapbook-gallery-thumb";


                button.type =
                    "button";


                button.setAttribute(
                    "aria-label",
                    `Show preview ${index + 1}`
                );


                const thumb =
                    document.createElement(
                        "img"
                    );


                thumb.src =
                    preview.src;


                thumb.alt =
                    "";


                thumb.loading =
                    "lazy";


                button.appendChild(
                    thumb
                );


                button.addEventListener(
                    "click",
                    () => {
                        showPreview(
                            index
                        );
                    }
                );


                thumbnails.appendChild(
                    button
                );

            }
        );


        gallery.appendChild(
            thumbnails
        );

    }


    container.appendChild(
        gallery
    );


    showPreview(0);

}


/* ------------------------------------------------------------
   DESCRIPTION
   ------------------------------------------------------------ */

function populateScrapbookDescription(
    creation
) {

    const container =
        $("#scrapbook-description");


    if (!container) {
        return;
    }


    const description =
        creation.desc ||
        "";


    container.innerHTML =
        description
            ? `
                <div class="scrapbook-section-label">
                    about this creation
                </div>

                <p>
                    ${escapeHTML(
                        description
                    )}
                </p>
            `
            : "";


    container.hidden =
        !description;

}


/* ------------------------------------------------------------
   TAGS
   ------------------------------------------------------------ */

function populateScrapbookTags(
    creation
) {

    const container =
        $("#scrapbook-tags");


    if (!container) {
        return;
    }


    const tags =
        Array.isArray(
            creation.tags
        )
            ? creation.tags
            : [];


    if (!tags.length) {

        container.innerHTML =
            "";

        container.hidden =
            true;

        return;

    }


    container.hidden =
        false;


    container.innerHTML = `

        <div class="scrapbook-section-label">
            little labels
        </div>


        <div class="scrapbook-tag-list">

            ${
                tags
                    .map(
                        tag => `
                            <span>
                                ${escapeHTML(
                                    tag
                                )}
                            </span>
                        `
                    )
                    .join("")
            }

        </div>

    `;

}


/* ------------------------------------------------------------
   DETAILS / CODE
   ------------------------------------------------------------ */

function populateScrapbookDetails(
    creation
) {

    const container =
        $("#scrapbook-details");


    if (!container) {
        return;
    }


    const title =
        creation.detailTitle ||
        "workshop notes";


    const code =
        creation.codeBlock ||
        "";


    if (!code) {

        container.innerHTML =
            "";

        container.hidden =
            true;

        return;

    }


    container.hidden =
        false;


    container.innerHTML = `

        <div class="scrapbook-section-label">
            ${escapeHTML(
                title
            )}
        </div>


        <pre class="scrapbook-code"><code>${escapeHTML(
            code
        )}</code></pre>

    `;

}


/* ------------------------------------------------------------
   STACK
   ------------------------------------------------------------ */

function populateScrapbookStack(
    creation
) {

    const container =
        $("#scrapbook-stack");


    if (!container) {
        return;
    }


    const stack =
        Array.isArray(
            creation.stack
        )
            ? creation.stack
            : [];


    if (!stack.length) {

        container.innerHTML =
            "";

        container.hidden =
            true;

        return;

    }


    container.hidden =
        false;


    container.innerHTML = `

        <div class="scrapbook-section-label">
            notes
        </div>


        <ul>

            ${
                stack
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

    `;

}


/* ------------------------------------------------------------
   ACTION BUTTONS
   ------------------------------------------------------------ */

function populateScrapbookActions(
    creation
) {

    const container =
        $("#scrapbook-actions");


    if (!container) {
        return;
    }


    const buttons = [];


    if (creation.downloadUrl) {

        buttons.push(`

            <a
                class="scrapbook-action scrapbook-action-primary"
                href="${escapeAttribute(
                    creation.downloadUrl
                )}"
                download
            >
                ${escapeHTML(
                    creation.downloadText ||
                    "Download 🌸"
                )}
            </a>

        `);

    }


    if (creation.github) {

        buttons.push(`

            <a
                class="scrapbook-action scrapbook-action-secondary"
                href="${escapeAttribute(
                    creation.github
                )}"
                target="_blank"
                rel="noopener noreferrer"
            >
                GitHub ↗
            </a>

        `);

    }


    if (creation.url) {

        buttons.push(`

            <a
                class="scrapbook-action scrapbook-action-secondary"
                href="${escapeAttribute(
                    creation.url
                )}"
                target="_blank"
                rel="noopener noreferrer"
            >
                Open project ↗
            </a>

        `);

    }


    if (creation.hint) {

        buttons.push(`

            <div class="scrapbook-hint">
                ${sanitizeInlineHTML(
                    creation.hint
                )}
            </div>

        `);

    }


    container.innerHTML =
        buttons.join("");


    container.hidden =
        buttons.length === 0;

}


/* ------------------------------------------------------------
   MAKE PROJECTS CLICKABLE
   ------------------------------------------------------------ */

function findCreationForEntry(entry) {

    /* Prefer stable ID when present */
    const id =
        entry.dataset.id;


    if (id) {

        const byId =
            state.creations.find(
                c =>
                    String(c.id) ===
                    String(id)
            );


        if (byId) {
            return byId;
        }

    }


    /* Fallback to array index (legacy / missing id) */
    const index =
        parseInt(
            entry.dataset.index,
            10
        );


    if (
        !Number.isNaN(index) &&
        state.creations[index]
    ) {

        return state.creations[index];

    }


    return null;

}


function setupScrapbookCards() {

    const entries =
        $all(".entry");


    entries.forEach(
        entry => {

            if (
                entry.dataset.scrapbookReady ===
                "true"
            ) {

                return;

            }


            entry.dataset.scrapbookReady =
                "true";


            entry.setAttribute(
                "role",
                "button"
            );


            entry.setAttribute(
                "tabindex",
                "0"
            );


            const openFromCard =
                event => {

                    /*
                        Don't intercept clicks on real
                        links, buttons, or expandable
                        details.
                    */

                    if (
                        event.target.closest(
                            "a, button, summary, details"
                        )
                    ) {

                        return;

                    }


                    const creation =
                        findCreationForEntry(
                            entry
                        );


                    if (!creation) {
                        return;
                    }


                    state.lastFocusedCard =
                        entry;


                    openScrapbook(
                        creation
                    );

                };


            entry.addEventListener(
                "click",
                openFromCard
            );


            entry.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key !== "Enter" &&
                        event.key !== " "
                    ) {

                        return;

                    }


                    if (
                        event.target.closest(
                            "a, button, summary, details"
                        )
                    ) {

                        return;

                    }


                    event.preventDefault();

                    openFromCard(event);

                }
            );

        }
    );

}


/* ============================================================
   32. PATCH RENDERER
   ============================================================ */

/*
    Keep a lightweight patch so each card still carries
    its original array index as a fallback, while the
    preferred lookup is now by creation.id.
*/

const originalCreateEntry =
    createEntry;


createEntry =
    function (
        creation,
        index
    ) {

        const article =
            originalCreateEntry(
                creation,
                index
            );


        article.dataset.index =
            String(index);


        return article;

    };


const originalRenderCreations =
    renderCreations;


renderCreations =
    function () {

        originalRenderCreations();


        createScrapbookViewer();

        setupScrapbookCards();

    };


/* ============================================================
   END SCRAPBOOK VIEWER
   ============================================================ */
