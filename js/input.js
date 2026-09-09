/**
 * PRABHAS: KASI 2898 AD (3D Runner)
 * Input Manager: Keyboard, Touch Swipes, Pointer Tracking
 */

export class InputManager3D {
  constructor(callbacks = {}) {
    this.callbacks = {
      onLeft: callbacks.onLeft || (() => {}),
      onRight: callbacks.onRight || (() => {}),
      onJump: callbacks.onJump || (() => {}),
      onSlide: callbacks.onSlide || (() => {}),
      onShoot: callbacks.onShoot || (() => {}),
      onPause: callbacks.onPause || (() => {}),
      onStart: callbacks.onStart || (() => {})
    };

    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.isSwiping = false;

    this.bindEvents();
  }

  bindEvents() {
    // 1. Keyboard Controls
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));

    // 2. Touch Swipes (Mobile & Tablets)
    const viewport = document.getElementById("canvas-container") || document.body;

    viewport.addEventListener("touchstart", (e) => {
      if (e.target.closest("button") || e.target.closest(".interactive-ui")) return;
      if (e.touches && e.touches.length > 0) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartTime = performance.now();
        this.isSwiping = true;
      }
    }, { passive: true });

    viewport.addEventListener("touchend", (e) => {
      if (!this.isSwiping) return;
      this.isSwiping = false;
      if (e.target.closest("button") || e.target.closest(".interactive-ui")) return;

      if (e.changedTouches && e.changedTouches.length > 0) {
        const dx = e.changedTouches[0].clientX - this.touchStartX;
        const dy = e.changedTouches[0].clientY - this.touchStartY;
        const dt = performance.now() - this.touchStartTime;

        this.processSwipe(dx, dy, dt);
      }
    }, { passive: true });

    // 3. Mouse Pointer Drag (Desktop Swipe Support)
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerStartTime = 0;
    let isPointerDown = false;

    viewport.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button === 0) {
        if (e.target.closest("button") || e.target.closest(".interactive-ui")) return;
        pointerStartX = e.clientX;
        pointerStartY = e.clientY;
        pointerStartTime = performance.now();
        isPointerDown = true;
      }
    });

    viewport.addEventListener("pointerup", (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      if (e.target.closest("button") || e.target.closest(".interactive-ui")) return;

      const dx = e.clientX - pointerStartX;
      const dy = e.clientY - pointerStartY;
      const dt = performance.now() - pointerStartTime;

      this.processSwipe(dx, dy, dt);
    });
  }

  processSwipe(dx, dy, dt) {
    const minDistance = 25; // minimum pixel threshold
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < minDistance && absY < minDistance) {
      // Single Click / Tap (not swipe) -> Shoot Gauntlet Laser (same as Spacebar)!
      this.callbacks.onShoot();
      return;
    }

    if (absX > absY) {
      // Horizontal swipe
      if (dx < 0) {
        this.callbacks.onLeft();
      } else {
        this.callbacks.onRight();
      }
    } else {
      // Vertical swipe
      if (dy < 0) {
        this.callbacks.onJump();
      } else {
        this.callbacks.onSlide();
      }
    }
  }

  handleKeyDown(e) {
    const key = e.key;
    const code = e.code;

    // Prevent default scroll on arrow keys / space
    if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Spacebar"].includes(key) || code === "Space") {
      e.preventDefault();
    }

    if (key === " " || key === "Spacebar" || code === "Space") {
      this.callbacks.onShoot(); // Spacebar STRICTLY fires Gauntlet Laser Blast!
    } else if (key === "ArrowLeft" || key === "a" || key === "A") {
      this.callbacks.onLeft();
    } else if (key === "ArrowRight" || key === "d" || key === "D") {
      this.callbacks.onRight();
    } else if (key === "ArrowUp" || key === "w" || key === "W") {
      this.callbacks.onJump();
    } else if (key === "ArrowDown" || key === "s" || key === "S") {
      this.callbacks.onSlide();
    } else if (key === "p" || key === "P" || key === "Escape") {
      this.callbacks.onPause();
    } else if (key === "Enter") {
      this.callbacks.onStart();
    }
  }
}
