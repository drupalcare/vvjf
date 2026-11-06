/**
 * @file
 * Turn buttons for vvjf Patterns: one real button per card.
 *
 * The button sits beside the card (not inside the clickable face), so its
 * click does not reach the card. It turns the card through the card's own
 * click handler, so vvjf keeps aria-hidden and tabindex in step, and its
 * aria-pressed follows the card however it was turned. Focus stays on the
 * button. While a card has its button, its faces are not focusable and a
 * flip that hides the focused face moves focus to the button. Called by
 * every vvjf Pattern script.
 *
 * @license SPDX-License-Identifier: GPL-2.0-or-later
 */

((Drupal) => {
  Drupal.Vvjf = Drupal.Vvjf || {};

  /**
   * Turns one card to a side, through vvjf's own click handler.
   *
   * @param {HTMLElement} inner
   *   The `.flipbox-item-inner` of the card.
   * @param {boolean} back
   *   TRUE for the back face.
   */
  Drupal.Vvjf.turnTo = (inner, back) => {
    if (inner.classList.contains('flipped') !== back) {
      inner.click();
    }
  };

  /**
   * Adds a turn button to every card of a flipbox.
   *
   * @param {HTMLElement} root
   *   The `<vvjf-flipbox>` element.
   * @param {AbortSignal} signal
   *   Removes the buttons and their listeners.
   */
  Drupal.Vvjf.addTurnButtons = (root, signal) => {
    root.querySelectorAll('.flipbox-item').forEach((item) => {
      const inner = item.querySelector('.flipbox-item-inner');
      if (!inner) {
        return;
      }
      const title = item.querySelector('.flipbox-front .vvj-title');
      const button = document.createElement('button');
      button.type = 'button';
      // One class per mode (vvj_core/docs/JS-RULES.md rule 11).
      const mode =
        root.getAttribute('data-flip-trigger') === 'hover' ? 'hover' : 'click';
      button.className = `vvjf-btn vvjf-turn vvjf-turn--${mode}`;
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute(
        'aria-label',
        title
          ? Drupal.t('Turn over: @title', {
              '@title': title.textContent.trim(),
            })
          : Drupal.t('Turn over'),
      );
      if (mode === 'click') {
        button.addEventListener('click', () => inner.click(), { signal });
      } else {
        // Hover mode: the pointer turns the card, and the card has no click
        // handler. Keyboard (detail 0) and touch turn it through the card's
        // own key handler, so a mouse click never fights the hover.
        button.addEventListener(
          'click',
          (event) => {
            if (
              event.detail !== 0 &&
              window.matchMedia('(hover: hover)').matches
            ) {
              return;
            }
            inner.dispatchEvent(
              new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
            );
          },
          { signal },
        );
      }
      item.appendChild(button);
      const sync = () =>
        button.setAttribute(
          'aria-pressed',
          inner.classList.contains('flipped') ? 'true' : 'false',
        );
      const observer = new MutationObserver(sync);
      observer.observe(inner, { attributes: true, attributeFilter: ['class'] });
      signal.addEventListener(
        'abort',
        () => {
          observer.disconnect();
          button.remove();
        },
        { once: true },
      );
    });
    // The faces stop being focusable now that each card has a button, and
    // become focusable again when the buttons go.
    const refresh = () => {
      if (typeof root.refreshFaces === 'function') {
        root.refreshFaces();
      }
    };
    refresh();
    signal.addEventListener('abort', refresh, { once: true });
  };
})(Drupal);
