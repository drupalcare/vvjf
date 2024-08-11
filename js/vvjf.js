/**
 * @file
 * VVJ Flipbox.
 *
 * Filename:     vvjf.js
 * Website:      https://www.flashwebcenter.com
 * Developer:    Alaa Haddad https://www.alaahaddad.com.
 */
(function (Drupal, drupalSettings, once) {
  Drupal.behaviors.VVJFlipbox = {
    attach: function (context, settings) {
      const flipboxes = once('vvjFlipbox', '.vvjf', context);

      flipboxes.forEach(flipbox => {
        const breakpoints = flipbox.getAttribute('data-breakpoints');
        const trigger = flipbox.getAttribute('data-flip-trigger');

        function updateAccessibility(frontSide, backSide, isFlipped) {
          frontSide.setAttribute('aria-hidden', isFlipped ? 'true' : 'false');
          backSide.setAttribute('aria-hidden', isFlipped ? 'false' : 'true');

          const frontTabbables = frontSide.querySelectorAll('a, button, input, select, textarea, [tabindex]');
          const backTabbables = backSide.querySelectorAll('a, button, input, select, textarea, [tabindex]');

          frontTabbables.forEach(el => el.setAttribute('tabindex', isFlipped ? '-1' : '0'));
          backTabbables.forEach(el => el.setAttribute('tabindex', isFlipped ? '0' : '-1'));
        }

        function applyFlipboxBehavior() {
          const currentWidth = window.innerWidth;

          // Check if the current width meets the criteria for applying the flipbox behavior
          if (breakpoints === 'none' || currentWidth >= parseInt(breakpoints, 10)) {
            activateFlipbox(flipbox);
          } else {
            deactivateFlipbox(flipbox);
          }
        }

        function activateFlipbox(flipbox) {
          const flipboxItems = flipbox.querySelectorAll('.flipbox-item-inner');

          flipboxItems.forEach(inner => {
            const frontSide = inner.querySelector('.flipbox-front');
            const backSide = inner.querySelector('.flipbox-back');

            function handleMouseEnter() {
              updateAccessibility(frontSide, backSide, true);
            }

            function handleMouseLeave() {
              updateAccessibility(frontSide, backSide, false);
            }

            function handleClick() {
              const isFlipped = inner.classList.toggle('flipped');
              updateAccessibility(frontSide, backSide, isFlipped);
            }

            function handleKeyDown(event) {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                const isFlipped = inner.classList.toggle('flipped');
                updateAccessibility(frontSide, backSide, isFlipped);
              }
            }

            if (trigger === 'hover') {
              inner.addEventListener('mouseenter', handleMouseEnter);
              inner.addEventListener('mouseleave', handleMouseLeave);
            }

            if (trigger === 'click') {
              inner.addEventListener('click', handleClick);
            }

            inner.addEventListener('keydown', handleKeyDown);

            // Store the event handlers for later removal if necessary
            inner.flipboxHandlers = { handleMouseEnter, handleMouseLeave, handleClick, handleKeyDown };
          });
        }

        function deactivateFlipbox(flipbox) {
          const flipboxItems = flipbox.querySelectorAll('.flipbox-item-inner');
          flipboxItems.forEach(inner => {
            inner.classList.remove('flipped');
            if (inner.flipboxHandlers) {
              const { handleMouseEnter, handleMouseLeave, handleClick, handleKeyDown } = inner.flipboxHandlers;
              inner.removeEventListener('mouseenter', handleMouseEnter);
              inner.removeEventListener('mouseleave', handleMouseLeave);
              inner.removeEventListener('click', handleClick);
              inner.removeEventListener('keydown', handleKeyDown);
            }
          });
        }

        function resetFlippedOnResize() {
          const flipboxItems = flipbox.querySelectorAll('.flipbox-item-inner');
          flipboxItems.forEach(inner => {
            if (inner.classList.contains('flipped')) {
              inner.classList.remove('flipped');
              const frontSide = inner.querySelector('.flipbox-front');
              const backSide = inner.querySelector('.flipbox-back');
              updateAccessibility(frontSide, backSide, false);
            }
          });
          // Reapply event listeners after reset
          activateFlipbox(flipbox);
        }

        // Initial check on load
        applyFlipboxBehavior();

        // Check on window resize
        window.addEventListener('resize', () => {
          resetFlippedOnResize();
          applyFlipboxBehavior(); // Ensure behavior is reapplied after resize
        });
      });
    }
  };
})(Drupal, drupalSettings, once);
