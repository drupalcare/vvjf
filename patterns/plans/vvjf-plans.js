/**
 * @file
 * Pattern Plans: a segmented control turns every card in a wave, plus turn buttons.
 *
 * Only runs on views with this Pattern; with JS off the cards still turn and
 * read as plain text.
 *
 * @license SPDX-License-Identifier: GPL-2.0-or-later
 */

((Drupal, once) => {
  const controllers = new WeakMap();

  Drupal.behaviors.vvjPatternVvjfPlans = {
    attach(context) {
      once(
        'vvj-pattern-vvjf-plans',
        '.vvj-pattern--vvjf-plans',
        context,
      ).forEach((root) => {
        const controller = new AbortController();
        controllers.set(root, controller);
        const { signal } = controller;
        Drupal.Vvjf.addTurnButtons(root, signal);
        const inner = root.querySelector('.flipbox-inner');
        if (!inner) {
          return;
        }
        const group = document.createElement('div');
        group.className = 'vvjf-flipall';
        group.setAttribute('role', 'group');
        group.setAttribute('aria-label', Drupal.t('Show on every card'));
        [Drupal.t('Overview'), Drupal.t('What is included')].forEach(
          (text, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = text;
            button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
            group.appendChild(button);
          },
        );
        inner.before(group);
        const timers = [];
        // eslint-disable-next-line no-new
        new Drupal.Vvj.Segmented(group, {
          signal,
          onSelect: (side) => {
            timers.splice(0).forEach(clearTimeout);
            root.querySelectorAll('.flipbox-item-inner').forEach((card, i) => {
              const delay = Drupal.Vvj.reducedMotion() ? 0 : i * 90;
              timers.push(
                setTimeout(() => Drupal.Vvjf.turnTo(card, side === 1), delay),
              );
            });
          },
        });
        signal.addEventListener(
          'abort',
          () => {
            timers.splice(0).forEach(clearTimeout);
            group.remove();
          },
          { once: true },
        );
      });
    },
    detach(context, settings, trigger) {
      if (trigger !== 'unload') {
        return;
      }
      once
        .remove('vvj-pattern-vvjf-plans', '.vvj-pattern--vvjf-plans', context)
        .forEach((root) => {
          controllers.get(root)?.abort();
          controllers.delete(root);
        });
    },
  };
})(Drupal, once);
