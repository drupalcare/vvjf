# Changelog

## [2.0.0] (UNRELEASED)

**Drop-in upgrade for 1.x sites.** v2 modernizes internals: extends `vvj_core`
foundation, ships `<vvjf-flipbox>` custom element extending `VvjElementBase`,
AbortController-tracked listeners, throttled resize, while preserving every CSS
rule, library name, option key, plugin ID, theme hook, JS behavior key from 1.x.

### Fixed

- Patterns: Rail's bar reads counter, track, then both buttons, so its controls have their own place.
- Patterns: Rail arrows point the reading way on right-to-left pages; Board uses the shared monospace variable.
- Patterns: spacing, corner radius, type size, shadow and motion read shared `--vvj-*` variables with fallbacks, so a site or theme can adjust them in one place; a few odd values moved to the nearest step, under 10%.
- Patterns: each Pattern states its stage, ground, placement and the kinds of site it serves best in `pattern.yml`.
- Patterns: sizes that followed the screen width (`vw`) now follow the Pattern's own width (`cqi`), so a Pattern in a sidebar or narrow column keeps its proportions.
- Help page: follows the drupal.org help text standard (translatable About and Uses sections) instead of printing README.md as raw text.
- Pattern Board: the split-flap letters show when any part of the Board is on screen (they waited for 30% of the whole Board, which never came when the Board was taller than the screen), and the picture on the back stays an 88px square in the stacked layout.
- Patterns Board, Hand, Figures and Plans: flip on click at every width (their breakpoint is now "all", like Rail). Below 768px or 992px it used to switch the flip off and show both faces stacked, so in a narrow front-end region the card never turned. Sites that already have the demo view keep their saved setting; set Breakpoints to All in the view to match.
- Pattern Hand: cards keep their set width, so the text on the back is never cut off. They fan five to a row where five fit, and wrap flat and apart in narrower regions.
- Flip Patterns: the turn button is a transparent icon in the top right corner of every card, on both faces, and no text sits under or against it at any width. The whole card still flips on click; the button stays for keyboard and screen readers.
- Patterns under APEX: the Rail progress track reads the shared track role, so the progress fill stays visible when the region's border is left to APEX (the full text color).
- Patterns: the stacked state (`.vvjf-off`) now follows the Pattern's own width (a ResizeObserver on the element) instead of the window, so a Pattern in a narrow column stacks its cards like its `@container` CSS. Views without a Pattern still use the window width.
- A Pattern no longer takes layout from the module's breakpoint files: their rules now skip any element with `vvj-pattern` (same specificity, classic rendering unchanged), and the flip geometry a Pattern needs (3D faces, perspective, flipped and hover turn, stacked two-row grid) lives in `vvjf-pattern-base.css` with the same values, split by `.vvjf-off`.
- Accessibility: links and buttons on the showing face work by mouse and keyboard (the hidden face stays out of the tab order), hover cards stay turned while focus is inside them, the per-card "Front/Back Side Content" labels are no longer headings, and Board, Figures and Rail cards have a Turn button like Hand and Plans.
- Accessibility: on a card with a Turn button the faces are no longer a second, focusable flip control, a flip never leaves focus inside the hidden face (focus moves to the Turn button, or to the showing face on a view without a Pattern), and Escape turns a turned card back.
- Hover rules that must beat a rest rule are flattened with `:where()` so no new Pattern selector exceeds 0,2,0; the look is unchanged (check-vvj-cascade: winners changed 0).
- Pattern Board: the split-flap seam is drawn per tile behind the letters instead of across the row, letters have line-height 1 and the tiles more padding, and wrapped title lines start at the same left edge.
- Update 10002 converts v1 views to the v2 option shape (value types:
  strings and integers stored where v2 declares integer, boolean and float).

### Added

- Patterns: the bridge reads the shared `--vvj-theme-*` roles instead of spelling theme names.
- Pattern theme bridges for Solo and APEX (`pattern-bridge-solo`, `pattern-bridge-apex`): they map the module's own color tokens to the region colors, and the Pattern colors that were hard-coded are now declared once in the pattern base file. Black and white stays the default under any other theme.

- **Patterns**: 5 ready-made designs for this format (Hand, Board, Rail, Figures, Plans). Pick one in the "Patterns" section of the format settings and its layout, animation, styling and deep linking settings are applied to the view. Needs the `vvj_patterns` module from `vvj_core`; the optional `vvj_patterns_demo` module adds example views.
- `drupal/vvj_core` dependency (auto-installed).
- `vvjf.install` with `vvjf_update_10001()` to auto-enable vvj_core during
  `drush updb`.
- `<vvjf-flipbox>` custom element. Lazy IntersectionObserver hydration;
  AbortController-tracked event listeners (per-card sub-controllers for clean
  unbind on viewport changes); throttled resize handler.

### Changed

- Text follows the drupal.org standards: the module description begins with a verb, "JavaScript" is spelled as the language spells it, settings titles are in sentence case, and the README has its project and issue queue links.
- Plugin extends `VvjStylePluginBase`. Implements four small subclass hooks;
  standard sections come from the base.
- `supportsDeeplinking()` returns FALSE (transient per-card state).
- Token resolution delegates to `vvj_core.token_resolver`.
- Hooks moved to OOP `#[Hook]` classes.
- Resize handling uses a 200 ms throttle (same cadence as v1).
- Code style: JavaScript and CSS follow Drupal core's ESLint, Stylelint and Prettier rules, and the spell-check job passes with a project word file. Rendering and behavior are unchanged.
- Layout: Pattern layout now follows the width the Pattern itself gets (container queries on `vvj-region`) instead of the screen width, so Patterns lay out correctly in a narrow content column; overlays and the Pattern root keep screen-width queries.
- Pattern Board: words stay whole with a gap between them, and a row grows with its letters (Box height is the minimum), so long titles no longer spill into the next row. Pattern Hand: five cards to a fan; more cards start another fan below instead of shrinking every card.

### Drupal core / PHP

- Requires Drupal `^11.3 || ^12`, PHP `>=8.3`.
