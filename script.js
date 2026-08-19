document.addEventListener("DOMContentLoaded", () => {

    // enables the CSS reveal animation only once JS has run
    document.documentElement.classList.add("js-ready");

    // entry count reflects the actual number of .entry nodes in the
    // registry, so it never drifts out of sync as entries are added
    const count = document.querySelectorAll(".registry .entry").length;
    const countEl = document.getElementById("entry-count");

    if (countEl) {
        countEl.textContent = String(count);
    }

    // header status line reflects real counts too
    const stable = document.querySelectorAll('.entry[data-status="stable"]').length;
    const planned = document.querySelectorAll('.entry[data-status="planned"]').length;
    const statusEl = document.getElementById("system-status");

    if (statusEl) {
        statusEl.textContent = `${stable} stable · ${planned} planned`;
    }

    // ---- theme toggle: cream (light) <-> soft dark ----
    const toggle = document.getElementById("theme-toggle");
    const icon = toggle ? toggle.querySelector(".theme-toggle-icon") : null;
    const label = toggle ? toggle.querySelector(".theme-toggle-label") : null;

    const applyThemeUI = isDark => {

        if (icon) {
            icon.textContent = isDark ? "☾" : "☀";
        }

        if (label) {
            label.textContent = isDark ? "Dusk" : "Cream";
        }

        if (toggle) {
            toggle.setAttribute("aria-pressed", String(isDark));
        }
    };

    // the inline head script already applied data-theme before paint,
    // this just syncs the button's icon/label to match on load
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

            try {
                localStorage.setItem("dxk-theme", next);
            } catch (e) {}
        });
    }

});
