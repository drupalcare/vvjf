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
      ? item.querySelector(
          ':scope > :is(.vvjf-turn--click, .vvjf-turn--hover, .vvjf-turn--base)',
        )
      : null;
  }

  /**
   * The name a Turn button reads for one card.
   *
   * @param {HTMLElement} item
   *   The `.flipbox-item` of the card.
   * @param {number} index
   *   The card's position, from 1.
   *
   * @return {string}
   *   A translated label that starts with the button's visible text.
   */
  function turnLabel(item, index) {
    const title = item.querySelector(
      '.flipbox-front :is(.vvj-title, h2, h3, h4, h5, h6)',
    );
    const text = title ? title.textContent.trim() : '';
    return text
      ? Drupal.t('Turn over: @title', { '@title': text })
      : Drupal.t('Turn over card @number', { '@number': index });
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

      // A view without a Pattern gets one real Turn button per card, so a
      // keyboard or screen reader user meets a named button with a pressed
      // state instead of a focusable face (Patterns add their own).
      if (!this._patterned) {
        this._addBaseButtons();
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
     * Adds a Turn button beside each card of a view without a Pattern.
     *
     * The button is visually hidden until it has focus, so the view looks
     * as before for a pointer user. It turns the card through the card's
     * own key handler, which keeps aria-hidden, inert and aria-pressed in
     * step in both trigger modes.
     */
    _addBaseButtons() {
      this._items.forEach((inner, index) => {
        const item = inner.closest('.flipbox-item');
        if (!item || turnButton(inner)) {
          return;
        }
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'vvjf-turn vvjf-turn--base';
        button.textContent = Drupal.t('Turn over');
        button.setAttribute('aria-label', turnLabel(item, index + 1));
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener(
          'click',
          (event) => {
            // In hover mode a mouse click comes after the pointer already
            // turned the card; only keyboard (detail 0) and touch turn it.
            if (
              this._trigger === 'hover' &&
              event.detail !== 0 &&
              window.matchMedia('(hover: hover)').matches
            ) {
              return;
            }
            inner.dispatchEvent(
              new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
            );
          },
          { signal: this.signal },
        );
        item.appendChild(button);
        this.signal.addEventListener('abort', () => button.remove(), {
          once: true,
        });
      });
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
      // Both faces show below the breakpoint, so there is nothing to turn.
      this.querySelectorAll('.flipbox-item > .vvjf-turn--base').forEach(
        (button) => {
          button.hidden = !active;
        },
      );
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
      // Both sides visible and usable: no aria-hidden, no inert. Controls
      // inside keep their own authored tabindex; the script never set one.
      this._items.forEach((inner) => {
        const front = inner.querySelector('.flipbox-front');
        const back = inner.querySelector('.flipbox-back');
        if (!front || !back) {
          return;
        }
        [front, back].forEach((face) => {
          face.setAttribute('aria-hidden', 'false');
          face.inert = false;
          face.removeAttribute('tabindex');
        });
      });
    }

    _updateAccessibility(front, back, isFlipped) {
      if (!front || !back) {
        return;
      }
      const shown = isFlipped ? back : front;
      const hidden = isFlipped ? front : back;
      const turn = turnButton(front.parentElement);

      // Show the new face first, so focus can move into it.
      shown.setAttribute('aria-hidden', 'false');
      shown.inert = false;
      if (turn) {
        // The Turn button is the card's one control; a face is not a
        // second, focusable copy of it.
        front.removeAttribute('tabindex');
        back.removeAttribute('tabindex');
        turn.setAttribute('aria-pressed', isFlipped ? 'true' : 'false');
      } else {
        // Fallback for a card with no Turn button at all.
        shown.setAttribute('tabindex', '0');
        hidden.setAttribute('tabindex', '-1');
      }

      // Never leave focus inside the face about to be hidden: move it to
      // the Turn button, or else to the face now showing. This runs before
      // `inert`, which would otherwise drop focus to the page body.
      if (hidden.contains(document.activeElement)) {
        (turn || shown).focus({ preventScroll: true });
      }

      // `inert` takes every control of the hidden face out of the Tab order
      // and the accessibility tree without rewriting authored tabindex.
      hidden.setAttribute('aria-hidden', 'true');
      hidden.inert = true;
    }
  }

  if (!customElements.get('vvjf-flipbox')) {
    customElements.define('vvjf-flipbox', VvjfFlipboxElement);
  }
})(Drupal);
