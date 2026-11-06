/**
 * @file
 * Pattern Board: split-flap letters that cascade in once, row by row.
 *
 * Only runs on views with this Pattern; with JS off the cards still turn and
 * read as plain text.
 *
 * @license SPDX-License-Identifier: GPL-2.0-or-later
 */

((Drupal, once) => {
  const controllers = new WeakMap();

  Drupal.behaviors.vvjPatternVvjfBoard = {
    attach(context) {
      once(
        'vvj-pattern-vvjf-board',
        '.vvj-pattern--vvjf-board',
        context,
      ).forEach((root) => {
        const controller = new AbortController();
        controllers.set(root, controller);
        const { signal } = controller;
        Drupal.Vvjf.addTurnButtons(root, signal);
        root
          .querySelectorAll('.flipbox-front :is(.vvj-kicker, .vvj-title)')
          .forEach((el) => {
            // Words first, then the letters inside each word, so a line
            // breaks between words, never inside one. The cascade order
            // (--vvj-i) then runs over every letter of the line.
            Drupal.Vvj.splitText(el, { unit: 'word' });
            el.querySelectorAll('.vvj-word > span').forEach((word) =>
              Drupal.Vvj.splitText(word, { unit: 'char' }),
            );
            el.querySelectorAll('.vvj-char').forEach((char, index) => {
              char.style.setProperty('--vvj-i', String(index));
            });
          });
        root.querySelectorAll('.flipbox-item').forEach((item, row) => {
          item.style.setProperty('--vvjf-row', String(row));
        });
        const reveal = () => root.classList.add('vvjf-board-in');
        if (Drupal.Vvj.reducedMotion() || !('IntersectionObserver' in window)) {
          reveal();
        } else {
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting) {
                reveal();
                observer.disconnect();
              }
            },
            { threshold: 0.3 },
          );
          observer.observe(root);
          signal.addEventListener('abort', () => observer.disconnect(), {
            once: true,
          });
        }
      });
    },
    detach(context, settings, trigger) {
      if (trigger !== 'unload') {
        return;
      }
      once
        .remove('vvj-pattern-vvjf-board', '.vvj-pattern--vvjf-board', context)
        .forEach((root) => {
          controllers.get(root)?.abort();
          controllers.delete(root);
        });
    },
  };
})(Drupal, once);
