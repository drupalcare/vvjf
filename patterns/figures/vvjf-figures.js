/**
 * @file
 * Pattern Figures: numbers count up once and carry the photo inside the digits.
 *
 * Only runs on views with this Pattern; with JS off the cards still turn and
 * read as plain text.
 *
 * @license SPDX-License-Identifier: GPL-2.0-or-later
 */

((Drupal, once) => {
  const controllers = new WeakMap();

  Drupal.behaviors.vvjPatternVvjfFigures = {
    attach(context) {
      once('vvj-pattern-vvjf-figures', '.vvj-pattern--vvjf-figures', context).forEach(
        (root) => {
          const controller = new AbortController();
          controllers.set(root, controller);
          const { signal } = controller;
          root.querySelectorAll('.flipbox-item').forEach((item) => {
            const count = item.querySelector('.flipbox-front .vvj-count');
            const img = item.querySelector('.flipbox-back .vvj-media img');
            if (count && img) {
              // The back photo is painted inside the digits.
              count.style.setProperty(
                '--vvjf-photo',
                `url("${img.currentSrc || img.src}")`,
              );
              count.classList.add('vvjf-count--photo');
            }
            if (count) {
              Drupal.Vvj.countUp(count, { signal });
            }
          });
          const reveal = () => root.classList.add('vvjf-figures-in');
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
        },
      );
    },
    detach(context, settings, trigger) {
      if (trigger !== 'unload') {
        return;
      }
      once
        .remove('vvj-pattern-vvjf-figures', '.vvj-pattern--vvjf-figures', context)
        .forEach((root) => {
          controllers.get(root)?.abort();
          controllers.delete(root);
        });
    },
  };
})(Drupal, once);
