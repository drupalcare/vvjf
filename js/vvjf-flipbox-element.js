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
 *   - The width compared is the window's, or for a Pattern (class
 *     `vvj-pattern`) the element's own width, so a Pattern in a narrow
 *     column stacks the same way its `@container vvj-region` CSS does.
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
  const { ElementBase, ownWidth, watchOwnWidth } = Drupal.Vvj;

  const TABBABLE = 'a, button, input, select, textarea, [tabindex]';

  // Controls a visitor uses inside a face. A click or key press on one of
  // these does its own job and never turns the card.
  const INTERACTIVE =
    'a[href], button, input, select, textarea, summary, label, [contenteditable]';

  /**
   * Whether an event started on a control inside a card face.
   *
   * @param {Event} event
   *   The click or keydown event.
   * @param {HTMLElement} inner
   *   The `.flipbox-item-inner` of the card.
   *
   * @return {boolean}
   *   TRUE when the target is a link or form control inside the card.
   */
  function fromControl(event, inner) {
    const { target } = event;
    if (!(target instanceof Element) || target === inner) {
      return false;
    }
    const control = target.closest(INTERACTIVE);
    return !!control && inner.contains(control);
  }

  /**
   * The Turn button a Pattern adds beside a card, if any.
   *
   * @param {HTMLElement} inner
   *   The `.flipbox-item-inner` of the card.
   *
   * @return {HTMLElement|null}
   *   The `.vvjf-turn` button, or NULL on a view without one.
   */
  function turnButton(inner) {
    const item = inner.closest('.flipbox-item');
    return item
      ? item.querySelector(':scope > :is(.vvjf-turn--click, .vvjf-turn--hover)')
      : null;
  }

  function throttle(fn, limit) {
    let lastFn;
    let lastRan = 0;
    return (...args) => {
      const now = Date.now();
      if (!lastRan || now - lastRan >= limit) {
        fn(...args);
        lastRan = now;
      } else {
        clearTimeout(lastFn);
        lastFn = setTimeout(
          () => {
            fn(...args);
            lastRan = Date.now();
          },
          limit - (now - lastRan),
        );
      }
    };
  }

  class VvjfFlipboxElement extends ElementBase {
    static get patternSlug() {
      return 'vvjf';
    }

    constructor() {
      super();
      this._trigger = 'click';
      this._breakpoint = 576;
      this._breakpointAll = false;
      this._items = [];
      this._cardListeners = new WeakMap();
      this._patterned = false;
      this._width = 0;
    }

    onHydrate() {
      const breakpointAttr = this.getAttribute('data-breakpoints') ?? '';
      this._breakpointAll = breakpointAttr === 'all';
      const parsed = parseInt(breakpointAttr, 10);
      this._breakpoint = Number.isFinite(parsed) ? parsed : 576;

      this._trigger =
        this.getAttribute('data-flip-trigger') === 'hover' ? 'hover' : 'click';

      this._items = this.querySelectorAll('.flipbox-item-inner');
      if (!this._items.length) {
        return;
      }

      // A Pattern follows the room it has (a narrow column on a wide
      // screen stacks too); a view without a Pattern keeps the window.
      this._patterned = this.classList.contains('vvj-pattern');
      if (this._patterned) {
        this._width = ownWidth(this);
      }

      this._applyState();

      if (this._patterned) {
        watchOwnWidth(this, this.signal, (width) => {
          if (width === this._width) {
            return;
          }
          this._width = width;
          this._resetFlipped();
          this._applyState();
        });
        return;
      }

      const onResize = throttle(() => {
        this._resetFlipped();
        this._applyState();
      }, 200);
      window.addEventListener('resize', onResize, { signal: this.signal });
    }

    /**
     * Re-applies face focus and ARIA after Turn buttons come or go.
     *
     * Called by `Drupal.Vvjf.addTurnButtons()`; a no-op until hydrated.
     */
    refreshFaces() {
      if (this.hydrated && this._isActiveAtCurrentWidth()) {
        this._setAriaForActive();
      }
    }

    // -----------------------------------------------------------------
    // State application — toggles flip behavior + ARIA for the current
    // viewport.
    // -----------------------------------------------------------------

    _applyState() {
      const active = this._isActiveAtCurrentWidth();
      // Patterns only (class `vvj-pattern`): mark the stacked state below
      // the breakpoint so Pattern CSS and scripts can follow it. A view
      // without a Pattern never gets the class.
      if (this.classList.contains('vvj-pattern')) {
        this.classList.toggle('vvjf-off', !active);
      }
      if (active) {
        this._activate();
        this._setAriaForActive();
      } else {
        this._deactivate();
        this._setAriaForInactive();
      }
    }

    _isActiveAtCurrentWidth() {
      if (this._breakpointAll) {
        return true;
      }
      const width = this._patterned ? this._width : window.innerWidth;
      return width >= this._breakpoint;
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
      if (!front || !back) {
        return;
      }

      /** @type {AbortController} */
      const cardAbort = new AbortController();
      this._cardListeners.set(inner, cardAbort);

      const flip = (value) => {
        const isFlipped =
          value !== undefined ? value : inner.classList.toggle('flipped');
        if (value !== undefined) {
          inner.classList.toggle('flipped', isFlipped);
        }
        this._updateAccessibility(front, back, isFlipped);
      };

      // Escape turns a turned card back, from anywhere in the card: its
      // faces, a link on the back, or its Turn button beside the face.
      const item = inner.closest('.flipbox-item') || inner;
      item.addEventListener(
        'keydown',
        (event) => {
          if (
            event.key === 'Escape' &&
            !event.defaultPrevented &&
            inner.classList.contains('flipped')
          ) {
            event.preventDefault();
            flip(false);
          }
        },
        { signal: cardAbort.signal },
      );

      const onKeydown = (event) => {
        // Enter on a link or a button inside a face does its own job.
        if (fromControl(event, inner)) {
          return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          flip();
        }
      };

      if (this._trigger === 'hover') {
        // Listen on the outer card, whose box does not turn: the inner box
        // rotates and leaves the cursor mid-flip (JS-RULES.md rule 1).
        const hoverTarget = inner.closest('.flipbox-item') || inner;
        hoverTarget.addEventListener('mouseenter', () => flip(true), {
          signal: cardAbort.signal,
        });
        // The pointer leaving never turns a card back while focus is inside
        // it, so a keyboard user on a back-face link keeps it.
        hoverTarget.addEventListener(
          'mouseleave',
          () => {
            if (!hoverTarget.contains(document.activeElement)) {
              flip(false);
            }
          },
          { signal: cardAbort.signal },
        );
        // Focus leaving a card the pointer is not over turns it back.
        hoverTarget.addEventListener(
          'focusout',
          (event) => {
            const next = event.relatedTarget;
            if (
              inner.classList.contains('flipped') &&
              !(next instanceof Node && hoverTarget.contains(next)) &&
              !hoverTarget.matches(':hover')
            ) {
              flip(false);
            }
          },
          { signal: cardAbort.signal },
        );
      } else {
        inner.addEventListener(
          'click',
          (event) => {
            // A link or a button on the face works as itself.
            if (!fromControl(event, inner)) {
              flip();
            }
          },
          { signal: cardAbort.signal },
        );
      }
      inner.addEventListener('keydown', onKeydown, {
        signal: cardAbort.signal,
      });

      // The card-scoped controller is also aborted when the host element
      // disconnects, via the parent signal.
      this.signal.addEventListener('abort', () => cardAbort.abort(), {
        once: true,
      });
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
        if (!front || !back) {
          return;
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
        if (!front || !back) {
          return;
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
      if (!front || !back) {
        return;
      }
      const frontHidden = isFlipped ? 'true' : 'false';
      const backHidden = isFlipped ? 'false' : 'true';
      front.setAttribute('aria-hidden', frontHidden);
      back.setAttribute('aria-hidden', backHidden);
      const turn = turnButton(front.parentElement);
      if (turn) {
        // The Turn button is the card's one control; a face is not a
        // second, focusable copy of it.
        front.removeAttribute('tabindex');
        back.removeAttribute('tabindex');
      } else {
        front.setAttribute('tabindex', frontHidden === 'true' ? '-1' : '0');
        back.setAttribute('tabindex', backHidden === 'true' ? '-1' : '0');
      }

      front.querySelectorAll(TABBABLE).forEach((el) => {
        el.setAttribute('tabindex', isFlipped ? '-1' : '0');
      });
      back.querySelectorAll(TABBABLE).forEach((el) => {
        if (this._trigger === 'click') {
          el.setAttribute('tabindex', isFlipped ? '0' : '-1');
        } else {
          el.setAttribute('tabindex', isFlipped ? '0' : '-1');
        }
      });

      // Never leave focus inside the face that just became aria-hidden:
      // move it to the Turn button, or else to the face now showing.
      const hidden = isFlipped ? front : back;
      if (hidden.contains(document.activeElement)) {
        (turn || (isFlipped ? back : front)).focus({ preventScroll: true });
      }
    }
  }

  if (!customElements.get('vvjf-flipbox')) {
    customElements.define('vvjf-flipbox', VvjfFlipboxElement);
  }
})(Drupal);
