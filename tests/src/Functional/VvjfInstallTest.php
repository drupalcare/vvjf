<?php

declare(strict_types=1);

namespace Drupal\Tests\vvjf\Functional;

use Drupal\Tests\BrowserTestBase;
use Drupal\user\Entity\User;
use Drupal\views\Views;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;

/**
 * Confirms vvjf installs, ships its example view, and appears in Views UI.
 */
#[Group('vvjf')]
#[RunTestsInSeparateProcesses]
final class VvjfInstallTest extends BrowserTestBase {

  /**
   * {@inheritdoc}
   *
   * @var list<string>
   */
  protected static $modules = [
    // `help` serves /admin/help/{name}; without it testHelpPageRenders can
    // only ever 404, whatever this module does.
    'help',
    'node',
    'views',
    'views_ui',
    'vvjf',
  ];

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * The module installs and ships its example view as optional config.
   */
  public function testModuleInstallsAndShipsExampleView(): void {
    $this->assertTrue(
      $this->container->get('module_handler')->moduleExists('vvjf'),
    );
    $view = Views::getView('vvjf_example');
    $this->assertNotNull($view, 'Example view installs as optional config.');
  }

  /**
   * The style is reachable through the Views UI edit form.
   */
  public function testStyleAppearsInViewsUi(): void {
    $admin = $this->drupalCreateUser([
      'administer views',
      'access administration pages',
    ]);
    $this->assertInstanceOf(User::class, $admin);
    $this->drupalLogin($admin);

    $this->drupalGet('admin/structure/views/view/vvjf_example/edit');
    $this->assertSession()->statusCodeEquals(200);
    $this->assertSession()->pageTextContains('VVJF Example');
  }

  /**
   * The module help page renders with the expected summary text.
   */
  public function testHelpPageRenders(): void {
    $admin = $this->drupalCreateUser([
      'access administration pages',
      // The route requires `access help pages`, not merely
      // `access administration pages` — checked against core's
      // help.routing.yml rather than assumed.
      'access help pages',
    ]);
    $this->assertInstanceOf(User::class, $admin);
    $this->drupalLogin($admin);

    $this->drupalGet('admin/help/vvjf');
    $this->assertSession()->statusCodeEquals(200);
    $this->assertSession()->responseContains('Views Vanilla JavaScript 3D Flipbox');
  }

}
