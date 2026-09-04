(() => {
  "use strict";

  const CONFIG = {
    dataFile: "creations.json",
    themeKey: "dxk-archive-theme",
    audioKey: "dxk-archive-audio"
  };

  const VISUALS = {
    "001": { accent: "#d8ad5a", rgb: "216, 173, 90", secondary: "#ffdd8a", glyph: "✦" },
    "002": { accent: "#56d6cb", rgb: "86, 214, 203", secondary: "#8be9ff", glyph: "◈" },
    "003": { accent: "#a786ff", rgb: "167, 134, 255", secondary: "#ff91dd", glyph: "♢" },
    "004": { accent: "#f17478", rgb: "241, 116, 120", secondary: "#ffb76d", glyph: "⌁" },
    "005": { accent: "#9ba1b6", rgb: "155, 161, 182", secondary: "#d8dbea", glyph: "◇" }
  };

  const state = {
    creations: [],
    activeIndex: 0,
    galleryIndex: 0,
    switchTimer: 0,
    searchIndex: 0,
    searchMatches: [],
    audioEnabled: localStorage.getItem(CONFIG.audioKey) === "on"
  };

  const dom = {};
  let audio = null;
  let ambient = null;

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    cacheDOM();
    applyStoredTheme();
    bindUI();
    ambient = createAmbientField(dom.canvas);
    updateAudioButton();
    await loadArchive();
  }

  function cacheDOM() {
    const ids = [
      "world-canvas", "cursor-aura", "world-list", "project-count", "index-progress-fill",
      "artifact-stage", "stage-glyph", "media-frame", "media-backdrop", "media-open",
      "project-image", "media-empty", "image-caption", "gallery-count", "gallery-controls",
      "gallery-prev", "gallery-next", "gallery-dots", "project-id", "project-type",
      "project-title", "project-meta", "project-description", "project-tags", "project-actions",
      "record-link", "stage-status-text", "record-section", "record-watermark", "record-title",
      "record-summary", "record-details-panel", "record-details", "record-stack-panel",
      "record-stack", "record-code-panel", "record-code-label", "record-code", "record-actions",
      "record-hint", "search-open", "search-dialog", "archive-search", "search-results",
      "lightbox", "lightbox-image", "lightbox-caption", "lightbox-close", "lightbox-prev",
      "lightbox-next", "audio-toggle", "theme-toggle", "load-error", "retry-load"
    ];

    ids.forEach(id => {
      dom[toCamel(id)] = document.getElementById(id);
    });
    dom.canvas = dom.worldCanvas;
  }

  function toCamel(value) {
    return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  async function loadArchive() {
    dom.loadError.hidden = true;
    dom.stageStatusText.textContent = "Locating archive…";

    try {
      const response = await fetch(CONFIG.dataFile, { cache: "no-cache" });
      if (!response.ok) throw new Error(`Archive request failed: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data) || !data.length) throw new Error("Archive is empty");

      state.creations = data;
      buildWorldIndex();
      const requested = location.hash.replace(/^#world-/, "");
      const requestedIndex = state.creations.findIndex(item => String(item.id) === requested);
      selectProject(requestedIndex >= 0 ? requestedIndex : 0, { immediate: true, updateHash: false });
    } catch (error) {
      console.error(error);
      dom.loadError.hidden = false;
      dom.stageStatusText.textContent = "Archive link interrupted";
    }
  }

  function bindUI() {
    dom.galleryPrev.addEventListener("click", () => stepGallery(-1));
    dom.galleryNext.addEventListener("click", () => stepGallery(1));
    dom.mediaOpen.addEventListener("click", openLightbox);
    dom.lightboxClose.addEventListener("click", () => dom.lightbox.close());
    dom.lightboxPrev.addEventListener("click", () => stepGallery(-1, true));
    dom.lightboxNext.addEventListener("click", () => stepGallery(1, true));
    dom.lightbox.addEventListener("click", event => {
      if (event.target === dom.lightbox) dom.lightbox.close();
    });

    dom.recordLink.addEventListener("click", () => {
      dom.recordSection.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });

    dom.searchOpen.addEventListener("click", openSearch);
    dom.archiveSearch.addEventListener("input", () => renderSearch(dom.archiveSearch.value));
    dom.archiveSearch.addEventListener("keydown", handleSearchKeys);
    dom.searchDialog.addEventListener("close", () => {
      dom.archiveSearch.value = "";
      state.searchIndex = 0;
    });

    dom.audioToggle.addEventListener("click", toggleAudio);
    dom.themeToggle.addEventListener("click", toggleTheme);
    dom.retryLoad.addEventListener("click", loadArchive);

    window.addEventListener("keydown", handleGlobalKeys);
    window.addEventListener("pointermove", event => {
      if (dom.cursorAura) {
        dom.cursorAura.style.left = `${event.clientX}px`;
        dom.cursorAura.style.top = `${event.clientY}px`;
      }
      ambient?.setPointer(event.clientX, event.clientY);
    }, { passive: true });

    window.addEventListener("hashchange", () => {
      const requested = location.hash.replace(/^#world-/, "");
      const index = state.creations.findIndex(item => String(item.id) === requested);
      if (index >= 0 && index !== state.activeIndex) selectProject(index, { updateHash: false });
    });
  }

  function buildWorldIndex() {
    dom.worldList.replaceChildren();
    dom.projectCount.textContent = String(state.creations.length).padStart(2, "0");

    state.creations.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "world-button";
      button.dataset.index = String(index);
      button.setAttribute("aria-label", `Open ${item.name}`);

      const number = document.createElement("span");
      number.className = "world-number";
      number.textContent = item.id || String(index + 1).padStart(3, "0");

      const name = document.createElement("span");
      name.className = "world-name";
      name.textContent = item.name || "Untitled world";

      button.append(number, name);
      button.addEventListener("click", () => selectProject(index));
      dom.worldList.append(button);
    });
  }

  function selectProject(index, options = {}) {
    if (!state.creations[index]) return;
    const { immediate = false, updateHash = true } = options;
    const change = () => {
      state.activeIndex = index;
      state.galleryIndex = 0;
      const item = state.creations[index];
      applyVisualIdentity(item);
      renderProject(item);
      updateWorldIndex();
      dom.artifactStage.classList.remove("is-switching");
      if (updateHash) history.replaceState(null, "", `#world-${item.id}`);
      playTone("select");
    };

    clearTimeout(state.switchTimer);
    if (immediate || prefersReducedMotion()) {
      change();
      return;
    }

    dom.artifactStage.classList.add("is-switching");
    state.switchTimer = window.setTimeout(change, 210);
  }

  function applyVisualIdentity(item) {
    const visual = {
      ...(VISUALS[item.id] || VISUALS["005"]),
      ...(item.visual || {})
    };
    const root = document.documentElement;
    root.style.setProperty("--accent", visual.accent);
    root.style.setProperty("--accent-rgb", visual.rgb);
    root.style.setProperty("--accent-2", visual.secondary);
    dom.stageGlyph.textContent = visual.glyph;
    dom.recordWatermark.textContent = visual.glyph;
    ambient?.setColor(visual.rgb);
  }

  function renderProject(item) {
    dom.projectId.textContent = item.id || "000";
    dom.projectType.textContent = item.typeLabel || item.type || "Archive record";
    dom.projectTitle.textContent = item.name || "Untitled world";
    dom.projectMeta.textContent = item.meta || "";
    dom.projectDescription.textContent = item.desc || "No field notes have been recovered yet.";
    dom.stageStatusText.textContent = `${item.statusLabel || item.status || "record located"} · world ${item.id || state.activeIndex + 1}`;
    dom.recordTitle.textContent = item.name || "Archive record";
    dom.recordSummary.textContent = item.desc || "";

    renderTags(item.tags || []);
    renderActions(item, dom.projectActions);
    renderActions(item, dom.recordActions);
    renderGallery(item);
    renderRecord(item);
  }

  function renderTags(tags) {
    dom.projectTags.replaceChildren();
    tags.slice(0, 8).forEach(tag => {
      const chip = document.createElement("span");
      chip.textContent = tag;
      dom.projectTags.append(chip);
    });
  }

  function renderActions(item, target) {
    target.replaceChildren();
    const actions = [];
    if (item.downloadUrl) actions.push({ href: item.downloadUrl, label: item.downloadText || "Download", primary: true, download: true });
    if (item.github) actions.push({ href: item.github, label: "View repository ↗", external: true });
    if (item.url) actions.push({ href: item.url, label: "Open creation ↗", external: true });

    actions.forEach(action => {
      const link = document.createElement("a");
      link.className = `action-button${action.primary ? " primary" : ""}`;
      link.href = action.href;
      link.textContent = action.label;
      if (action.download) link.setAttribute("download", "");
      if (action.external) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      link.addEventListener("pointerdown", () => playTone("press"));
      target.append(link);
    });
  }

  function renderGallery(item) {
    const images = getImages(item);
    dom.galleryDots.replaceChildren();
    dom.galleryControls.hidden = images.length <= 1;
    dom.galleryCount.textContent = images.length > 1 ? `01 / ${String(images.length).padStart(2, "0")}` : "";
    dom.mediaOpen.hidden = images.length === 0;
    dom.mediaEmpty.hidden = images.length > 0;

    images.forEach((image, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `gallery-dot${index === 0 ? " is-active" : ""}`;
      dot.setAttribute("aria-label", `Show image ${index + 1}: ${image.caption}`);
      dot.addEventListener("click", () => showImage(index));
      dom.galleryDots.append(dot);
    });

    if (images.length) showImage(0);
    else {
      dom.projectImage.removeAttribute("src");
      dom.mediaBackdrop.style.backgroundImage = "none";
      dom.imageCaption.textContent = "Awaiting visual transmission";
      dom.mediaFrame.dataset.shape = "landscape";
    }
  }

  function getImages(item = state.creations[state.activeIndex]) {
    if (!item) return [];
    if (Array.isArray(item.previewImages)) {
      return item.previewImages.map((entry, index) => {
        if (typeof entry === "string") return { src: entry, caption: item.caption || `${item.name} · image ${index + 1}`, alt: item.name };
        return {
          src: entry.src,
          caption: entry.caption || item.caption || `${item.name} · image ${index + 1}`,
          alt: entry.alt || entry.caption || item.name
        };
      }).filter(entry => entry.src);
    }
    return item.previewImg ? [{ src: item.previewImg, caption: item.caption || item.name, alt: item.caption || item.name }] : [];
  }

  function showImage(index, syncLightbox = false) {
    const images = getImages();
    if (!images.length) return;
    state.galleryIndex = (index + images.length) % images.length;
    const image = images[state.galleryIndex];
    dom.projectImage.style.opacity = "0";
    dom.projectImage.alt = image.alt;
    dom.projectImage.onload = () => {
      const ratio = dom.projectImage.naturalWidth / Math.max(1, dom.projectImage.naturalHeight);
      dom.mediaFrame.dataset.shape = ratio > 1.25 ? "landscape" : ratio < .8 ? "portrait" : "square";
      dom.projectImage.style.opacity = "1";
    };
    dom.projectImage.onerror = () => {
      dom.projectImage.style.opacity = "0";
      dom.imageCaption.textContent = "Visual transmission unavailable";
    };
    dom.projectImage.src = image.src;
    dom.mediaBackdrop.style.backgroundImage = `url("${encodeCssUrl(image.src)}")`;
    dom.imageCaption.textContent = image.caption;
    dom.galleryCount.textContent = images.length > 1
      ? `${String(state.galleryIndex + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`
      : "";
    [...dom.galleryDots.children].forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === state.galleryIndex));
    if (syncLightbox && dom.lightbox.open) updateLightbox();
  }

  function stepGallery(direction, syncLightbox = false) {
    showImage(state.galleryIndex + direction, syncLightbox);
    playTone("tick");
  }

  function openLightbox() {
    if (!getImages().length) return;
    updateLightbox();
    dom.lightbox.showModal();
  }

  function updateLightbox() {
    const image = getImages()[state.galleryIndex];
    if (!image) return;
    dom.lightboxImage.src = image.src;
    dom.lightboxImage.alt = image.alt;
    dom.lightboxCaption.textContent = image.caption;
    const multiple = getImages().length > 1;
    dom.lightboxPrev.hidden = !multiple;
    dom.lightboxNext.hidden = !multiple;
  }

  function renderRecord(item) {
    const stack = Array.isArray(item.stack) ? item.stack : [];
    dom.recordStack.replaceChildren();
    stack.forEach(line => {
      const entry = document.createElement("li");
      entry.innerHTML = sanitizeInline(line);
      dom.recordStack.append(entry);
    });
    dom.recordStackPanel.hidden = stack.length === 0;

    dom.recordDetails.replaceChildren();
    const details = document.createElement("p");
    details.innerHTML = item.detailTitle
      ? `<strong>${escapeHTML(item.detailTitle)}</strong>`
      : `<strong>${escapeHTML(item.statusLabel || "Archive notes")}</strong>`;
    const meta = document.createElement("p");
    meta.textContent = item.meta || "This record is still taking shape.";
    dom.recordDetails.append(details, meta);
    dom.recordDetailsPanel.hidden = !item.detailTitle && !item.meta;

    dom.recordCodePanel.hidden = !item.codeBlock;
    dom.recordCodeLabel.textContent = item.detailTitle || "Recovered fragment";
    dom.recordCode.textContent = item.codeBlock || "";
    dom.recordHint.innerHTML = item.hint ? sanitizeInline(item.hint) : "";
  }

  function updateWorldIndex() {
    [...dom.worldList.children].forEach((button, index) => {
      const active = index === state.activeIndex;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-current", active ? "true" : "false");
      if (active) button.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "nearest", inline: "nearest" });
    });
    const progress = ((state.activeIndex + 1) / state.creations.length) * 100;
    dom.indexProgressFill.style.width = `${progress}%`;
  }

  function openSearch() {
    renderSearch("");
    dom.searchDialog.showModal();
    requestAnimationFrame(() => dom.archiveSearch.focus());
  }

  function renderSearch(query) {
    const needle = query.trim().toLowerCase();
    state.searchMatches = state.creations
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !needle || [item.name, item.desc, item.meta, item.typeLabel, ...(item.tags || [])].join(" ").toLowerCase().includes(needle));
    state.searchIndex = 0;
    dom.searchResults.replaceChildren();

    if (!state.searchMatches.length) {
      const empty = document.createElement("p");
      empty.className = "search-empty";
      empty.textContent = "Nothing in the archive matches that signal.";
      dom.searchResults.append(empty);
      return;
    }

    state.searchMatches.forEach(({ item, index }, resultIndex) => {
      const visual = VISUALS[item.id] || VISUALS["005"];
      const button = document.createElement("button");
      button.type = "button";
      button.className = `search-result${resultIndex === 0 ? " is-focused" : ""}`;
      button.innerHTML = `
        <span class="search-result-symbol" aria-hidden="true">${escapeHTML(visual.glyph)}</span>
        <span><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.typeLabel || item.type || "Archive record")}</small></span>
        <span>${escapeHTML(item.id || "")}</span>`;
      button.addEventListener("click", () => chooseSearchResult(index));
      dom.searchResults.append(button);
    });
  }

  function handleSearchKeys(event) {
    if (!state.searchMatches.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      state.searchIndex = (state.searchIndex + direction + state.searchMatches.length) % state.searchMatches.length;
      updateSearchFocus();
    } else if (event.key === "Enter") {
      event.preventDefault();
      chooseSearchResult(state.searchMatches[state.searchIndex].index);
    }
  }

  function updateSearchFocus() {
    [...dom.searchResults.children].forEach((node, index) => node.classList.toggle("is-focused", index === state.searchIndex));
    dom.searchResults.children[state.searchIndex]?.scrollIntoView({ block: "nearest" });
  }

  function chooseSearchResult(index) {
    dom.searchDialog.close();
    selectProject(index);
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }

  function handleGlobalKeys(event) {
    if ((event.key === "/" || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) && !isTyping()) {
      event.preventDefault();
      if (!dom.searchDialog.open) openSearch();
      return;
    }
    if (dom.searchDialog.open || dom.lightbox.open || isTyping()) return;
    if (event.key === "ArrowRight") selectProject((state.activeIndex + 1) % state.creations.length);
    if (event.key === "ArrowLeft") selectProject((state.activeIndex - 1 + state.creations.length) % state.creations.length);
  }

  function isTyping() {
    return ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  }

  function applyStoredTheme() {
    const saved = localStorage.getItem(CONFIG.themeKey);
    const theme = saved || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.dataset.theme = theme;
    updateThemeButton();
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(CONFIG.themeKey, next);
    updateThemeButton();
    playTone("press");
  }

  function updateThemeButton() {
    const light = document.documentElement.dataset.theme === "light";
    dom.themeToggle.innerHTML = `<span aria-hidden="true">${light ? "☾" : "☼"}</span>`;
    dom.themeToggle.setAttribute("aria-label", light ? "Use dark theme" : "Use light theme");
  }

  function toggleAudio() {
    state.audioEnabled = !state.audioEnabled;
    localStorage.setItem(CONFIG.audioKey, state.audioEnabled ? "on" : "off");
    if (state.audioEnabled) {
      const AudioEngine = window.AudioContext || window.webkitAudioContext;
      if (!AudioEngine) {
        state.audioEnabled = false;
        localStorage.setItem(CONFIG.audioKey, "off");
        updateAudioButton();
        return;
      }
      audio ||= new AudioEngine();
      if (audio.state === "suspended") audio.resume();
      playTone("select");
    }
    updateAudioButton();
  }

  function updateAudioButton() {
    dom.audioToggle.setAttribute("aria-pressed", String(state.audioEnabled));
    dom.audioToggle.setAttribute("aria-label", state.audioEnabled ? "Disable interface sounds" : "Enable interface sounds");
    dom.audioToggle.querySelector(".audio-icon").textContent = state.audioEnabled ? "◉" : "◖";
  }

  function playTone(kind) {
    if (!state.audioEnabled) return;
    try {
      const AudioEngine = window.AudioContext || window.webkitAudioContext;
      if (!AudioEngine) return;
      audio ||= new AudioEngine();
      const now = audio.currentTime;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const filter = audio.createBiquadFilter();
      const presets = {
        select: [220, 78, .12, .055],
        tick: [680, 260, .045, .028],
        press: [320, 125, .075, .035]
      };
      const [start, end, duration, volume] = presets[kind] || presets.tick;
      oscillator.type = kind === "select" ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(start, now);
      oscillator.frequency.exponentialRampToValueAtTime(end, now + duration);
      filter.type = "lowpass";
      filter.frequency.value = 1600;
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      oscillator.connect(filter).connect(gain).connect(audio.destination);
      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (_) {
      state.audioEnabled = false;
      updateAudioButton();
    }
  }

  function createAmbientField(canvas) {
    if (!canvas || prefersReducedMotion()) return null;
    const context = canvas.getContext("2d");
    if (!context) return null;
    let width = 0;
    let height = 0;
    let ratio = 1;
    let color = [157, 124, 255];
    let pointer = { x: innerWidth * .7, y: innerHeight * .35 };
    let frame = 0;
    const points = Array.from({ length: 32 }, (_, index) => ({
      x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * .00009,
      vy: (Math.random() - .5) * .00009, size: index % 7 === 0 ? 1.8 : .8
    }));

    const resize = () => {
      width = innerWidth;
      height = innerHeight;
      ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      points.forEach(point => {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < -.05) point.x = 1.05;
        if (point.x > 1.05) point.x = -.05;
        if (point.y < -.05) point.y = 1.05;
        if (point.y > 1.05) point.y = -.05;
      });

      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const ax = a.x * width;
        const ay = a.y * height;
        const pointerDistance = Math.hypot(ax - pointer.x, ay - pointer.y);
        const alpha = pointerDistance < 280 ? .36 : .16;
        context.fillStyle = `rgba(${color.join(",")},${alpha})`;
        context.beginPath();
        context.arc(ax, ay, a.size, 0, Math.PI * 2);
        context.fill();

        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          const bx = b.x * width;
          const by = b.y * height;
          const distance = Math.hypot(ax - bx, ay - by);
          if (distance < 155) {
            context.strokeStyle = `rgba(${color.join(",")},${(1 - distance / 155) * .1})`;
            context.lineWidth = .7;
            context.beginPath();
            context.moveTo(ax, ay);
            context.lineTo(bx, by);
            context.stroke();
          }
        }
      }
      frame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize, { passive: true });
    return {
      setColor(rgb) { color = String(rgb).split(",").map(value => Number(value.trim()) || 0); },
      setPointer(x, y) { pointer = { x, y }; },
      destroy() { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); }
    };
  }

  function sanitizeInline(value) {
    const template = document.createElement("template");
    template.innerHTML = String(value || "");
    const allowed = new Set(["STRONG", "CODE", "EM", "BR"]);
    [...template.content.querySelectorAll("*")].forEach(node => {
      if (!allowed.has(node.tagName)) node.replaceWith(...node.childNodes);
      else [...node.attributes].forEach(attribute => node.removeAttribute(attribute.name));
    });
    return template.innerHTML;
  }

  function escapeHTML(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function encodeCssUrl(value) {
    return String(value || "").replace(/["\\\n\r]/g, character => `\\${character}`);
  }

  function prefersReducedMotion() {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
})();
