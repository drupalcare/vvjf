<?php

declare(strict_types=1);

namespace Drupal\vvjf;

/**
 * Defines constants for the VVJF module.
 */
final class VvjfConstants {

  public const TOKEN_NAMESPACE = 'vvjf';
  public const TOKEN_PLAIN_SUFFIX = ':plain';
  public const TOKEN_PATTERN = '/^[a-zA-Z0-9_]+(:plain)?$/';

  public const DATA_ATTRIBUTE_MAP = [
    'flip_trigger' => 'flip-trigger',
    'flip_direction' => 'flip-direction',
    'flip_speed' => 'flip-speed',
    'front_bg_color' => 'front-bg-color',
    'back_bg_color' => 'back-bg-color',
    'box_height' => 'box-height',
    'box_width' => 'box-width',
    'perspective' => 'perspective',
    'grid_gap' => 'grid-image-gap',
    'animation_easing' => 'animation-easing',
    'unique_id' => 'unique-id',
    'available_breakpoints' => 'available-breakpoints',
  ];

  public const BOOLEAN_ATTRIBUTE_MAP = [
    'enable_css' => 'enable-css',
  ];

  public const VIEWS_TYPE_INTEGER = 'integer';
  public const VIEWS_TYPE_STRING = 'string';
  public const VIEWS_TYPE_BOOLEAN = 'boolean';
  public const VIEWS_TYPE_NUMERIC = 'numeric';

  public const DEFAULT_FLIP_TRIGGER = 'click';
  public const DEFAULT_FLIP_DIRECTION = 'vertical';
  public const DEFAULT_FLIP_SPEED = 0.9;
  public const DEFAULT_FRONT_BG_COLOR = '#f0fbff';
  public const DEFAULT_BACK_BG_COLOR = '#b8e7ff';
  public const DEFAULT_PERSPECTIVE = 1000;
  public const DEFAULT_BREAKPOINT = '576';
  public const DEFAULT_ANIMATION_EASING = 'ease';
  public const DEFAULT_GRID_GAP = 16;
  public const DEFAULT_ENABLE_CSS = TRUE;
  public const DEFAULT_BOX_HEIGHT = 250;
  public const DEFAULT_BOX_WIDTH = 300;

  public const MIN_BOX_HEIGHT = 100;
  public const MIN_BOX_WIDTH = 0;
  public const MIN_GRID_GAP = 1;
  public const MIN_PERSPECTIVE = 0;
  public const PERSPECTIVE_STEP = 10;

  public const MIN_FLIP_SPEED = 0.1;
  public const MAX_FLIP_SPEED = 2.0;
  public const FLIP_SPEED_STEP = 0.1;

  public const MIN_UNIQUE_ID = 10000000;
  public const MAX_UNIQUE_ID = 99999999;

  private function __construct() {
  }

}
