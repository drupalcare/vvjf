/**
 * @file
 * Pattern Rail: a bottom bar with previous, next, a position track and a
 * counter. The touch swipe comes from the shared vvj_patterns/scroll-strip.
 *
 * Only runs on views with this Pattern; with JS off the cards still turn and
 * read as plain text.
 *
 * @license SPDX-License-Identifier: GPL-2.0-or-later
 */

((Drupal, once) => {
  const controllers = new WeakMap();

  Drupal.behaviors.vvjPatternVvjfRail = {
    attach(context) {
      once('vvj-pattern-vvjf-rail', '.vvj-pattern--vvjf-rail', context).forEach(
        (root) => {
          const controller = new AbortController();
          controllers.set(root, controller);
          const { signal } = controller;
          const strip = root.querySelector('.flipbox-inner');
          const cards = root.querySelectorAll('.flipbox-item');
          if (!strip || !cards.length) {
            return;
          }
          const bar = document.createElement('div');
          bar.className = 'vvjf-railnav';
          bar.setAttribute('role', 'group');
          bar.setAttribute('aria-label', Drupal.t('Scroll the cards'));
          const prev = document.createElement('button');
          prev.type = 'button';
          prev.className = 'vvjf-btn vvjf-prev';
          prev.setAttribute('aria-label', Drupal.t('Previous cards'));
          const next = document.createElement('button');
          next.type = 'button';
          next.className = 'vvjf-btn vvjf-next';
          next.setAttribute('aria-label', Drupal.t('Next cards'));
          const track = document.createElement('div');
          track.className = 'vvjf-rail-track';
          track.setAttribute('aria-hidden', 'true');
          const thumb = document.createElement('span');
          thumb.className = 'vvjf-rail-thumb';
          track.appendChild(thumb);
          const count = document.createElement('p');
          count.className = 'vvjf-rail-count';
          const now = document.createElement('span');
          now.className = 'vvjf-rail-now';
          now.textContent = '1';
          count.append(now, ` / ${cards.length}`);
          bar.append(prev, track, count, next);
          strip.after(bar);
          const update = () => {
            const max = strip.scrollWidth - strip.clientWidth;
            const offset = Math.abs(strip.scrollLeft);
            const size = strip.scrollWidth ? strip.clientWidth / strip.scrollWidth : 1;
            thumb.style.setProperty('--vvjf-rail-p', max > 0 ? (offset / max).toFixed(3) : '0');
            thumb.style.setProperty('--vvjf-rail-size', Math.min(1, size).toFixed(3));
            const step = cards[0].getBoundingClientRect().width || 1;
            now.textContent = String(
              Math.min(cards.length, Math.round(offset / step) + 1),
            );
          };
          strip.addEventListener('scroll', update, { passive: true, signal });
          // The swipe on touch screens comes from Drupal.Vvj.ScrollStrip,
          // because this row is overflow-x: hidden (see vvjf-rail.css).
          // eslint-disable-next-line no-new
          new Drupal.Vvj.ScrollStrip(strip, { prev, next, root, signal });
          update();
          signal.addEventListener('abort', () => bar.remove(), { once: true });
        },
      );
    },
    detach(context, settings, trigger) {
      if (trigger !== 'unload') {
        return;
      }
      once
        .remove('vvj-pattern-vvjf-rail', '.vvj-pattern--vvjf-rail', context)
        .forEach((root) => {
          controllers.get(root)?.abort();
          controllers.delete(root);
        });
    },
  };
})(Drupal, once);
