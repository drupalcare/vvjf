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
        const parsedBreakpoint = parseInt(breakpoints, 10);
        const isBreakpointValid = !isNaN(parsedBreakpoint);

        function updateAccessibility(frontSide, backSide, isFlipped) {
          if (frontSide && backSide) {
            frontSide.setAttribute('aria-hidden', isFlipped ? 'true' : 'false');
            backSide.setAttribute('aria-hidden', isFlipped ? 'false' : 'true');

            const frontTabbables = frontSide.querySelectorAll('a, button, input, select, textarea, [tabindex]');
            const backTabbables = backSide.querySelectorAll('a, button, input, select, textarea, [tabindex]');

            frontTabbables.forEach(el => el.setAttribute('tabindex', isFlipped ? '-1' : '0'));
            backTabbables.forEach(el => el.setAttribute('tabindex', isFlipped ? '0' : '-1'));
          }
        }

        function disableLinksInsideFlipbox(flipbox, disable) {
          const links = flipbox.querySelectorAll('.flipbox-front a, .flipbox-back a');
          links.forEach(link => {
            if (disable) {
              link.setAttribute('tabindex', '-1');
              link.addEventListener('click', preventDefaultHandler);
            } else {
              link.removeAttribute('tabindex');
              link.removeEventListener('click', preventDefaultHandler);
            }
          });
        }

        function preventDefaultHandler(event) {
          event.preventDefault();
        }

        function applyFlipboxBehavior() {
          const currentWidth = window.innerWidth;

          if (breakpoints === 'all' || (isBreakpointValid && currentWidth >= parsedBreakpoint)) {
            activateFlipbox(flipbox);
            disableLinksInsideFlipbox(flipbox, true); // Disable links when active
          } else {
            deactivateFlipbox(flipbox);
            disableLinksInsideFlipbox(flipbox, false); // Re-enable links when inactive
          }
        }

        function activateFlipbox(flipbox) {
          const flipboxItems = flipbox.querySelectorAll('.flipbox-item-inner');
          if (!flipboxItems.length) return;

          flipboxItems.forEach(inner => {
            const frontSide = inner.querySelector('.flipbox-front');
            const backSide = inner.querySelector('.flipbox-back');
            if (!frontSide || !backSide) return;

            function handleMouseEnter() {
              inner.classList.add('flipped');
              updateAccessibility(frontSide, backSide, true);
            }

            function handleMouseLeave() {
              inner.classList.remove('flipped');
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

            // Remove existing event listeners to prevent duplication
            inner.removeEventListener('mouseenter', inner.flipboxHandlers?.handleMouseEnter);
            inner.removeEventListener('mouseleave', inner.flipboxHandlers?.handleMouseLeave);
            inner.removeEventListener('click', inner.flipboxHandlers?.handleClick);
            inner.removeEventListener('keydown', inner.flipboxHandlers?.handleKeyDown);

            // Attach event listeners based on the trigger type
            if (trigger === 'hover') {
              inner.addEventListener('mouseenter', handleMouseEnter);
              inner.addEventListener('mouseleave', handleMouseLeave);
            }

            if (trigger === 'click') {
              inner.addEventListener('click', handleClick);
            }

            inner.addEventListener('keydown', handleKeyDown);

            inner.flipboxHandlers = { handleMouseEnter, handleMouseLeave, handleClick, handleKeyDown };
          });
        }

        function deactivateFlipbox(flipbox) {
          const flipboxItems = flipbox.querySelectorAll('.flipbox-item-inner');
          if (!flipboxItems.length) return;

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
          if (!flipboxItems.length) return;

          flipboxItems.forEach(inner => {
            if (inner.classList.contains('flipped')) {
              inner.classList.remove('flipped');
              const frontSide = inner.querySelector('.flipbox-front');
              const backSide = inner.querySelector('.flipbox-back');
              updateAccessibility(frontSide, backSide, false);
            }
          });
        }

        function updateAriaHiddenBasedOnWidth() {
          const currentWidth = window.innerWidth;
          const flipboxItems = flipbox.querySelectorAll('.flipbox-item-inner');

          flipboxItems.forEach(inner => {
            const frontSide = inner.querySelector('.flipbox-front');
            const backSide = inner.querySelector('.flipbox-back');

            if (currentWidth < parsedBreakpoint) {
              // Small screen: both sides visible, disable flipping
              frontSide.setAttribute('aria-hidden', 'false');
              backSide.setAttribute('aria-hidden', 'false');

              // Remove flip classes and event listeners
              if (inner.classList.contains('flipped')) {
                inner.classList.remove('flipped');
              }
              inner.removeEventListener('mouseenter', inner.flipboxHandlers?.handleMouseEnter);
              inner.removeEventListener('mouseleave', inner.flipboxHandlers?.handleMouseLeave);
              inner.removeEventListener('click', inner.flipboxHandlers?.handleClick);
              inner.removeEventListener('keydown', inner.flipboxHandlers?.handleKeyDown);

              disableLinksInsideFlipbox(flipbox, false); // Re-enable links on small screens

            } else {
              // Large screen: standard behavior
              const isFlipped = inner.classList.contains('flipped');
              frontSide.setAttribute('aria-hidden', isFlipped ? 'true' : 'false');
              backSide.setAttribute('aria-hidden', isFlipped ? 'false' : 'true');

              // Reattach event listeners
              activateFlipbox(flipbox);
              disableLinksInsideFlipbox(flipbox, true); // Disable links on large screens
            }
          });
        }

        // Throttle the resize event handler
        function throttle(func, limit) {
          let lastFunc;
          let lastRan;
          return function() {
            const context = this;
            const args = arguments;
            if (!lastRan) {
              func.apply(context, args);
              lastRan = Date.now();
            } else {
              clearTimeout(lastFunc);
              lastFunc = setTimeout(function() {
                if (Date.now() - lastRan >= limit) {
                  func.apply(context, args);
                  lastRan = Date.now();
                }
              }, limit - (Date.now() - lastRan));
            }
          };
        }

        // Initial check on load
        applyFlipboxBehavior();
        updateAriaHiddenBasedOnWidth();

        // Throttled resize event listener
        const resizeHandler = throttle(() => {
          resetFlippedOnResize();
          applyFlipboxBehavior();
          updateAriaHiddenBasedOnWidth();
        }, 200);

        window.addEventListener('resize', resizeHandler);
      });
    }
  };
})(Drupal, drupalSettings, once);


