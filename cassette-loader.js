/**
 * NOCTURNE ARCHIVE // CODEX CASSETTE LOADER
 * Orchestrates mechanical slotting, schematic projection, and cartridge readouts.
 */

class CodexCassetteLoader {
  constructor(mountNode, options = {}) {
    this.mount = typeof mountNode === "string"
      ? document.querySelector(mountNode)
      : mountNode;

    if (!this.mount) {
      console.error("CassetteLoader: Mount target node not found.");
      return;
    }

    this.options = Object.assign({
      transitionDuration: 360,
      onEject: null,
      onMounted: null
    }, options);

    this.currentRecord = null;
    this.isTransitioning = false;

    this.initStructure();
  }

  initStructure() {
    this.mount.innerHTML = `
      <div class="cartridge-bay" data-state="idle">
        <div class="bay-chassis">
          <div class="bay-rails top-rail"></div>
          <div class="cartridge-carrier" id="cassette-carrier">
            <div class="cartridge-face">
              <div class="cartridge-header">
                <span class="carrier-id">SYS_SLOT_00</span>
                <span class="carrier-status">READY</span>
              </div>
              <div class="carrier-body" id="cassette-body">
                <div class="empty-carrier">ENGAGE ROTARY DRUM TO MOUNT CASSETTE</div>
              </div>
            </div>
          </div>
          <div class="bay-rails bottom-rail"></div>
        </div>
      </div>
    `;

    this.carrier = this.mount.querySelector("#cassette-carrier");
    this.body = this.mount.querySelector("#cassette-body");
    this.carrierId = this.mount.querySelector(".carrier-id");
    this.carrierStatus = this.mount.querySelector(".carrier-status");
  }

  async loadRecord(record) {
    if (!record || this.currentRecord?.id === record.id) return;
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    this.currentRecord = record;

    if (typeof this.options.onEject === "function") {
      this.options.onEject(record);
    }

    await this.animateEject();
    this.renderCassette(record);
    await this.animateInsert();

    this.isTransitioning = false;

    if (typeof this.options.onMounted === "function") {
      this.options.onMounted(record);
    }
  }

  animateEject() {
    return new Promise(resolve => {
      this.carrier.classList.remove("is-docked");
      this.carrier.classList.add("is-ejecting");
      this.carrierStatus.textContent = "EJECTING";

      setTimeout(() => {
        this.carrier.classList.remove("is-ejecting");
        resolve();
      }, this.options.transitionDuration);
    });
  }

  animateInsert() {
    return new Promise(resolve => {
      this.carrier.classList.add("is-inserting");
      this.carrierStatus.textContent = "READING";

      setTimeout(() => {
        this.carrier.classList.remove("is-inserting");
        this.carrier.classList.add("is-docked");
        this.carrierStatus.textContent = "ONLINE";
        resolve();
      }, this.options.transitionDuration);
    });
  }

  renderCassette(item) {
    const isPlanned = item.status === "planned" || item.isPlanned;
    this.carrierId.textContent = `CARTRIDGE_${item.id || "000"}`;

    const tagsHtml = (item.tags || [])
      .map(tag => `<span class="codex-chip">${this.escape(tag)}</span>`)
      .join("");

    const previewSrc = item.previewImages?.[0]?.src || item.previewImg || "";
    const previewCaption = item.previewImages?.[0]?.caption || item.caption || item.name;

    const stackItemsHtml = (item.stack || [])
      .map(line => `<li>${this.sanitizeLine(line)}</li>`)
      .join("");

    const actionsHtml = this.renderActions(item);

    this.body.innerHTML = `
      <div class="cartridge-blueprint">
        <header class="blueprint-head">
          <div class="blueprint-meta">
            <span class="blueprint-type">${this.escape(item.typeLabel || item.type || "RECORD")}</span>
            <span class="blueprint-status ${isPlanned ? "is-planned" : "is-stable"}">
              ${this.escape(item.statusLabel || (isPlanned ? "IN DEVELOPMENT" : "RELEASED"))}
            </span>
          </div>
          <h2 class="blueprint-title">${this.escape(item.name || "Untitled")}</h2>
          <p class="blueprint-sub">${this.escape(item.meta || "")}</p>
        </header>

        <div class="blueprint-grid">
          ${previewSrc ? `
            <figure class="blueprint-schematic">
              <img src="${this.escape(previewSrc)}" alt="${this.escape(previewCaption)}" loading="lazy">
              <figcaption class="schematic-caption">${this.escape(previewCaption)}</figcaption>
            </figure>
          ` : `
            <div class="blueprint-schematic placeholder">
              <div class="schematic-void">◈ NO TELEMETRY FEED ◈</div>
            </div>
          `}

          <div class="blueprint-dossier">
            <p class="dossier-desc">${this.escape(item.desc || "Awaiting entry translation.")}</p>
            ${tagsHtml ? `<div class="dossier-chips">${tagsHtml}</div>` : ""}
          </div>
        </div>

        ${item.codeBlock ? `
          <div class="blueprint-terminal">
            <span class="terminal-bar">${this.escape(item.detailTitle || "LOG_TRACE")}</span>
            <pre><code>${this.escape(item.codeBlock)}</code></pre>
          </div>
        ` : ""}

        ${stackItemsHtml ? `
          <div class="blueprint-telemetry">
            <span class="telemetry-bar">SCHEMATIC COMPONENT NODES</span>
            <ul class="telemetry-stack">${stackItemsHtml}</ul>
          </div>
        ` : ""}

        <footer class="blueprint-actions">
          ${actionsHtml}
          ${item.hint ? `<div class="blueprint-hint">${this.sanitizeLine(item.hint)}</div>` : ""}
        </footer>
      </div>
    `;
  }

  renderActions(item) {
    const btns = [];

    if (item.downloadUrl) {
      btns.push(`
        <a class="action-relay primary" href="${this.escape(item.downloadUrl)}" download>
          ${this.escape(item.downloadText || "DOWNLOAD CARTRIDGE")}
        </a>
      `);
    }

    if (item.github) {
      btns.push(`
        <a class="action-relay" href="${this.escape(item.github)}" target="_blank" rel="noopener noreferrer">
          REPOSITORY ↗
        </a>
      `);
    }

    if (item.url) {
      btns.push(`
        <a class="action-relay" href="${this.escape(item.url)}" target="_blank" rel="noopener noreferrer">
          EXECUTE ↗
        </a>
      `);
    }

    return btns.join("");
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

  sanitizeLine(str) {
    if (!str) return "";
    return String(str)
      .replace(/<(?!\/?(strong|code|em)\b)[^>]*>/gi, "")
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  }
}