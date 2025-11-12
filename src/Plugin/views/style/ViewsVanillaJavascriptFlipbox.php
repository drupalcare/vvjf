<?php

declare(strict_types=1);

namespace Drupal\vvjf\Plugin\views\style;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\views\Plugin\views\style\StylePluginBase;
use Drupal\vvjf\VvjfConstants;

/**
 * Style plugin to render items in a 3D Flipbox using vanilla JavaScript.
 *
 * @ingroup views_style_plugins
 *
 * @ViewsStyle(
 *   id = "views_vvjf",
 *   title = @Translation("Views Vanilla JavaScript 3D Flipbox"),
 *   help = @Translation("Render items in a 3D Flipbox using vanilla JavaScript."),
 *   theme = "views_view_vvjf",
 *   display_types = { "normal" }
 * )
 */
class ViewsVanillaJavascriptFlipbox extends StylePluginBase {

  public const TRIGGER_HOVER = 'hover';
  public const TRIGGER_CLICK = 'click';

  public const DIRECTION_HORIZONTAL = 'horizontal';
  public const DIRECTION_VERTICAL = 'vertical';

  public const EASING_EASE = 'ease';
  public const EASING_LINEAR = 'linear';
  public const EASING_EASE_IN = 'ease-in';
  public const EASING_EASE_OUT = 'ease-out';
  public const EASING_EASE_IN_OUT = 'ease-in-out';

  public const BREAKPOINT_ALL = 'all';
  public const BREAKPOINT_576 = '576';
  public const BREAKPOINT_768 = '768';
  public const BREAKPOINT_992 = '992';
  public const BREAKPOINT_1200 = '1200';
  public const BREAKPOINT_1400 = '1400';

  /**
   * Does the style plugin use a row plugin.
   *
   * @var bool
   */
  protected $usesRowPlugin = TRUE;

  /**
   * Does the style plugin use row classes.
   *
   * @var bool
   */
  protected $usesRowClass = TRUE;

  /**
   * Cached unique ID for this view display.
   *
   * @var int|null
   */
  protected ?int $cachedUniqueId = NULL;

  /**
   * {@inheritdoc}
   */
  protected function defineOptions(): array {
    $options = parent::defineOptions();
    $options['unique_id'] = ['default' => $this->generateUniqueId()];
    $options['flip_trigger'] = ['default' => VvjfConstants::DEFAULT_FLIP_TRIGGER];
    $options['flip_direction'] = ['default' => VvjfConstants::DEFAULT_FLIP_DIRECTION];
    $options['flip_speed'] = ['default' => VvjfConstants::DEFAULT_FLIP_SPEED];
    $options['front_bg_color'] = ['default' => VvjfConstants::DEFAULT_FRONT_BG_COLOR];
    $options['back_bg_color'] = ['default' => VvjfConstants::DEFAULT_BACK_BG_COLOR];
    $options['perspective'] = ['default' => VvjfConstants::DEFAULT_PERSPECTIVE];
    $options['available_breakpoints'] = ['default' => VvjfConstants::DEFAULT_BREAKPOINT];
    $options['animation_easing'] = ['default' => VvjfConstants::DEFAULT_ANIMATION_EASING];
    $options['grid_gap'] = ['default' => VvjfConstants::DEFAULT_GRID_GAP];
    $options['enable_css'] = ['default' => VvjfConstants::DEFAULT_ENABLE_CSS];
    $options['box_height'] = ['default' => VvjfConstants::DEFAULT_BOX_HEIGHT];
    $options['box_width'] = ['default' => VvjfConstants::DEFAULT_BOX_WIDTH];
    return $options;
  }

  /**
   * Get flip trigger options.
   *
   * @return array
   *   An associative array of trigger options.
   */
  protected function getFlipTriggerOptions(): array {
    return [
      self::TRIGGER_HOVER => $this->t('Hover'),
      self::TRIGGER_CLICK => $this->t('Click'),
    ];
  }

  /**
   * Get flip direction options.
   *
   * @return array
   *   An associative array of direction options.
   */
  protected function getFlipDirectionOptions(): array {
    return [
      self::DIRECTION_HORIZONTAL => $this->t('Horizontal (Y-axis)'),
      self::DIRECTION_VERTICAL => $this->t('Vertical (X-axis)'),
    ];
  }

  /**
   * Get animation easing options.
   *
   * @return array
   *   An associative array of easing function options.
   */
  protected function getAnimationEasingOptions(): array {
    return [
      self::EASING_EASE => $this->t('Ease'),
      self::EASING_LINEAR => $this->t('Linear'),
      self::EASING_EASE_IN => $this->t('Ease In'),
      self::EASING_EASE_OUT => $this->t('Ease Out'),
      self::EASING_EASE_IN_OUT => $this->t('Ease In Out'),
    ];
  }

  /**
   * Get responsive breakpoint options.
   *
   * @return array
   *   An associative array of breakpoint options.
   */
  protected function getBreakpointOptions(): array {
    return [
      self::BREAKPOINT_ALL => $this->t('Active on all screens'),
      self::BREAKPOINT_576 => $this->t('576px / 36rem'),
      self::BREAKPOINT_768 => $this->t('768px / 48rem'),
      self::BREAKPOINT_992 => $this->t('992px / 62rem'),
      self::BREAKPOINT_1200 => $this->t('1200px / 75rem'),
      self::BREAKPOINT_1400 => $this->t('1400px / 87.5rem'),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildOptionsForm(&$form, FormStateInterface $form_state): void {
    parent::buildOptionsForm($form, $form_state);

    $this->setDefaultElementWeights($form);
    $this->buildWarningMessage($form);
    $this->buildDimensionsSection($form);
    $this->buildBehaviorSection($form);
    $this->buildStyleSection($form);
    $this->buildAnimationSection($form);
    $this->buildResponsiveSection($form);
    $this->buildAdvancedSection($form);
    $this->buildTokenDocumentation($form);
  }

  /**
   * Set weights for default Drupal form elements.
   *
   * @param array $form
   *   The form array.
   */
  protected function setDefaultElementWeights(array &$form): void {
    $default_elements = [
      'grouping' => -100,
      'row_class' => -90,
      'default_row_class' => -85,
      'uses_fields' => -80,
      'class' => -75,
      'wrapper_class' => -70,
    ];

    foreach ($default_elements as $element_key => $weight) {
      if (isset($form[$element_key])) {
        $form[$element_key]['#weight'] = $weight;
      }
    }
  }

  /**
   * Build warning message section.
   *
   * @param array $form
   *   The form array.
   */
  protected function buildWarningMessage(array &$form): void {
    if ($this->view->storage->id() === 'vvjf_example') {
      return;
    }
    $form['warning_message'] = [
      '#type' => 'markup',
      '#markup' => '<div class="messages messages--warning">' . $this->t('Note: The first field will be used as the front card, and the rest of the fields will be used as the back card. To see an example, check the vvjf_example view by clicking <a href="/admin/structure/views/view/vvjf_example" style="display: inline;">here</a> to edit it.', ['@url' => Url::fromRoute('entity.view.edit_form', ['view' => 'vvjf_example'])->toString()]) . '</div>',
      '#weight' => -50,
    ];
  }

  /**
   * Build dimensions configuration section.
   *
   * @param array $form
   *   The form array.
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
      '#required' => FALSE,
    ];
  }

  /**
   * Build behavior configuration section.
   *
   * @param array $form
   *   The form array.
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
      '#options' => $this->getFlipTriggerOptions(),
      '#default_value' => $this->options['flip_trigger'],
      '#description' => $this->t('Choose whether the flip box flips on hover or click.'),
    ];

    $form['behavior_section']['flip_direction'] = [
      '#type' => 'select',
      '#title' => $this->t('Flip Direction'),
      '#options' => $this->getFlipDirectionOptions(),
      '#default_value' => $this->options['flip_direction'],
      '#description' => $this->t('Select the direction of the flip animation.'),
    ];
  }

  /**
   * Build style configuration section.
   *
   * @param array $form
   *   The form array.
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
   * Build animation configuration section.
   *
   * @param array $form
   *   The form array.
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
      '#description' => $this->t('Specify the duration of the flip animation in seconds.'),
      '#min' => VvjfConstants::MIN_FLIP_SPEED,
      '#max' => VvjfConstants::MAX_FLIP_SPEED,
      '#step' => VvjfConstants::FLIP_SPEED_STEP,
      '#required' => TRUE,
    ];

    $form['animation_section']['animation_easing'] = [
      '#type' => 'select',
      '#title' => $this->t('Animation Easing'),
      '#options' => $this->getAnimationEasingOptions(),
      '#default_value' => $this->options['animation_easing'],
      '#description' => $this->t('Choose the easing function for the flip animation.'),
    ];
  }

  /**
   * Build responsive configuration section.
   *
   * @param array $form
   *   The form array.
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
      '#title' => $this->t('Available Breakpoints for Parallax'),
      '#options' => $this->getBreakpointOptions(),
      '#default_value' => $this->options['available_breakpoints'],
      '#description' => $this->t('Select the maximum screen width (in pixels) at which the Flipbox should be disabled. Selecting "none" will keep the Flipbox active on all screen sizes.'),
    ];
  }

  /**
   * Build advanced options section.
   *
   * @param array $form
   *   The form array.
   */
  protected function buildAdvancedSection(array &$form): void {
    $form['advanced_section'] = [
      '#type' => 'details',
      '#title' => $this->t('Advanced Options'),
      '#open' => FALSE,
      '#weight' => 10,
    ];

    $form['advanced_section']['enable_css'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable CSS Library'),
      '#default_value' => $this->options['enable_css'],
      '#description' => $this->t('Check this box to include the CSS library for styling the tabs.'),
    ];
  }

  /**
   * Build token documentation section.
   *
   * @param array $form
   *   The form array.
   */
  protected function buildTokenDocumentation(array &$form): void {
    $form['token_section'] = [
      '#type' => 'details',
      '#title' => $this->t('Token Documentation'),
      '#open' => FALSE,
      '#weight' => 100,
    ];

    $form['token_section']['description'] = [
      '#markup' => $this->t('<p>When using <em>Global: Text area</em> or <em>Global: Unfiltered text</em> in the Views header, footer, or empty text areas, the default Twig-style tokens (e.g., <code>{{ title }}</code>) will not work with the VVJF style plugin.</p>
        <p>Instead, use the custom VVJF token format to access field values from the <strong>first row</strong> of the View result:</p>
        <ul>
          <li><code>[vvjf:field_name]</code> — The rendered output of the field (e.g., linked title, image, formatted text).</li>
          <li><code>[vvjf:field_name:plain]</code> — A plain-text version of the field, with all HTML stripped.</li>
        </ul>
        <p>Examples:</p>
        <ul>
          <li><code>{{ title }}</code> ➜ <code>[vvjf:title]</code></li>
          <li><code>{{ field_image }}</code> ➜ <code>[vvjf:field_image]</code></li>
          <li><code>{{ body }}</code> ➜ <code>[vvjf:body:plain]</code></li>
        </ul>
        <p>These tokens offer safe and flexible field output for dynamic headings, summaries, and fallback messages in VVJF-enabled Views.</p>'),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function submitOptionsForm(&$form, FormStateInterface $form_state): void {
    $values = $form_state->getValue('style_options');
    $flattened_values = $this->flattenFormValues($values);
    $form_state->setValue('style_options', $flattened_values);

    parent::submitOptionsForm($form, $form_state);
  }

  /**
   * Flatten nested form values to match original structure.
   *
   * @param array $values
   *   The nested form values.
   *
   * @return array
   *   The flattened values array.
   */
  protected function flattenFormValues(array $values): array {
    $flattened = [];

    if (isset($values['dimensions_section'])) {
      $flattened['box_height'] = $values['dimensions_section']['box_height'] ?? VvjfConstants::DEFAULT_BOX_HEIGHT;
      $flattened['box_width'] = $values['dimensions_section']['box_width'] ?? VvjfConstants::DEFAULT_BOX_WIDTH;
      $flattened['grid_gap'] = $values['dimensions_section']['grid_gap'] ?? VvjfConstants::DEFAULT_GRID_GAP;
      $flattened['perspective'] = $values['dimensions_section']['perspective'] ?? VvjfConstants::DEFAULT_PERSPECTIVE;
    }

    if (isset($values['behavior_section'])) {
      $flattened['flip_trigger'] = $values['behavior_section']['flip_trigger'] ?? VvjfConstants::DEFAULT_FLIP_TRIGGER;
      $flattened['flip_direction'] = $values['behavior_section']['flip_direction'] ?? VvjfConstants::DEFAULT_FLIP_DIRECTION;
    }

    if (isset($values['style_section'])) {
      $flattened['front_bg_color'] = $values['style_section']['front_bg_color'] ?? VvjfConstants::DEFAULT_FRONT_BG_COLOR;
      $flattened['back_bg_color'] = $values['style_section']['back_bg_color'] ?? VvjfConstants::DEFAULT_BACK_BG_COLOR;
    }

    if (isset($values['animation_section'])) {
      $flattened['flip_speed'] = $values['animation_section']['flip_speed'] ?? VvjfConstants::DEFAULT_FLIP_SPEED;
      $flattened['animation_easing'] = $values['animation_section']['animation_easing'] ?? VvjfConstants::DEFAULT_ANIMATION_EASING;
    }

    if (isset($values['responsive_section'])) {
      $flattened['available_breakpoints'] = $values['responsive_section']['available_breakpoints'] ?? VvjfConstants::DEFAULT_BREAKPOINT;
    }

    if (isset($values['advanced_section'])) {
      $flattened['enable_css'] = $values['advanced_section']['enable_css'] ?? VvjfConstants::DEFAULT_ENABLE_CSS;
    }

    $flattened['unique_id'] = $this->options['unique_id'] ?? $this->generateUniqueId();

    return $flattened;
  }

  /**
   * Generates a unique numeric ID for the view display.
   *
   * @return int
   *   A unique ID between 10000000 and 99999999.
   *
   * @throws \Exception
   *   If an appropriate source of randomness cannot be found.
   */
  protected function generateUniqueId(): int {
    if ($this->cachedUniqueId !== NULL) {
      return $this->cachedUniqueId;
    }

    $this->cachedUniqueId = random_int(VvjfConstants::MIN_UNIQUE_ID, VvjfConstants::MAX_UNIQUE_ID);

    if ($this->cachedUniqueId < VvjfConstants::MIN_UNIQUE_ID) {
      $this->cachedUniqueId += VvjfConstants::MIN_UNIQUE_ID;
    }
    if ($this->cachedUniqueId > VvjfConstants::MAX_UNIQUE_ID) {
      $range = VvjfConstants::MAX_UNIQUE_ID - VvjfConstants::MIN_UNIQUE_ID + 1;
      $this->cachedUniqueId = $this->cachedUniqueId % $range + VvjfConstants::MIN_UNIQUE_ID;
    }

    return $this->cachedUniqueId;
  }

  /**
   * {@inheritdoc}
   */
  public function render(): array {
    $rows = [];

    if (!empty($this->view->result)) {
      foreach ($this->view->result as $row) {
        $rendered_row = $this->view->rowPlugin->render($row);
        if ($rendered_row !== NULL) {
          $rows[] = $rendered_row;
        }
      }
    }

    $libraries = $this->buildLibraryList();

    $build = [
      '#theme' => $this->themeFunctions(),
      '#view' => $this->view,
      '#options' => $this->options,
      '#rows' => $rows,
      '#unique_id' => $this->options['unique_id'] ?? $this->generateUniqueId(),
      '#attached' => [
        'library' => $libraries,
      ],
    ];

    return $build;
  }

  /**
   * Build the list of libraries to attach.
   *
   * @return array
   *   An array of library names to attach.
   */
  protected function buildLibraryList(): array {
    $libraries = ['vvjf/vvjf'];

    if (!empty($this->options['enable_css'])) {
      $libraries[] = 'vvjf/vvjf-style';
    }

    if (!empty($this->options['available_breakpoints'])) {
      $libraries[] = 'vvjf/vvjf__' . $this->options['available_breakpoints'];
    }

    return $libraries;
  }

  /**
   * {@inheritdoc}
   */
  public function validate(): array {
    $errors = parent::validate();

    if (!$this->usesFields()) {
      $errors[] = $this->t('Views Flipbox requires Fields as row style.');
    }

    return $errors;
  }

}
