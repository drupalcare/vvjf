/**
 * @file
 * VvjfFlipboxElement — `<vvjf-flipbox>` custom element.
 *
 * Extends `Drupal.Vvj.ElementBase` from `vvj_core`. 3D flip-card grid
 * with hover or click triggers, RTL-safe ARIA state, viewport-gated
 * activation:
 *   - Above breakpoint (or `data-breakpoints="all"`): flip enabled,
 *     ARIA + tabindex track flipped state.
 *   - Below breakpoint: flip disabled, both sides visible, all
 *     elements tabbable. Active flips are reset on resize.
 *
 * The base class is pulled from the `Drupal.Vvj` namespace — Drupal
 * core's cross-file sharing pattern — with load order guaranteed by the
 * `vvjf` library's `dependencies:`.
 *
 * @license SPDX-License-Identifier: GPL-2.0-or-later
 */

// phpcs:disable Drupal.NamingConventions.UpperCaseConstant
// phpcs:disable Generic.PHP.UpperCaseConstant
// phpcs:disable Squiz.WhiteSpace.OperatorSpacing

((Drupal) => {
  'use strict';

  const { ElementBase } = Drupal.Vvj;

  const TABBABLE = 'a, button, input, select, textarea, [tabindex]';

  function throttle(fn, limit) {
    let lastFn;
    let lastRan = 0;
    return (...args) => {
      const now = Date.now();
      if (!lastRan || now - lastRan >= limit) {
        fn(...args);
        lastRan = now;
      }
      else {
        clearTimeout(lastFn);
        lastFn = setTimeout(() => {
          fn(...args);
          lastRan = Date.now();
        }, limit - (now - lastRan));
      }
    };
  }

  class VvjfFlipboxElement extends ElementBase {

    static get patternSlug() {
 return 'vvjf'; }

    constructor() {
      super();
      this._trigger = 'click';
      this._breakpoint = 576;
      this._breakpointAll = false;
      this._items = [];
      this._cardListeners = new WeakMap();
    }

    onHydrate() {
      const breakpointAttr = this.getAttribute('data-breakpoints') ?? '';
      this._breakpointAll = breakpointAttr === 'all';
      const parsed = parseInt(breakpointAttr, 10);
      this._breakpoint = Number.isFinite(parsed) ? parsed : 576;

      this._trigger = this.getAttribute('data-flip-trigger') === 'hover' ? 'hover' : 'click';

      this._items = this.querySelectorAll('.flipbox-item-inner');
      if (!this._items.length) { return;
      }

      this._applyState();

      const onResize = throttle(() => {
        this._resetFlipped();
        this._applyState();
      }, 200);
      window.addEventListener('resize', onResize, { signal: this.signal });
    }

    // -----------------------------------------------------------------
    // State application — toggles flip behavior + ARIA for the current
    // viewport.
    // -----------------------------------------------------------------

    _applyState() {
      const active = this._isActiveAtCurrentWidth();
      if (active) {
        this._activate();
        this._setAriaForActive();
        this._disableNestedLinks(this._trigger === 'click');
      }
      else {
        this._deactivate();
        this._setAriaForInactive();
        this._disableNestedLinks(false);
      }
    }

    _isActiveAtCurrentWidth() {
      if (this._breakpointAll) { return true;
      }
      return window.innerWidth >= this._breakpoint;
    }

    _activate() {
      this._items.forEach((inner) => this._bindCard(inner));
    }

    _deactivate() {
      this._items.forEach((inner) => {
        inner.classList.remove('flipped');
        this._unbindCard(inner);
      });
    }

    _resetFlipped() {
      this._items.forEach((inner) => {
        if (inner.classList.contains('flipped')) {
          inner.classList.remove('flipped');
          const front = inner.querySelector('.flipbox-front');
          const back = inner.querySelector('.flipbox-back');
          this._updateAccessibility(front, back, false);
        }
      });
    }

    // -----------------------------------------------------------------
    // Per-card listener wiring (re-entrant).
    // -----------------------------------------------------------------

    _bindCard(inner) {
      if (this._cardListeners.has(inner)) {
        // Already bound — listeners survive deactivate-then-activate by
        // virtue of being tracked via `this.signal`, but the listener
        // *set* is rewritten when the trigger changes, so always rebind.
        this._unbindCard(inner);
      }

      const front = inner.querySelector('.flipbox-front');
      const back = inner.querySelector('.flipbox-back');
      if (!front || !back) { return;
      }

      /** @type {AbortController} */
      const cardAbort = new AbortController();
      this._cardListeners.set(inner, cardAbort);

      const flip = (value) => {
        const isFlipped = value !== undefined ? value : inner.classList.toggle('flipped');
        if (value !== undefined) {
          inner.classList.toggle('flipped', isFlipped);
        }
        this._updateAccessibility(front, back, isFlipped);
      };

      const onKeydown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          flip();
        }
      };

      if (this._trigger === 'hover') {
        inner.addEventListener('mouseenter', () => flip(true), { signal: cardAbort.signal });
        inner.addEventListener('mouseleave', () => flip(false), { signal: cardAbort.signal });
      }
      else {
        inner.addEventListener('click', () => flip(), { signal: cardAbort.signal });
      }
      inner.addEventListener('keydown', onKeydown, { signal: cardAbort.signal });

      // The card-scoped controller is also aborted when the host element
      // disconnects, via the parent signal.
      this.signal.addEventListener('abort', () => cardAbort.abort(), { once: true });
    }

    _unbindCard(inner) {
      const ctl = this._cardListeners.get(inner);
      if (ctl) {
        ctl.abort();
        this._cardListeners.delete(inner);
      }
    }

    // -----------------------------------------------------------------
    // ARIA + tabindex.
    // -----------------------------------------------------------------

    _setAriaForActive() {
      this._items.forEach((inner) => {
        const front = inner.querySelector('.flipbox-front');
        const back = inner.querySelector('.flipbox-back');
        if (!front || !back) { return;
        }
        const isFlipped = inner.classList.contains('flipped');
        this._updateAccessibility(front, back, isFlipped);
      });
    }

    _setAriaForInactive() {
      // Both sides visible, all elements tabbable, no aria-hidden.
      this._items.forEach((inner) => {
        const front = inner.querySelector('.flipbox-front');
        const back = inner.querySelector('.flipbox-back');
        if (!front || !back) { return;
        }
        front.setAttribute('aria-hidden', 'false');
        back.setAttribute('aria-hidden', 'false');
        front.removeAttribute('tabindex');
        back.removeAttribute('tabindex');
      });
      this.querySelectorAll(TABBABLE).forEach((el) => {
        el.setAttribute('tabindex', '0');
      });
    }

    _updateAccessibility(front, back, isFlipped) {
      if (!front || !back) { return;
      }
      const frontHidden = isFlipped ? 'true' : 'false';
      const backHidden = isFlipped ? 'false' : 'true';
      front.setAttribute('aria-hidden', frontHidden);
      back.setAttribute('aria-hidden', backHidden);
      front.setAttribute('tabindex', frontHidden === 'true' ? '-1' : '0');
      back.setAttribute('tabindex', backHidden === 'true' ? '-1' : '0');

      front.querySelectorAll(TABBABLE).forEach((el) => {
        el.setAttribute('tabindex', isFlipped ? '-1' : '0');
      });
      back.querySelectorAll(TABBABLE).forEach((el) => {
        if (this._trigger === 'click') {
          el.setAttribute('tabindex', isFlipped ? '0' : '-1');
        }
        else {
          el.setAttribute('tabindex', isFlipped ? '0' : '-1');
        }
      });
    }

    /**
     * Disable click-through on nested anchors when the parent card
     * itself is the click target. Re-enabled when flipbox is inactive
     * or in hover mode.
     *
     * @param {boolean} disable
     *   True to suppress nested-link clicks.
     */
    _disableNestedLinks(disable) {
      this._nestedLinksDisabled = disable;
      const links = this.querySelectorAll('.flipbox-front a, .flipbox-back a');
      links.forEach((link) => {
        if (disable) {
          link.setAttribute('tabindex', '-1');
          link.dataset.vvjfDisabled = 'true';
        }
        else if (link.dataset.vvjfDisabled === 'true') {
          link.removeAttribute('tabindex');
          delete link.dataset.vvjfDisabled;
        }
      });
      // Suppress mouse navigation on nested links while disabled (v1 parity;
      // tabindex=-1 alone only blocks keyboard focus). Bind the delegated
      // click guard once — it honors the current _nestedLinksDisabled flag.
      if (!this._nestedLinkGuardBound) {
        this._nestedLinkGuardBound = true;
        this.addEventListener('click', (event) => {
          if (!this._nestedLinksDisabled) { return;
          }
          const target = event.target;
          if (target instanceof Element
            && target.closest('.flipbox-front a, .flipbox-back a')) {
            event.preventDefault();
          }
        }, { signal: this.signal });
      }
    }

  }

  if (!customElements.get('vvjf-flipbox')) {
    customElements.define('vvjf-flipbox', VvjfFlipboxElement);
  }

})(Drupal);
