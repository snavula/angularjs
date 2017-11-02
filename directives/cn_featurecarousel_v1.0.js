//
//	DOC: cn-feature-carousel
//
//	Augments a bootstrap carousel to display slides of "features".
//	Re-populates the slide based on screen size.  So a narrow screen
//	might have 2 features per slide, while a wide screen could have 4.
//
//	DEPENDENCIES:
//		* Bootstrap 3
//		* jQuery (also required by Bootstrap)
//
//	NOTES:
//		* Uses $interpolate to render angular templates to HTML strings.  Two-way binding will not work.
//
//	USAGE:
//	<div cn-feature-carousel="{
//		 	endpoint : '/some_file.json', // (req) (url) - url to endpoint JSON, can be the ID of a script tag.
//			target	 : '#carousel', // (opt) (jQuery) - selector for the target carousel to act on.
//											            Defaults to $element if no target is specified.
//			breakpoints : [ // (req) (array) - Array containing object literals for various breakpoints
//				{ 
//					breakpoint : 0, // (req) (num) - width in pixels of the screen size for this breakpoint. (handled as min-width)
//					tiles      : 2 // (req) (num) - number of tiles with which to populate the carousel at this breakpoint
//				}
//			],
//			interval : 4000 (opt) (num) - Auto-scroll speed for the carousel in milliseconds
//		 }">
//		<!-- Bootstrap Carousel Widget -->
//	</div>
//
//	EXAMPLE TILE TEMPLATE:
//		 <script type="text/ng-template" id="recipes_carousel_ng-tpl">
//		 	{# 
//		 	 #	Opening tags for carousel slides.
//		 	 # 	Since each "slide" has multiple feature tiles, we need to apply these conditionally.
//		 	 #	This is on the template so that we have more control over the slide markup without
//		 	 #	having to edit the cn-FeatureCarousel angular directive.
//		 	 #}
//		 	{{ '{{' }}meta.index === 0 ? '<div class=\"item active\"><div class=\"row text-center\">' : ''{{ '}}' }}
//		 	{{ '{{' }}meta.index !== 0 && meta.index % meta.maxTiles === 0 ? '<div class=\"item\"><div class=\"row text-center\">' : ''{{ '}}' }}
//		 		{#
//		 		 #	Feature tile
//		 		 #}
//		
//	 			<div class="recipe_tile 
// 							col-xs-6 
// 					 		col-md-4 
//	 				 		col-lg-3 
// 					 		tilePadding 
// 					 		{{ '{{' }}meta.lastIndex % meta.maxTiles > meta.lastIndex - (meta.index + 1) ? 'recipe_tile_nofloat' : ''{{ '}}' }}
// 				">
// 					<a class="recipe_tile_link" href="#recipe_placeholder_link">
// 						<div class="recipe_tile_top">
// 							<img class="recipe_tile_img" src="{{ '{{' }}small_picture_url{{ '}}' }}">
// 							<div class="recipe_tile_brand_frame">
// 								<img class="recipe_tile_brand_img" src="{{ '{{' }}brand_logo_url{{ '}}' }}">
// 							</div>
// 						</div>
// 						<div class="recipe_tile_title bg_white">
// 							{{ '{{' }}title{{ '}}' }}
// 						</div>
// 					</a>
// 				</div>
	
// 			{#
// 	 		#	Closing tags for the slides.
// 	 		#}
// 			{{ '{{' }}meta.index !== 0 && (meta.index - (meta.maxTiles -1) ) % meta.maxTiles == 0 || meta.index == meta.lastIndex ? '</div></div>' : ''{{ '}}' }}
// 		</script>


angular.module('cnFeatureCarousel', []).directive('cnFeatureCarousel', [function () {
	return {
		restrict: 'A',
		scope: true,
		controller: ['$scope', '$rootScope', '$element', '$attrs', '$templateCache', '$interpolate', '$sce', function($scope, $rootScope, $element, $attrs, $templateCache, $interpolate, $sce) {
			
			// ----------  Setup  ---------- //

			// import options
			var _opts = $scope.$eval($attrs.cnFeatureCarousel);
			
			// dependency check
			if (!window.jQuery) throw 'ERROR: cnFeatureCarousel requires jQuery. (As does Bootstrap).';
			if ( $('cn-windowstate').length < 1 ) throw 'ERROR: cnFeatureCarousel requires an instance of cnWindowsate to exist on the DOM.';
			if (!_opts.hasOwnProperty('endpoint')) throw 'ERROR: cnFeatureCarousel requires an endpoint property.';
			if (!_opts.hasOwnProperty('breakpoints')) throw 'ERROR: cnFeatureCarousel requires a breakpoints property.';
			if (!_opts.hasOwnProperty('feature_template')) throw 'ERROR: cnFeatureCarousel requires a feature_template property.';


			// ----------  Internal Variables  ---------- //

      		var _targ = _opts.hasOwnProperty('target') ? $(_opts.target) : $element; // determine if instantiated as an element or an attribute
      		var _model = {} // stores feature information (after it's been retrieved)
      		var _feature_template = $templateCache.get(_opts.feature_template); // angular template for feature tiles
      		var _feature_tiles = []; // array of raw html strings for feature tiles created from the feature_template, these are eventually written to the DOM
      		$scope.carouselContent = ''; // string created from assembled from _feature_tiles.  This is what gets written to the DOM

      		// DATA FLOW:  Model > _feature_template > _feature_tiles > $scope.carouselContent > DOM

      		var _slideSearchInterval = null; // used for dirty checking when new slides have been written to the DOM
      		var _rendered_slides = []; // used for indexing the slides after they've been written to the DOM
      		var _controlLock = false; // locks the controls while slides are switching (prevents user spam)
      		var _scrollTimeout = null; // interval at which to switch slides automatically


			// ----------  Breakpoint Handling  ---------- //
			
			var _breakpoints = _opts.breakpoints;
			var _sorted = []; // stores breakpoints in ascending order

			// Make sure breakpoints are in ascending order.
			$scope.sortBreakpoints = function() {
				while ( _breakpoints.length > 0 ) {
					var _lowest = 0; // index of the lowest breakpoint (start at 0)
					// iterate over each breakpoint and compare its value to the lowest breakpoint found so far.
					for (var i = 0; i < _breakpoints.length; i++) {
						if ( _breakpoints[i].breakpoint < _breakpoints[_lowest].breakpoint ) _lowest = i;
					}
					// now that we've found the lowest breakpoint, push it to the _sorted array.
					_sorted.push( _breakpoints[_lowest] );
					// and remove this breakpoint from the _breakpoints array so it doesn't get re-evaluated.
					_breakpoints.splice(_lowest, 1);
				}
			}

			// Find the current breakpoint based on screen width.
			$scope.getBreakpoint = function (_width) {
				var _breakpoint_index = 0;
				for (var i = 0; i < _sorted.length; i ++) {
					if ( _width >= _sorted[i].breakpoint) {
						_breakpoint_index = i;
					}
				}
				return _sorted[_breakpoint_index].tiles;
			}


			// ----------  JSON Import  ---------- //

			// Should we use JSON from an external file, or is it echoed on the DOM?
			$scope.getEndpoint = function () {
				var _endpointStr = _opts.endpoint;
		        var _endpoint = _endpointStr.split('.');
		        if ( _endpoint[0] === 'window' ) { // search DOM for JSON
		          $scope.evalJSON( window[_endpoint[1]] )
		        } else { // load JSON via ajax
		          $scope.requestJSON();
		        }
			}

			// Requests JSON from an external source.
			$scope.requestJSON = function() {
				$.get(_opts.endpoint, function(resp) {
		        	if (resp) {
		        		$scope.evalJSON(resp);
		        	} else {
		            	targ.hide(); // hide the carousel because it has no content to show
		        	}
		    	},'JSON');
			}

			// Runs an empty check on the imported JSON.
			// If the JSON appears valid, store it as an object literal.
			// Else show a warning in the console and hide the carousel.
			$scope.evalJSON = function( _json ) {
	        	if (_json.length > 0) {
	          		_model = _json; // if JSON seems valid, store it as an object literal.
	        	} else {
	          		console.warn('CN-FEATURE-CAROUSEL: JSON loaded, but no features were found.')
	          		_targ.hide(); // hide the carousel because it has no content to show
	          		return false;
	        	}
	        	$scope.populateCarousel( $(window).innerWidth() );
			}
	

			// ----------  DOM Population  ---------- //

			// Writes the carousel slides containing a set number
			// of feature tiles.  The number of feature tiles
			// in each slide is determined by the screen width.

			$scope.populateCarousel = function( _width ) {
				$scope.autoScroll(false); // stop the carousel from auto scrolling
				clearInterval(_slideSearchInterval); // stop searching for new slides, because we're about to overrite them.
				
				var _maxTiles = $scope.getBreakpoint( _width );
				var _output = '';
				for (var i = 0; i < _model.length; i ++) {
					// Add some data to _model so the feature tile templates can use it in their display logic
					_model[i].meta = { // holds additional data for the template
						index: i, // index in the _models array
						lastIndex: _model.length - 1, // the last index in the models array (offset is for array indexing)
						maxTiles: _maxTiles // the max number of feature tiles that can be in this row at this time
					};

					// compile the feature template into a string, using the data from _model[i]
					// we're using $interpolate because it's a little faster than $compile and
					// we can rebuild the carousel's inner content here anyway.
					var _cpl = $interpolate(_feature_template)(_model[i]);
					_output += _cpl;
				}
				// Make this available to the directive on the DOM
				$scope.carouselContent = $sce.trustAsHtml(_output);

				// TODO: find a better way to do this.
				// Repopulating the DOM can take a few milliseconds, so
				// we have to ditry check when the update takes place.
				_slideSearchInterval = setInterval(function () {
					$scope.dirtyCheckForPopulationUpdate();
				}, 200);
			}

			$scope.dirtyCheckForPopulationUpdate = function () {
				_rendered_slides = $($element).find('.item').toArray();	
				if (_rendered_slides.length) { // Slides were found
					$scope.autoScroll(true); // Start auto scrolling (if we need to)
					clearInterval( _slideSearchInterval ); // stop dirtychecking
				}
			}


			// ----------  Event Handlers  ---------- //

			// Rebuild the carousel if the user changes the size of the window
			$rootScope.$on('windowstate', function(evt, data) {
				$scope.$apply( function() {
					$scope.populateCarousel( data.width );
				});
			});

			$scope.bindControls = function () {
				// Arrow buttons
				_targ.find('[data-slide="prev"]').on('click', function(e) {
		          e.preventDefault();
		          if (!_controlLock) $scope.switchSlide('prev');
		        });
		        _targ.find('[data-slide="next"]').on('click', function(e) {
		          e.preventDefault();
		          if (!_controlLock) $scope.switchSlide('next');
		        });

		       	// Swipe Gestures
		        _targ.on('swiperight', function(e) {
		          if (!_controlLock) $scope.switchSlide('prev');
		        });
		        _targ.on('swipeleft', function(e) {
		          if (!_controlLock) $scope.switchSlide('next');
		        });
			}


			// ----------  Carousel Operation  ---------- //

			// Returns an object literal containing an array of the
			// currently rendered slides on the DOM and the index
			// of the slide that is currently visible.
			$scope.indexRenderedSlides = function () {
				var _active_slide = null;
				var _next_slide = null;
				var _previous_slide = null;

				for (var i = 0; i < _rendered_slides.length; i ++) {
					if ( $(_rendered_slides[i]).hasClass('active') ) {
						_active_slide = i;
						i < _rendered_slides.length - 1 ? _next_slide = i + 1 : _next_slide = 0;
						i > 0 ? _previous_slide = i - 1 : _previous_slide = _rendered_slides.length - 1;
						break;
					}
				}

				return {
					rendered : _rendered_slides, // array of the rendered slides on the DOM
					active   : _active_slide, 	 // index of the active slide
					next     : _next_slide, 	 // index of the next slide
					prev     : _previous_slide 	 // index of the previous slide
				}
			}

			$scope.switchSlide = function ( _dir ) {
				_controlLock = true; // prevent further interaction by the user until this function is done
				$scope.autoScroll(false); // stop autoScroll in case the switch was caused by user interaction

				// Check which slides are on the DOM, figure out what the
				// previous and next slides should be.
				_slides = $scope.indexRenderedSlides();
				var _active = _slides.rendered[ _slides.active ];
				var _new = _slides.rendered[_slides[_dir]];

				// The active slide can have one of two exit animations (panning left or right)
				// so we have to set that class conditionally
				// TODO:  Make animation CSS classes configurable
				var _animation = _dir == 'prev' ? 'panRight' : 'panLeft';

				// Nested timeouts are for sequencing class assignments, otheriwse JQuery
				// will perform them as if one operation.  We use setTimeout instead of
				// setInterval because different phases in the animation need different
				// delays
				
				// 1)  Place the next slide.
				$(_new).addClass('active ' + _dir + ' ' + _animation);
				
				// 2)  Animatite the active slide, and the next slide simultaniously
				setTimeout(function(){
					$(_active).addClass( _animation );
					$(_new).removeClass(_dir + ' ' + _animation);
				
				// 3)  Return the (no formerly) active slide to its default state
					setTimeout(function() {
						$(_active).removeClass( 'active ' + _animation );
						_controlLock = false; // allow users to interact with the carousel again
						$scope.autoScroll(true);
					}, 400); // delay for #3 (allows time for the animation to finish)
				}, 100); // delay for #2
			}


			// Controls if the carousel scrolls on its own, also stops the scroll
			// behavior if it's active.
			$scope.autoScroll = function ( _bool ) { // true = commence auto scrolling, false = stop auto scrolling
				if ( _opts.hasOwnProperty('interval') && _rendered_slides.length > 1 && _bool ) {
					_scrollTimeout = setTimeout(function () {
						$scope.switchSlide('next');
					}, _opts.interval);
				} else {
					clearTimeout( _scrollTimeout );
				}
			}


			// ----------  Blastoff!  ---------- //

			$scope.init = function() {
				$scope.sortBreakpoints();
				$scope.getEndpoint();
				$scope.bindControls();
			}

		}],
		link: function( $scope, $rootScope ) {
			$scope.init();
		}
	}
}]);