<?php

declare(strict_types=1);

namespace Drupal\vvjf;

/**
 * Vvjf-specific constants — flipbox pattern-only values.
 *
 * Cross-cutting constants live in vvj_core's `ValidationBounds`.
 *
 * @internal Final, non-instantiable.
 */
final class VvjfConstants {

  /**
   * Flip trigger values.
   */
  public const string TRIGGER_HOVER = 'hover';
  public const string TRIGGER_CLICK = 'click';
  public const string DEFAULT_FLIP_TRIGGER = self::TRIGGER_CLICK;

  /**
   * Flip direction values.
   */
  public const string DIRECTION_HORIZONTAL = 'horizontal';
  public const string DIRECTION_VERTICAL = 'vertical';
  public const string DEFAULT_FLIP_DIRECTION = self::DIRECTION_VERTICAL;

  /**
   * Animation easing options.
   */
  public const string EASING_EASE = 'ease';
  public const string EASING_LINEAR = 'linear';
  public const string EASING_EASE_IN = 'ease-in';
  public const string EASING_EASE_OUT = 'ease-out';
  public const string EASING_EASE_IN_OUT = 'ease-in-out';
  public const string DEFAULT_ANIMATION_EASING = self::EASING_EASE;

  /**
   * Breakpoint values — `all` keeps flipbox active at every viewport size.
   */
  public const string BREAKPOINT_ALL = 'all';
  public const string DEFAULT_BREAKPOINT = '576';

  /**
   * Defaults.
   */
  public const float DEFAULT_FLIP_SPEED = 0.9;
  public const string DEFAULT_FRONT_BG_COLOR = '#f0fbff';
  public const string DEFAULT_BACK_BG_COLOR = '#b8e7ff';
  public const int DEFAULT_PERSPECTIVE = 1000;
  public const int DEFAULT_GRID_GAP = 16;
  public const int DEFAULT_BOX_HEIGHT = 250;
  public const int DEFAULT_BOX_WIDTH = 300;

  /**
   * Bounds.
   */
  public const float MIN_FLIP_SPEED = 0.1;
  public const float MAX_FLIP_SPEED = 2.0;
  public const float FLIP_SPEED_STEP = 0.1;
  public const int MIN_BOX_HEIGHT = 100;
  public const int MIN_BOX_WIDTH = 0;
  public const int MIN_GRID_GAP = 1;
  public const int MIN_PERSPECTIVE = 0;
  public const int PERSPECTIVE_STEP = 10;

  /**
   * Prevent instantiation.
   */
  private function __construct() {
  }

}
