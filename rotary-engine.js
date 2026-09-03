/**
 * NOCTURNE ARCHIVE // CODEX ROTARY ENGINE
 * Kinetic drum & physics driver for tactile selection.
 */

class CodexRotaryEngine {
  constructor(container, options = {}) {
    this.container = typeof container === "string" 
      ? document.querySelector(container) 
      : container;

    if (!this.container) {
      console.error("RotaryEngine: Container node not found.");
      return;
    }

    this.options = Object.assign({
      itemCount: 0,
      radius: 280,
      visibleArc: Math.PI * 0.85,
      friction: 0.92,
      snapFriction: 0.82,
      snapStrength: 0.12,
      wheelSensitivity: 0.0018,
      dragSensitivity: 0.0045,
      onSelect: null
    }, options);

    this.angle = 0;
    this.targetAngle = 0;
    this.velocity = 0;
    this.isDragging = false;
    this.lastPointerY = 0;
    this.selectedIndex = 0;
    this.animFrameId = null;

    this.init();
  }

  init() {
    this.stepAngle = (Math.PI * 2) / Math.max(1, this.options.itemCount);
    this.bindEvents();
    this.startLoop();
  }

  bindEvents() {
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onWheel = this.onWheel.bind(this);

    this.container.addEventListener("pointerdown", this.onPointerDown, { passive: false });
    window.addEventListener("pointermove", this.onPointerMove, { passive: false });
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
    this.container.addEventListener("wheel", this.onWheel, { passive: false });
  }

  onPointerDown(e) {
    this.isDragging = true;
    this.lastPointerY = e.clientY;
    this.velocity = 0;
    this.container.classList.add("is-manipulating");
  }

  onPointerMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();

    const deltaY = e.clientY - this.lastPointerY;
    this.lastPointerY = e.clientY;

    const angleDelta = deltaY * this.options.dragSensitivity;
    this.angle += angleDelta;
    this.velocity = angleDelta;
  }

  onPointerUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.container.classList.remove("is-manipulating");
  }

  onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY * this.options.wheelSensitivity;
    this.velocity += delta;
  }

  updateItemCount(count) {
    this.options.itemCount = count;
    this.stepAngle = (Math.PI * 2) / Math.max(1, count);
    this.snapToIndex(this.selectedIndex);
  }

  snapToIndex(index) {
    this.selectedIndex = ((index % this.options.itemCount) + this.options.itemCount) % this.options.itemCount;
    this.targetAngle = -this.selectedIndex * this.stepAngle;
  }

  startLoop() {
    const render = () => {
      this.updatePhysics();
      this.applyTransforms();
      this.animFrameId = requestAnimationFrame(render);
    };
    this.animFrameId = requestAnimationFrame(render);
  }

  updatePhysics() {
    if (this.isDragging) return;

    this.velocity *= this.options.friction;
    this.angle += this.velocity;

    if (Math.abs(this.velocity) < 0.003) {
      const nearestStep = Math.round(-this.angle / this.stepAngle);
      this.targetAngle = -nearestStep * this.stepAngle;

      const snapDistance = this.targetAngle - this.angle;
      this.angle += snapDistance * this.options.snapStrength;

      const normalizedIndex = ((nearestStep % this.options.itemCount) + this.options.itemCount) % this.options.itemCount;
      if (normalizedIndex !== this.selectedIndex && Math.abs(snapDistance) < 0.08) {
        this.selectedIndex = normalizedIndex;
        this.emitSelection(this.selectedIndex);
      }
    }
  }

  applyTransforms() {
    const items = this.container.children;
    const count = items.length;
    if (!count) return;

    const radius = this.options.radius;
    const centerOffset = this.angle;

    for (let i = 0; i < count; i++) {
      const item = items[i];
      const theta = (i * this.stepAngle) + centerOffset;
      const wrappedTheta = Math.atan2(Math.sin(theta), Math.cos(theta));

      const cos = Math.cos(wrappedTheta);
      const sin = Math.sin(wrappedTheta);

      const y = sin * radius;
      const z = (cos - 1) * (radius * 0.6);
      const scale = Math.max(0.65, (cos + 1.2) / 2.2);
      const opacity = Math.max(0.08, Math.pow(Math.max(0, cos), 1.8));

      item.style.transform = `translate3d(0, ${y.toFixed(2)}px, ${z.toFixed(2)}px) scale(${scale.toFixed(3)})`;
      item.style.opacity = opacity.toFixed(3);
      item.style.zIndex = Math.round((cos + 1) * 100);

      item.classList.toggle("is-active", i === this.selectedIndex);
    }
  }

  emitSelection(index) {
    const event = new CustomEvent("rotary:change", {
      bubbles: true,
      detail: { index }
    });
    this.container.dispatchEvent(event);

    if (typeof this.options.onSelect === "function") {
      this.options.onSelect(index);
    }
  }

  destroy() {
    cancelAnimationFrame(this.animFrameId);
    this.container.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
    this.container.removeEventListener("wheel", this.onWheel);
  }
}