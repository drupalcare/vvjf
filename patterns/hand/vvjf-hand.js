/**
 * @file
 * Pattern Hand: a turn button on each card, and the deal-in class.
 *
 * Only runs on views with this Pattern; with JS off the cards still turn and
 * read as plain text.
 *
 * @license SPDX-License-Identifier: GPL-2.0-or-later
 */

((Drupal, once) => {
  const controllers = new WeakMap();

  Drupal.behaviors.vvjPatternVvjfHand = {
    attach(context) {
      once('vvj-pattern-vvjf-hand', '.vvj-pattern--vvjf-hand', context).forEach(
        (root) => {
          const controller = new AbortController();
          controllers.set(root, controller);
          const { signal } = controller;
          Drupal.Vvjf.addTurnButtons(root, signal);
          root.classList.add('vvjf-hand-in');
        },
      );
    },
    detach(context, settings, trigger) {
      if (trigger !== 'unload') {
        return;
      }
      once
        .remove('vvj-pattern-vvjf-hand', '.vvj-pattern--vvjf-hand', context)
        .forEach((root) => {
          controllers.get(root)?.abort();
          controllers.delete(root);
        });
    },
  };
})(Drupal, once);
