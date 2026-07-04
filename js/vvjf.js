/**
 * @file
 * VVJF compat shim. Behavior lives in `<vvjf-flipbox>` custom element.
 *
 * @license SPDX-License-Identifier: GPL-2.0-or-later
 */

// phpcs:disable Drupal.NamingConventions.UpperCaseConstant
// phpcs:disable Generic.PHP.UpperCaseConstant
// phpcs:disable Squiz.WhiteSpace.OperatorSpacing

((Drupal, once) => {
  'use strict';

  Drupal.behaviors.VVJFlipbox = {
    attach(context) {
      once('vvjf-flipbox-marker', 'vvjf-flipbox', context);
    },
    detach() {},
  };
})(Drupal, once);
