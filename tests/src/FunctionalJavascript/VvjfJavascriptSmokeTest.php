<?php

declare(strict_types=1);

namespace Drupal\Tests\vvjf\FunctionalJavascript;

use Drupal\Tests\vvj_core\FunctionalJavascript\VvjPatternJavascriptTestBase;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;

/**
 * Browser smoke tests for the vvjf example view custom element.
 */
#[Group('vvjf')]
#[Group('vvj_javascript')]
#[RunTestsInSeparateProcesses]
final class VvjfJavascriptSmokeTest extends VvjPatternJavascriptTestBase {

  /**
   * {@inheritdoc}
   *
   * @var list<string>
   */
  protected static $modules = [
    'node',
    'block',
    'views',
    'field',
    'file',
    'filter',
    'text',
    'vvj_core',
    'vvjf',
  ];

  /**
   * {@inheritdoc}
   */
  protected function vvjExampleViewId(): string {
    return 'vvjf_example';
  }

  /**
   * {@inheritdoc}
   */
  protected function vvjCustomElementTag(): string {
    return 'vvjf-flipbox';
  }

}
