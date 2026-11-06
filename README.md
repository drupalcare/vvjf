# Views Vanilla JavaScript 3D Flipbox (VVJF)

A vanilla-JavaScript 3D flip-card grid **Views format** for Drupal.
Renders Views rows as flippable cards with hover or click triggers, configurable
horizontal or vertical flip axis, breakpoint-gated activation, configurable
front/back background colors, and AAA-conformant ARIA state management.

- Project page: [drupal.org/project/vvjf](https://www.drupal.org/project/vvjf)
- Issue queue:
  [drupal.org/project/issues/vvjf](https://www.drupal.org/project/issues/vvjf)

v2.0 builds on the **`drupal/vvj_core` foundation** (composer auto-installs it).
Behavior runs in a `<vvjf-flipbox>` custom element extending `VvjElementBase`.


## Table of contents

- Overview
- Requirements
- Installation
- Configuration
- Usage
- Patterns
- Upgrading from 1.x
- Troubleshooting
- Changelog
- Maintainers
- License


## Overview

- Hover and click triggers (Enter/Space keyboard fallback)
- Horizontal (Y-axis) or vertical (X-axis) flip direction
- Configurable flip speed (0.1 - 2.0 s) + 5 easing curves
- Configurable box height, min-width, grid gap, perspective
- Front + back background colors (independent)
- 6 responsive breakpoints (`all` / 576 / 768 / 992 / 1200 / 1400 px). Flipbox
  active above the chosen viewport
- ARIA `aria-hidden` and `tabindex` synchronized to the flipped state
- On viewports below the breakpoint: both sides visible, flip disabled, every
  nested element tabbable
- Lazy IntersectionObserver hydration; AbortController-tracked listeners
- Throttled resize handler keeps state in sync with viewport changes
- **Views tokens**: `[vvjf:field]` / `[vvjf:field:plain]` in Views text areas
  with *Use replacement tokens from the first row*
- **Drupal admin help**: `/admin/help/vvjf`


## Requirements

- Drupal core `^11.3 || ^12`.
- PHP 8.3 or later.
- Drupal core modules Views and Filter.
- [VVJ Core](https://www.drupal.org/project/vvj_core) (`vvj_core`), installed
  automatically by Composer.


## Installation

1. Install with Composer: `composer require drupal/vvjf:^2.0` (it pulls
   `drupal/vvj_core`), or download the module and `vvj_core` from
   [Drupal.org](https://www.drupal.org/project/vvjf).
1. Enable it in the admin interface or with Drush: `drush en vvjf`.
1. Clear caches so the new plugin is available: `drush cr`.


## Configuration

Settings live in the format settings of the view. Place a
`<div class="vvjf-separator"></div>` field (or a Custom field whose output is
that markup) between the front and back fields. Everything before the separator
becomes the front; everything after becomes the back.

For a ready-made starting point, choose a Pattern (see Patterns below).


## Usage

1. Create or edit a View.
1. Set **Format** to *Views Vanilla JavaScript 3D Flipbox*.
1. Set **Show** to *Fields*.
1. Configure the format settings (see Configuration).
1. Configure dimensions / behavior / styling / animation / responsive in the
   format settings.
1. Save.

**Sample view:** Optional config `views.view.vvjf_example` (`config/optional/`)
installs when there is no ID conflict.


### Token support in Views text areas

In Views headers, footers, or empty text with *Use replacement tokens from the
first row*, default Twig tokens (`{{ title }}`) do not work. Use VVJF tokens
instead:

- `{{ title }}` → `[vvjf:title]`
- `{{ field_image }}` → `[vvjf:field_image]`
- Append `:plain` for plain text: `[vvjf:title:plain]`

v2 resolves tokens through the shared `vvj_core.token_resolver` service; syntax
is unchanged from v1. Tokens read from the **first row** of rendered View
fields. Complex field rewrites are not supported.


## Patterns

A Pattern is a ready-made design for this format. One choice in the format
settings sets the layout, animation,
styling and deep linking together. Views Vanilla JavaScript 3D Flipbox ships 5
Patterns:

| Pattern | What it looks like | Demo page path |
|---|---|---|
| Hand | Cards fanned like a hand of playing cards; they deal in, lift when pointed at, and turn over sideways with a round turn button. | `vvj/vvjf/hand` |
| Board | A departure board: one row per item, code and name in split-flap letters that cascade in; a row flips top to bottom to the detail. | `vvj/vvjf/board` |
| Rail | A sideways row of tall portrait cards that snap as you scroll; a card turns to its words, and a bottom bar shows where you are. | `vvj/vvjf/rail` |
| Figures | Number tiles, the first twice the size; the photo shows inside the digits, the numbers count up, and a tile tips back to the photo and one sentence. | `vvj/vvjf/figures` |
| Plans | Plan cards with the second raised; a segmented control turns every card in a wave from the overview to what is included, and each card turns on its own. | `vvj/vvjf/plans` |

The demo pages exist only while the optional `vvj_patterns_demo` module is
enabled (see "Example views" below).


### Choosing a Pattern

1. Enable the shared Patterns base, which ships inside `vvj_core`:
   `drush en vvj_patterns`. The "Pattern" select
   appears in the format settings only while `vvj_patterns` is enabled.
1. Edit the view and open the format settings.
1. In the "Patterns" section, pick a Pattern in the "Pattern" select and save.
1. The Pattern's settings replace the layout, animation, styling and deep
   linking settings of the view. You can
   change them afterwards. Pick "None" to keep your own settings.
1. A list titled "To finish the <name> Pattern" shows what the view must supply:
   which fields, which markup
   classes and how many items. Follow it; a Pattern shows its finished design
   only when the view matches.


### Example views

Enable the optional `vvj_patterns_demo` module (`drush en vvj_patterns_demo`) to
see every Pattern with content.
It creates a "VVJ Slide" content type with five demo slides and pictures, plus
example views titled
"VVJ demo: <format>" for the VVJ format modules that are enabled, one page per
Pattern at the paths in the table
above. Uninstalling the demo module removes the slides and pictures it created.


## Upgrading from 1.x

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


## Troubleshooting

| Symptom | Fix |
|---|---|
| The format is missing from the Views "Format" list | Enable `vvj_core` and `vvjf`, then `drush cr`. |
| `Class "Drupal\vvjf\..." not found` after deploying v2 code | Stale container cache: `drush cr`. If Drush will not bootstrap, clear `cache_container` in the database and retry. |
| `drush updb` errors before `vvj_core` is enabled | Run `drush en vvj_core -y`, then `drush updb -y && drush cr`. |
| No "Patterns" section in the format settings | Enable `vvj_patterns`: `drush en vvj_patterns`. |

Report bugs and request features in the
[issue queue](https://www.drupal.org/project/issues/vvjf).


## Changelog

See [CHANGELOG.md](./CHANGELOG.md).


## Maintainers

- Alaa Haddad - [flashwebcenter](https://www.drupal.org/u/flashwebcenter)


## License

GPL-2.0-or-later. See the
[GNU General Public License, version 2 or later](https://www.gnu.org/licenses/gpl-2.0.html).
