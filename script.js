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
        statusEl.textContent = `${stable} STABLE · ${planned} PLANNED`;
    }

});
