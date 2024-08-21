<?php

namespace Drupal\vvjf\Plugin\views\style;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\views\Plugin\views\style\StylePluginBase;

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

  /**
   * Does the style plugin use a row plugin.
   *
   * @var bool
   */
  protected $usesRowPlugin = TRUE;

  /**
   * Set default options.
   */
  protected function defineOptions(): array {
    $options = parent::defineOptions();
    $options['unique_id'] = ['default' => $this->generateUniqueId()];
    $options['flip_trigger'] = ['default' => 'click'];
    $options['flip_direction'] = ['default' => 'vertical'];
    $options['flip_speed'] = ['default' => '0.9'];
    $options['front_bg_color'] = ['default' => '#f0fbff'];
    $options['back_bg_color'] = ['default' => '#b8e7ff'];
    $options['perspective'] = ['default' => 1600];
    $options['available_breakpoints'] = ['default' => '576'];
    $options['animation_easing'] = ['default' => 'ease'];
    $options['grid_gap'] = ['default' => 16];
    $options['enable_css'] = ['default' => TRUE];
    $options['box_height'] = ['default' => 250];
    $options['box_width'] = ['default' => 300];
    return $options;
  }

  /**
   * {@inheritdoc}
   */
  public function buildOptionsForm(&$form, FormStateInterface $form_state): void {
    parent::buildOptionsForm($form, $form_state);

    $form['warning_message'] = [
      '#type' => 'markup',
      '#markup' => '<div class="messages messages--warning">' . $this->t('Note: The first field will be used as the front card, and the rest of the fields will be used as the back card. To see an example, check the vvjf_example view by clicking <a href="/admin/structure/views/view/vvjf_example" style="display: inline;">here</a> to edit it.', ['@url' => Url::fromRoute('entity.view.edit_form', ['view' => 'vvjf_example'])->toString()]) . '</div>',
    ];

    $form['available_breakpoints'] = [
      '#type' => 'select',
      '#title' => $this->t('Available Breakpoints for Parallax'),
      '#options' => [
        'all' => $this->t('Active on all screens'),
        '576' => $this->t('576px / 36rem'),
        '768' => $this->t('768px / 48rem'),
        '992' => $this->t('992px / 62rem'),
        '1200' => $this->t('1200px / 75rem'),
        '1400' => $this->t('1400px / 87.5rem'),
      ],
      '#default_value' => $this->options['available_breakpoints'],
      '#description' => $this->t('Select the maximum screen width (in pixels) at which the Flipbox should be disabled. Selecting "none" will keep the Flipbox active on all screen sizes.'),
    ];

    $form['box_height'] = [
      '#type' => 'number',
      '#title' => $this->t('Box Height (in pixels)'),
      '#default_value' => $this->options['box_height'],
      '#description' => $this->t('Specify the height of the flip box in pixels.'),
      '#min' => 100,
      '#step' => 1,
      '#required' => TRUE,
    ];

    $form['box_width'] = [
      '#type' => 'number',
      '#title' => $this->t('Box Min Width (px)'),
      '#default_value' => $this->options['box_width'],
      '#description' => $this->t('Defines the minimum width for each grid box (flipbox). The grid automatically adjusts the number of columns to fit the available space, ensuring responsive and flexible layout. Enter "0" to disable this field.'),
      '#step' => 1,
      '#min' => 0,
    ];

    $form['grid_gap'] = [
      '#type' => 'number',
      '#title' => $this->t('Grid Gap (px)'),
      '#default_value' => $this->options['grid_gap'],
      '#description' => $this->t('Set the gap between grid in pixels.'),
      '#step' => 1,
      '#min' => 1,
    ];

    $form['flip_trigger'] = [
      '#type' => 'select',
      '#title' => $this->t('Flip Trigger'),
      '#options' => [
        'hover' => $this->t('Hover'),
        'click' => $this->t('Click'),
      ],
      '#default_value' => $this->options['flip_trigger'],
      '#description' => $this->t('Choose whether the flip box flips on hover or click.'),
    ];

    $form['flip_direction'] = [
      '#type' => 'select',
      '#title' => $this->t('Flip Direction'),
      '#options' => [
        'horizontal' => $this->t('Horizontal (Y-axis)'),
        'vertical' => $this->t('Vertical (X-axis)'),
      ],
      '#default_value' => $this->options['flip_direction'],
      '#description' => $this->t('Select the direction of the flip animation.'),
    ];

    $form['flip_speed'] = [
      '#type' => 'number',
      '#title' => $this->t('Flip Speed'),
      '#default_value' => $this->options['flip_speed'],
      '#description' => $this->t('Specify the speed of the flip animation (e.g., 0.1 for fast, 2 for slow).'),
      '#step' => 0.1,
      '#min' => 0.1,
      '#max' => 2,
    ];

    $form['front_bg_color'] = [
      '#type' => 'color',
      '#title' => $this->t('Front Side Background Color'),
      '#default_value' => $this->options['front_bg_color'],
      '#description' => $this->t('Select the background color for the front side of the flip box.'),
    ];

    $form['back_bg_color'] = [
      '#type' => 'color',
      '#title' => $this->t('Back Side Background Color'),
      '#default_value' => $this->options['back_bg_color'],
      '#description' => $this->t('Select the background color for the back side of the flip box.'),
    ];

    $form['perspective'] = [
      '#type' => 'number',
      '#title' => $this->t('Perspective'),
      '#default_value' => $this->options['perspective'],
      '#min' => 0,
      '#step' => 10,
      '#description' => $this->t('The details of perspective may change based on the width of item in the 3D Flipbox. By default, this setting adjusts with each width selection.'),
      '#required' => FALSE,
    ];

    $form['animation_easing'] = [
      '#type' => 'select',
      '#title' => $this->t('Animation Easing'),
      '#options' => [
        'ease' => $this->t('Ease'),
        'linear' => $this->t('Linear'),
        'ease-in' => $this->t('Ease-in'),
        'ease-out' => $this->t('Ease-out'),
        'ease-in-out' => $this->t('Ease-in-out'),
      ],
      '#default_value' => $this->options['animation_easing'],
      '#description' => $this->t('Choose the easing function for the flip animation.'),
    ];

    // Add enable_css checkbox to the form.
    $form['enable_css'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable CSS Library'),
      '#default_value' => $this->options['enable_css'],
      '#description' => $this->t('Check this box to include the CSS library for styling the tabs.'),
    ];
  }

  /**
   * Generates a unique numeric ID for the view display.
   *
   * @throws \Random\RandomException
   */
  protected function generateUniqueId(): int {
    // 8 digit unique ID
    return random_int(10000000, 99999999);
  }

  /**
   * Renders the view with the 3D Flipbox style.
   *
   * @return array
   *   A render array for the 3D flipbox.
   */
  public function render(): array {
    $rows = [];
    foreach ($this->view->result as $row) {
      $rows[] = $this->view->rowPlugin->render($row);
    }

    $libraries = [
      'vvjf/vvjf',
    ];

    // Conditionally include the CSS library based on the option.
    if ($this->options['enable_css']) {
      $libraries[] = 'vvjf/vvjf-style';
    }

    // Conditionally include the CSS library based on the option.
    if ($this->options['available_breakpoints']) {
      // Include the vvjp-style library.
      $libraries[] = 'vvjf/vvjf__' . $this->options['available_breakpoints'];
    }

    return [
      '#theme' => $this->themeFunctions(),
      '#view' => $this->view,
      '#options' => $this->options,
      '#rows' => $rows,
      '#unique_id' => $this->options['unique_id'],
      '#attached' => [
        'library' => $libraries,
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function validate() {
    $errors = parent::validate();
    if (!$this->usesFields()) {
      $errors[] = $this->t('Views Flipbox requires Fields as row style.');
    }
    return $errors;
  }

}
