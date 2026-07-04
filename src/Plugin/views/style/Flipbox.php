<?php

declare(strict_types=1);

namespace Drupal\vvjf\Plugin\views\style;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\views\Attribute\ViewsStyle;
use Drupal\vvj_core\Plugin\views\style\VvjStylePluginBase;
use Drupal\vvjf\VvjfConstants;

/**
 * Renders Views rows as a vanilla-JavaScript 3D flipbox grid.
 *
 * @ingroup views_style_plugins
 */
#[ViewsStyle(
  id: 'views_vvjf',
  title: new TranslatableMarkup('Views Vanilla JavaScript 3D Flipbox'),
  help: new TranslatableMarkup('Render items in a 3D Flipbox using vanilla JavaScript.'),
  theme: 'views_view_vvjf',
  display_types: ['normal'],
)]
class Flipbox extends VvjStylePluginBase {

  /**
   * {@inheritdoc}
   */
  public function getModuleSlug(): string {
    return 'vvjf';
  }

  /**
   * {@inheritdoc}
   */
  public function getCustomElementTag(): string {
    return 'vvjf-flipbox';
  }

  /**
   * Restores v1's pattern-specific enable-CSS checkbox description.
   *
   * @return \Drupal\Core\StringTranslation\TranslatableMarkup
   *   The description.
   */
  protected function getEnableCssDescription(): TranslatableMarkup {
    return $this->t('Check this box to include the CSS library for styling the tabs.');
  }

  /**
   * {@inheritdoc}
   *
   * Flipbox state is per-card and transient — no panels/slides to deep-link to.
   */
  protected function supportsDeeplinking(): bool {
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  protected function definePatternOptions(array $options): array {
    $options['flip_trigger'] = ['default' => VvjfConstants::DEFAULT_FLIP_TRIGGER];
    $options['flip_direction'] = ['default' => VvjfConstants::DEFAULT_FLIP_DIRECTION];
    $options['flip_speed'] = ['default' => VvjfConstants::DEFAULT_FLIP_SPEED];
    $options['front_bg_color'] = ['default' => VvjfConstants::DEFAULT_FRONT_BG_COLOR];
    $options['back_bg_color'] = ['default' => VvjfConstants::DEFAULT_BACK_BG_COLOR];
    $options['perspective'] = ['default' => VvjfConstants::DEFAULT_PERSPECTIVE];
    $options['available_breakpoints'] = ['default' => VvjfConstants::DEFAULT_BREAKPOINT];
    $options['animation_easing'] = ['default' => VvjfConstants::DEFAULT_ANIMATION_EASING];
    $options['grid_gap'] = ['default' => VvjfConstants::DEFAULT_GRID_GAP];
    $options['box_height'] = ['default' => VvjfConstants::DEFAULT_BOX_HEIGHT];
    $options['box_width'] = ['default' => VvjfConstants::DEFAULT_BOX_WIDTH];
    return $options;
  }

  /**
   * {@inheritdoc}
   */
  protected function buildPatternSections(array &$form): void {
    $this->buildDimensionsSection($form);
    $this->buildBehaviorSection($form);
    $this->buildStyleSection($form);
    $this->buildAnimationSection($form);
    $this->buildResponsiveSection($form);
  }

  /**
   * Dimensions section — height, width, gap, perspective.
   *
   * @param array<int|string, mixed> $form
   *   The form, modified in place.
   */
  protected function buildDimensionsSection(array &$form): void {
    $form['dimensions_section'] = [
      '#type' => 'details',
      '#title' => $this->t('Dimensions Settings'),
      '#open' => TRUE,
      '#weight' => -40,
    ];

    $form['dimensions_section']['box_height'] = [
      '#type' => 'number',
      '#title' => $this->t('Box Height (in pixels)'),
      '#default_value' => $this->options['box_height'],
      '#description' => $this->t('Specify the height of the flip box in pixels.'),
      '#min' => VvjfConstants::MIN_BOX_HEIGHT,
      '#step' => 1,
      '#required' => TRUE,
    ];

    $form['dimensions_section']['box_width'] = [
      '#type' => 'number',
      '#title' => $this->t('Box Min Width (px)'),
      '#default_value' => $this->options['box_width'],
      '#description' => $this->t('Defines the minimum width for each grid box (flipbox). The grid automatically adjusts the number of columns to fit the available space, ensuring responsive and flexible layout. Enter "0" to disable this field.'),
      '#step' => 1,
      '#min' => VvjfConstants::MIN_BOX_WIDTH,
    ];

    $form['dimensions_section']['grid_gap'] = [
      '#type' => 'number',
      '#title' => $this->t('Grid Gap (px)'),
      '#default_value' => $this->options['grid_gap'],
      '#description' => $this->t('Set the gap between grid in pixels.'),
      '#step' => 1,
      '#min' => VvjfConstants::MIN_GRID_GAP,
    ];

    $form['dimensions_section']['perspective'] = [
      '#type' => 'number',
      '#title' => $this->t('Perspective'),
      '#default_value' => $this->options['perspective'],
      '#min' => VvjfConstants::MIN_PERSPECTIVE,
      '#step' => VvjfConstants::PERSPECTIVE_STEP,
      '#description' => $this->t('The details of perspective may change based on the width of item in the 3D Flipbox. By default, this setting adjusts with each width selection. Set to zero to disable it.'),
    ];
  }

  /**
   * Behavior section — trigger + direction.
   *
   * @param array<int|string, mixed> $form
   *   The form, modified in place.
   */
  protected function buildBehaviorSection(array &$form): void {
    $form['behavior_section'] = [
      '#type' => 'details',
      '#title' => $this->t('Behavior Settings'),
      '#open' => TRUE,
      '#weight' => -30,
    ];

    $form['behavior_section']['flip_trigger'] = [
      '#type' => 'select',
      '#title' => $this->t('Flip Trigger'),
      '#options' => [
        VvjfConstants::TRIGGER_HOVER => $this->t('Hover'),
        VvjfConstants::TRIGGER_CLICK => $this->t('Click'),
      ],
      '#default_value' => $this->options['flip_trigger'],
      '#description' => $this->t('Choose whether the flip box flips on hover or click.'),
    ];

    $form['behavior_section']['flip_direction'] = [
      '#type' => 'select',
      '#title' => $this->t('Flip Direction'),
      '#options' => [
        VvjfConstants::DIRECTION_HORIZONTAL => $this->t('Horizontal (Y-axis)'),
        VvjfConstants::DIRECTION_VERTICAL => $this->t('Vertical (X-axis)'),
      ],
      '#default_value' => $this->options['flip_direction'],
      '#description' => $this->t('Select the direction of the flip animation.'),
    ];
  }

  /**
   * Style section — front + back background colors.
   *
   * @param array<int|string, mixed> $form
   *   The form, modified in place.
   */
  protected function buildStyleSection(array &$form): void {
    $form['style_section'] = [
      '#type' => 'details',
      '#title' => $this->t('Style Settings'),
      '#open' => TRUE,
      '#weight' => -20,
    ];

    $form['style_section']['front_bg_color'] = [
      '#type' => 'color',
      '#title' => $this->t('Front Side Background Color'),
      '#default_value' => $this->options['front_bg_color'],
      '#description' => $this->t('Select the background color for the front side of the flip box.'),
    ];

    $form['style_section']['back_bg_color'] = [
      '#type' => 'color',
      '#title' => $this->t('Back Side Background Color'),
      '#default_value' => $this->options['back_bg_color'],
      '#description' => $this->t('Select the background color for the back side of the flip box.'),
    ];
  }

  /**
   * Animation section — speed + easing.
   *
   * @param array<int|string, mixed> $form
   *   The form, modified in place.
   */
  protected function buildAnimationSection(array &$form): void {
    $form['animation_section'] = [
      '#type' => 'details',
      '#title' => $this->t('Animation Settings'),
      '#open' => TRUE,
      '#weight' => -10,
    ];

    $form['animation_section']['flip_speed'] = [
      '#type' => 'number',
      '#title' => $this->t('Flip Speed (seconds)'),
      '#default_value' => $this->options['flip_speed'],
      '#description' => $this->t('Specify the duration of the flip animation in seconds. Range: @min - @max.', [
        '@min' => VvjfConstants::MIN_FLIP_SPEED,
        '@max' => VvjfConstants::MAX_FLIP_SPEED,
      ]),
      '#min' => VvjfConstants::MIN_FLIP_SPEED,
      '#max' => VvjfConstants::MAX_FLIP_SPEED,
      '#step' => VvjfConstants::FLIP_SPEED_STEP,
      '#required' => TRUE,
    ];

    $form['animation_section']['animation_easing'] = [
      '#type' => 'select',
      '#title' => $this->t('Animation Easing'),
      '#options' => [
        VvjfConstants::EASING_EASE => $this->t('Ease'),
        VvjfConstants::EASING_LINEAR => $this->t('Linear'),
        VvjfConstants::EASING_EASE_IN => $this->t('Ease In'),
        VvjfConstants::EASING_EASE_OUT => $this->t('Ease Out'),
        VvjfConstants::EASING_EASE_IN_OUT => $this->t('Ease In Out'),
      ],
      '#default_value' => $this->options['animation_easing'],
      '#description' => $this->t('Choose the easing function for the flip animation.'),
    ];
  }

  /**
   * Responsive section — breakpoint at which flip is gated/disabled.
   *
   * @param array<int|string, mixed> $form
   *   The form, modified in place.
   */
  protected function buildResponsiveSection(array &$form): void {
    $form['responsive_section'] = [
      '#type' => 'details',
      '#title' => $this->t('Responsive Settings'),
      '#open' => FALSE,
      '#weight' => 0,
    ];

    $form['responsive_section']['available_breakpoints'] = [
      '#type' => 'select',
      '#title' => $this->t('Available Breakpoints for Flipbox'),
      '#options' => [
        VvjfConstants::BREAKPOINT_ALL => $this->t('Active on all screens'),
        '576' => $this->t('576 px / 36 rem'),
        '768' => $this->t('768 px / 48 rem'),
        '992' => $this->t('992 px / 62 rem'),
        '1200' => $this->t('1200 px / 75 rem'),
        '1400' => $this->t('1400 px / 87.5 rem'),
      ],
      '#default_value' => $this->options['available_breakpoints'],
      '#description' => $this->t('Select the maximum screen width (in pixels) at which the Flipbox should be disabled. Selecting "none" will keep the Flipbox active on all screen sizes.'),
    ];
  }

  /**
   * {@inheritdoc}
   *
   * Add the breakpoint-specific responsive library on top of the
   * shared library list.
   *
   * @return list<string>
   *   Library identifiers.
   */
  protected function buildLibraryList(): array {
    $libraries = parent::buildLibraryList();
    $breakpoint = $this->options['available_breakpoints'] ?? VvjfConstants::DEFAULT_BREAKPOINT;
    $breakpoint = is_scalar($breakpoint)
      ? (string) $breakpoint
      : (string) VvjfConstants::DEFAULT_BREAKPOINT;
    $libraries[] = 'vvjf/vvjf__' . $breakpoint;
    return $libraries;
  }

  /**
   * {@inheritdoc}
   *
   * @param array<int|string, mixed> $form
   *   The Views style options form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  public function submitOptionsForm(&$form, FormStateInterface $form_state): void {
    $values = $form_state->getValue('style_options');
    if (!is_array($values)) {
      $values = [];
    }
    $form_state->setValue('style_options', $this->flattenFormValues($values));
    parent::submitOptionsForm($form, $form_state);
  }

  /**
   * Flatten the sectioned form values back into the persisted shape.
   *
   * @param array<int|string, mixed> $values
   *   Submitted form values keyed by section then by option name.
   *
   * @return array<string, mixed>
   *   Flattened option array.
   */
  protected function flattenFormValues(array $values): array {
    $flattened = [];

    $dimensions = $values['dimensions_section'] ?? NULL;
    if (is_array($dimensions)) {
      $flattened['box_height'] = $dimensions['box_height'] ?? VvjfConstants::DEFAULT_BOX_HEIGHT;
      $flattened['box_width'] = $dimensions['box_width'] ?? VvjfConstants::DEFAULT_BOX_WIDTH;
      $flattened['grid_gap'] = $dimensions['grid_gap'] ?? VvjfConstants::DEFAULT_GRID_GAP;
      $flattened['perspective'] = $dimensions['perspective'] ?? VvjfConstants::DEFAULT_PERSPECTIVE;
    }

    $behavior = $values['behavior_section'] ?? NULL;
    if (is_array($behavior)) {
      $flattened['flip_trigger'] = $behavior['flip_trigger'] ?? VvjfConstants::DEFAULT_FLIP_TRIGGER;
      $flattened['flip_direction'] = $behavior['flip_direction'] ?? VvjfConstants::DEFAULT_FLIP_DIRECTION;
    }

    $style = $values['style_section'] ?? NULL;
    if (is_array($style)) {
      $flattened['front_bg_color'] = $style['front_bg_color'] ?? VvjfConstants::DEFAULT_FRONT_BG_COLOR;
      $flattened['back_bg_color'] = $style['back_bg_color'] ?? VvjfConstants::DEFAULT_BACK_BG_COLOR;
    }

    $animation = $values['animation_section'] ?? NULL;
    if (is_array($animation)) {
      $flattened['flip_speed'] = $animation['flip_speed'] ?? VvjfConstants::DEFAULT_FLIP_SPEED;
      $flattened['animation_easing'] = $animation['animation_easing'] ?? VvjfConstants::DEFAULT_ANIMATION_EASING;
    }

    $responsive = $values['responsive_section'] ?? NULL;
    if (is_array($responsive)) {
      $flattened['available_breakpoints'] = $responsive['available_breakpoints'] ?? VvjfConstants::DEFAULT_BREAKPOINT;
    }

    $advanced = $values['advanced_section'] ?? NULL;
    if (is_array($advanced)) {
      $flattened['enable_css'] = $advanced['enable_css'] ?? TRUE;
    }

    $flattened['unique_id'] = $this->options['unique_id'] ?? $this->generateUniqueId();

    return $flattened;
  }

}
