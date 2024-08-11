<?php

/**
 * @file
 * Contains the hook implementations for the custom Views style plugin.
 */

/**
 * Implements hook_views_data_alter().
 */
function vvjf_views_data_alter(array &$data): void {
  // Define the style plugin schema.
  $data['views_style_plugin']['views_vvjf'] = [
    'type' => 'views_style',
    'label' => t('Views Vanilla JavaScript Flipbox'),
    'mapping' => [
      'unique_id' => [
        'type' => 'string',
        'label' => t('Unique ID for the view display'),
      ],
      'flip_trigger' => [
        'type' => 'string',
        'label' => t('Flip Trigger'),
        'description' => t('The event that triggers the flip (click or hover).'),
      ],
      'flip_direction' => [
        'type' => 'string',
        'label' => t('Flip Direction'),
        'description' => t('The direction of the flip (horizontal or vertical).'),
      ],
      'box_width' => [
        'type' => 'numeric',
        'label' => t('Box Width'),
        'description' => t('The width for each row in the flipbox.'),
      ],
      'box_height' => [
        'type' => 'numeric',
        'label' => t('Box Height'),
        'description' => t('The height for each flipbox.'),
      ],
      'flip_speed' => [
        'type' => 'numeric',
        'label' => t('Flip Speed'),
        'description' => t('The speed of the flip animation.'),
      ],
      'front_bg_color' => [
        'type' => 'string',
        'label' => t('Front Background Color'),
        'description' => t('The background color for the front side of the flipbox.'),
      ],
      'back_bg_color' => [
        'type' => 'string',
        'label' => t('Back Background Color'),
        'description' => t('The background color for the back side of the flipbox.'),
      ],
      'enable_perspective' => [
        'type' => 'boolean',
        'label' => t('Enable 3D Perspective'),
        'description' => t('Whether 3D perspective is enabled.'),
      ],
      'animation_easing' => [
        'type' => 'string',
        'label' => t('Animation Easing'),
        'description' => t('The easing function for the flip animation.'),
      ],
      'enable_css' => [
        'type' => 'boolean',
        'label' => t('Enable CSS Library'),
        'description' => t('Check this box to include the CSS library for styling the flipbox.'),
      ],
      'available_breakpoints' => [
        'type' => 'string',
        'label' => t('Responsive Breakpoints'),
        'description' => t('Define the breakpoints for responsive design.'),
      ],
    ],
  ];
}

