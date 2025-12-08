/*
	Strata by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var $window = $(window),
		$body = $('body'),
		$header = $('#header'),
		$footer = $('#footer'),
		$main = $('#main'),
		settings = {

			// Parallax background effect?
				parallax: true,

			// Parallax factor (lower = more intense, higher = less intense).
				parallaxFactor: 20

		};

	// Breakpoints.
		breakpoints({
			xlarge:  [ '1281px',  '1800px' ],
			large:   [ '981px',   '1280px' ],
			medium:  [ '737px',   '980px'  ],
			small:   [ '481px',   '736px'  ],
			xsmall:  [ null,      '480px'  ],
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Terminal typing animation
		function typeTerminalText() {
			var $terminalText = $('#terminal-text');
			var $originalText = $('#intro-original');
			var $cursor = $('#terminal-cursor');
			
			if ($terminalText.length && $originalText.length) {
				// Get the text content, preserving HTML structure for the games-toggle span
				var originalHTML = $originalText.html();
				var textToType = $originalText.text();
				
				// Store the games-toggle span for later insertion
				var gamesToggleMatch = originalHTML.match(/<span[^>]*id="games-toggle"[^>]*>games<\/span>/);
				var gamesToggleHTML = gamesToggleMatch ? gamesToggleMatch[0] : 'games';
				
				// Find where "games" appears in the text
				var gamesIndex = textToType.indexOf('games');
				
				$terminalText.html('');
				var currentIndex = 0;
				var typingSpeed = 30; // milliseconds per character
				var currentHTML = '';
				
				function typeNextChar() {
					if (currentIndex < textToType.length) {
						// Check if we're about to type "games"
						if (currentIndex === gamesIndex) {
							// Insert the games-toggle span
							currentHTML += gamesToggleHTML;
							$terminalText.html(currentHTML);
							currentIndex += 5; // Skip past "games"
						} else {
							// Add next character
							currentHTML += textToType[currentIndex];
							$terminalText.html(currentHTML);
							currentIndex++;
						}
						
						setTimeout(typeNextChar, typingSpeed);
					} else {
						// Typing complete - keep cursor blinking
						$cursor.addClass('blink');
					}
				}
				
				// Start typing after a short delay
				setTimeout(typeNextChar, 500);
			}
		}
		
		// Initialize terminal typing on page load
		$window.on('load', function() {
			typeTerminalText();
		});

	// Touch?
		if (browser.mobile) {

			// Turn on touch mode.
				$body.addClass('is-touch');

			// Height fix (mostly for iOS).
				window.setTimeout(function() {
					$window.scrollTop($window.scrollTop() + 1);
				}, 0);

		}

	// Footer.
		breakpoints.on('<=medium', function() {
			$footer.insertAfter($main);
		});

		breakpoints.on('>medium', function() {
			$footer.appendTo($header);
		});

	// Header.

		// Parallax background.

			// Disable parallax on IE (smooth scrolling is jerky), and on mobile platforms (= better performance).
				if (browser.name == 'ie'
				||	browser.mobile)
					settings.parallax = false;

			if (settings.parallax) {

				breakpoints.on('<=medium', function() {

					$window.off('scroll.strata_parallax');
					$header.css('background-position', '');

				});

				breakpoints.on('>medium', function() {

					$header.css('background-position', 'left 0px');

					$window.on('scroll.strata_parallax', function() {
						$header.css('background-position', 'left ' + (-1 * (parseInt($window.scrollTop()) / settings.parallaxFactor)) + 'px');
					});

				});

				$window.on('load', function() {
					$window.triggerHandler('scroll');
				});

			}

	// Main Sections: Two.

		// Lightbox gallery.
			$window.on('load', function() {

				$('#two').poptrox({
					caption: function($a) { return $a.next('h3').text(); },
					overlayColor: '#2c2c2c',
					overlayOpacity: 0.85,
					popupCloserText: '',
					popupLoaderText: '',
					selector: '.work-item a.image',
					usePopupCaption: true,
					usePopupDefaultStyling: false,
					usePopupEasyClose: false,
					usePopupNav: true,
					windowMargin: (breakpoints.active('<=small') ? 0 : 50)
				});

			});

})(jQuery);