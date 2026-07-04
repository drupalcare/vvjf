# Changelog

## [2.0.0] — UNRELEASED

**Drop-in upgrade for 1.x sites.** v2 modernizes internals — extends `vvj_core`
foundation, ships `<vvjf-flipbox>` custom element extending `VvjElementBase`,
AbortController-tracked listeners, throttled resize — while preserving every CSS
rule, library name, option key, plugin ID, theme hook, JS behavior key from 1.x.

### Fixed

- Click-trigger flipboxes again suppress navigation on nested links — a mouse
  click on a link inside a click-to-flip card now flips the card without also
  following the link (v1 parity). `tabindex="-1"` alone only blocked keyboard
  focus, not mouse clicks.

### Added

- `drupal/vvj_core` dependency (auto-installed).
- `vvjf.install` with `vvjf_update_10001()` to auto-enable vvj_core during
  `drush updb`.
- `<vvjf-flipbox>` custom element. Lazy IntersectionObserver hydration;
  AbortController-tracked event listeners (per-card sub-controllers for clean
  unbind on viewport changes); throttled resize handler.

### Changed

- Plugin extends `VvjStylePluginBase`. Implements four small subclass hooks;
  standard sections come from the base.
- `supportsDeeplinking()` returns FALSE (transient per-card state).
- Token resolution delegates to `vvj_core.token_resolver`.
- Hooks moved to OOP `#[Hook]` classes.
- Resize handling uses a 200 ms throttle (same cadence as v1).

### Drupal core / PHP

- Requires Drupal `^11.3 || ^12`, PHP `>=8.3`.
