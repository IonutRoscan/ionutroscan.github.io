/**
 * NOCTURNE ARCHIVE // CODEX CORE ORCHESTRATOR
 * Connects Rotary Engine, Cassette Loader, and Synthesized Audio Relay.
 */

class CodexApp {
  constructor() {
    this.dataFile = "creations.json";
    this.creations = [];
    this.filteredCreations = [];
    this.selectedIndex = 0;

    this.rotaryEngine = null;
    this.cassetteLoader = null;
    this.audioRelay = null;

    this.dom = {
      drumTrack: document.getElementById("rotary-track"),
      bayMount: document.getElementById("bay-mount"),
      searchInput: document.getElementById("codex-search"),
      audioToggle: document.getElementById("audio-toggle"),
      itemCount: document.getElementById("dial-count"),
      statusTicker: document.getElementById("codex-status")
    };

    this.init();
  }

  async init() {
    this.setStatus("INITIALIZING CODEX CORE...");

    // 1. Initialize Audio Engine
    this.audioRelay = new CodexAudioRelay({ masterVolume: 0.2 });

    // 2. Initialize Cassette Bay
    this.cassetteLoader = new CodexCassetteLoader(this.dom.bayMount, {
      onEject: () => this.audioRelay.playEject(),
      onMounted: () => this.audioRelay.playLock()
    });

    // 3. Bind Global Controls
    this.bindControls();

    // 4. Fetch JSON Payload
    try {
      const res = await fetch(this.dataFile, { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      this.creations = await res.json();
      this.filteredCreations = [...this.creations];

      this.buildRotaryDrum();
      this.setStatus("SYSTEM NOMINAL // CASSETTE LINK READY");
    } catch (err) {
      console.error("CodexApp Init Failure:", err);
      this.setStatus("CARTRIDGE LOAD FAILURE // ARCHIVE CORRUPT");
    }
  }

  bindControls() {
    // Audio Mute Toggle
    if (this.dom.audioToggle) {
      this.dom.audioToggle.addEventListener("click", () => {
        const isMuted = this.audioRelay.toggleMute();
        this.dom.audioToggle.classList.toggle("is-muted", isMuted);
        this.dom.audioToggle.setAttribute("aria-pressed", String(!isMuted));
        this.dom.audioToggle.textContent = isMuted ? "MUTED [OFF]" : "ACOUSTICS [ON]";
      });
    }

    // Keyboard Detents
    window.addEventListener("keydown", (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

      if (e.key === "ArrowDown" || e.key === "s") {
        e.preventDefault();
        this.stepWheel(1);
      } else if (e.key === "ArrowUp" || e.key === "w") {
        e.preventDefault();
        this.stepWheel(-1);
      }
    });

    // Search / Filter Input
    if (this.dom.searchInput) {
      this.dom.searchInput.addEventListener("input", (e) => {
        const query = e.target.value.trim().toLowerCase();
        this.filterEntries(query);
      });
    }
  }

  buildRotaryDrum() {
    if (!this.dom.drumTrack) return;
    this.dom.drumTrack.innerHTML = "";

    this.filteredCreations.forEach((item, idx) => {
      const node = document.createElement("div");
      node.className = "drum-node";
      node.dataset.index = String(idx);
      node.innerHTML = `
        <div class="drum-node-bracket"></div>
        <div class="drum-node-plate">
          <span class="drum-node-id">${item.id || String(idx + 1).padStart(2, "0")}</span>
          <span class="drum-node-title">${this.escape(item.name)}</span>
        </div>
      `;

      node.addEventListener("pointerdown", () => {
        if (this.rotaryEngine) {
          this.rotaryEngine.snapToIndex(idx);
        }
      });

      this.dom.drumTrack.appendChild(node);
    });

    if (this.dom.itemCount) {
      this.dom.itemCount.textContent = String(this.filteredCreations.length).padStart(2, "0");
    }

    // Mount or reconfigure the kinetic rotary driver
    if (!this.rotaryEngine) {
      this.rotaryEngine = new CodexRotaryEngine(this.dom.drumTrack, {
        itemCount: this.filteredCreations.length,
        radius: 310,
        onSelect: (index) => this.onRotarySelection(index)
      });

      // Hook click acoustical tick to continuous angular changes
      let lastSnapIdx = 0;
      this.dom.drumTrack.addEventListener("rotary:change", (e) => {
        if (e.detail.index !== lastSnapIdx) {
          this.audioRelay.playRatchet(1.1);
          lastSnapIdx = e.detail.index;
        }
      });
    } else {
      this.rotaryEngine.updateItemCount(this.filteredCreations.length);
    }

    // Select default active entry
    if (this.filteredCreations.length > 0) {
      this.onRotarySelection(0);
    }
  }

  onRotarySelection(index) {
    this.selectedIndex = index;
    const activeItem = this.filteredCreations[index];

    if (activeItem && this.cassetteLoader) {
      this.cassetteLoader.loadRecord(activeItem);
      this.setStatus(`ACTIVE CARTRIDGE: ${activeItem.name.toUpperCase()}`);
    }
  }

  stepWheel(direction) {
    if (!this.rotaryEngine || !this.filteredCreations.length) return;
    const next = (this.selectedIndex + direction + this.filteredCreations.length) % this.filteredCreations.length;
    this.rotaryEngine.snapToIndex(next);
  }

  filterEntries(query) {
    if (!query) {
      this.filteredCreations = [...this.creations];
    } else {
      this.filteredCreations = this.creations.filter((item) => {
        const corpus = [
          item.name,
          item.desc,
          item.meta,
          item.type,
          ...(item.tags || [])
        ].join(" ").toLowerCase();
        return corpus.includes(query);
      });
    }

    this.buildRotaryDrum();
  }

  setStatus(text) {
    if (this.dom.statusTicker) {
      this.dom.statusTicker.textContent = text;
    }
  }

  escape(str) {
    if (!str) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
}

// Bootstrap once the DOM is parsed
document.addEventListener("DOMContentLoaded", () => {
  window.codexApp = new CodexApp();
});