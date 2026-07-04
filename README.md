# Views Vanilla JavaScript 3D Flipbox (VVJF)

A vanilla-JavaScript 3D flip-card grid **Views format** for Drupal 11.3+ / 12.
Renders Views rows as flippable cards with hover or click triggers, configurable
horizontal or vertical flip axis, breakpoint-gated activation, configurable
front/back background colors, and AAA-conformant ARIA state management.

v2.0 builds on the **`drupal/vvj_core` foundation** (composer auto-installs it).
Behavior runs in a `<vvjf-flipbox>` custom element extending `VvjElementBase`.

## Features

- Hover and click triggers (Enter/Space keyboard fallback)
- Horizontal (Y-axis) or vertical (X-axis) flip direction
- Configurable flip speed (0.1 - 2.0 s) + 5 easing curves
- Configurable box height, min-width, grid gap, perspective
- Front + back background colors (independent)
- 6 responsive breakpoints (`all` / 576 / 768 / 992 / 1200 / 1400 px) — flipbox
  active above the chosen viewport
- ARIA `aria-hidden` and `tabindex` synchronized to the flipped state
- On viewports below the breakpoint: both sides visible, flip disabled, every
  nested element tabbable
- Lazy IntersectionObserver hydration; AbortController-tracked listeners
- Throttled resize handler keeps state in sync with viewport changes
- **Views tokens** — `[vvjf:field]` / `[vvjf:field:plain]` in Views text areas
  with *Use replacement tokens from the first row*
- **Drupal admin help** — `/admin/help/vvjf`

## Installation

```bash
composer require drupal/vvjf:^2.0
drush en vvjf
```

## Usage

1. Create or edit a View.
2. Set **Format** to *Views Vanilla JavaScript 3D Flipbox*.
3. Set **Show** to *Fields*.
4. Place a `<div class="vvjf-separator"></div>` field (or a Custom field whose
   output is that markup) between the front and back fields. Everything before
   the separator becomes the front; everything after becomes the back.
5. Configure dimensions / behavior / styling / animation / responsive in the
   format settings.
6. Save.

**Sample view:** Optional config `views.view.vvjf_example` (`config/optional/`)
installs when there is no ID conflict.

## Drop-in upgrade from 1.x

`composer update drupal/vvjf && drush updb && drush cr` is sufficient. v2
preserves:

- Plugin ID `views_vvjf`, theme hook `views_view_vvjf`
- Twig template names
- All option keys
- Library names (`vvjf`, `vvjf-style`, `vvjf__all/576/768/992/1200/1400`)
- JS behavior key `Drupal.behaviors.VVJFlipbox`
- All CSS class names (`.vvjf`, `.flipbox-inner`, `.flipbox-item`, `.flipbox-
  item-inner`, `.flipbox-front`, `.flipbox-back`, `.flipped`)
- Separator marker `<div class="vvjf-separator"></div>`

Outer rendered tag changed from `<div>` to `<vvjf-flipbox>`. Theme selectors
targeting `.vvjf` keep matching.

## License

GPL-2.0-or-later.
