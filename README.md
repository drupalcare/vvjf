# Views Vanilla JavaScript 3D Flipbox

## Overview
The **Views Vanilla JavaScript 3D Flipbox** module (machine name: `vvjf`) is a 
versatile and dynamic Views style plugin designed to render content items in an 
engaging 3D flipbox format using vanilla JavaScript. This module enhances your 
site by adding a visually appealing, interactive flipbox effect to content 
displayed through Drupal Views.

## Features
- **3D Flipbox Effect**: Renders content items in a 3D flipbox format, creating 
  a captivating user experience.
- **Customizable Flip Triggers**: Choose between hover or click to trigger the 
  flip animation, allowing for interactive user engagement.
- **Flip Direction Options**: Configure the flip direction (horizontal or 
  vertical) to suit your design preferences.
- **Adjustable Flip Speed**: Set the animation speed for the flip effect to 
  control the pacing of transitions.
- **Custom Background Colors**: Define background colors for both the front and 
  back of the flipbox to match your site's theme.
- **3D Perspective**: Optionally enable 3D perspective for a more immersive 
  effect.
- **Responsive Design**: Includes breakpoints to ensure the flipbox adapts 
  seamlessly to different screen sizes or remains active across all screens.

## Configuration
After installing and enabling the module, you can configure it through the Views 
UI:

1. **Flip Trigger**: Select whether the flip is triggered by hover or click.
2. **Flip Direction**: Choose the direction of the flip 
(horizontal or vertical).
3. **Flip Speed**: Set the speed of the flip animation (e.g., 0.6s).
4. **Front/Back Background Colors**: Customize the background colors for the 
   front and back of the flipbox.
5. **Enable Perspective**: Check this option to enable 3D perspective.
6. **Available Breakpoints**: Select the breakpoints at which the flipbox 
   remains active or collapses for responsive design.

## Example Usage
1. Create a new view or edit an existing view.
2. Under the "Format" section, select "Views Vanilla JavaScript 3D Flipbox" as 
   the style.
3. Configure the flip trigger, direction, speed, background colors, and 
   perspective as needed.
4. Save the view and see the 3D flipbox in action on the front end.

## Additional Information
- **Dependencies**: This module does not have any dependencies on other 
  contributed modules.
- **Compatibility**: Fully compatible with Drupal 10 and follows Drupal best 
  practices.

## Installation
1. Download and install the module from 
   [Drupal.org](https://www.drupal.org/project/vvjf).
2. Enable the module through the Drupal admin interface or using Drush: 
   `drush en vvjf`
3. Clear caches to ensure the new plugin is available: `drush cr`

## Troubleshooting
If you encounter any issues or have suggestions for improvements, please open an 
issue in the module's issue queue on Drupal.org.

## Maintainers
- [Alaa Haddad](https://www.drupal.org/u/flashwebcenter)

## Support
For issues, feature requests, and general support, please use the 
[issue queue](https://www.drupal.org/project/issues/vvjf).

## License
This project is licensed under the 
[GNU General Public License, version 2 or later](http://www.gnu.org/licenses/gpl-2.0.html).
