// DOC: cn-banner
//
// Augments the carousel widget for Bootstrap3 by adding the following:
//   * Slides can be generated with javascript.
//   * External carousels can be populated.  Example: If this directive is in the footer,
//     it can populate a carousel in the header.
//   * A mobile and desktop version of each slide can be defined and will
//     load based on a specified breakpoint.
//
// CHANGE LOG:
//    v1.1
//      * Added optional banner-json-mock attribute for unit testing with assistance from the back-end.
//      * Added optional banner-json-local attribute that loads json locally instead of with an ajax call.
//      * Added failsafe if banners do not load from the back-end properly.
//
// DEPENDENCIES
//   * Requires Boostrap 3's Carousel
//   * Requires jQuery.  (Also a dependancy of Bootstrap 3)
//   * Requires jQuery mobile touch events for swipe gestures.
//
// NOTES:
//   * It's HIGHLY recommended that you read Bootstrap 3's carousel documentation before
//     using this directive.  URL below:
//     http://getbootstrap.com/javascript/#carousel
//   * If this directive has no specified target element, it will assume it is instantiated on a bootstrap
//     carousel, searching down the DOM tree for where to add dynamic content
//   * See exmaple JSON at the end of this documentation for formatting.
//
// USAGE:
//  <cn-banner 
//             // Data input from the view so that the correct banners are requested.
//             // The ajax request simply excludes any params that are not specified.
//             banner-brand-id="<?php echo isset($brand_id) ? $brand_id : null; ?>" // (Opt) - brand id from the view.
//             banner-category-id="<?php echo isset($category_id) ? $category_id : null; ?>" // (Opt) - category id from the view
//             banner-offer-id="<?php echo isset($offer_id) ? $offer_id : null; ?>" // (Opt) - offer id from the view
//             banner-page-type="<?php echo isset($page_type) ? $page_type : null; ?>" // (Opt) - page type from the view
//             banner-json-mock="{{ '/assets/js/test/banners.json'|asset }}" // (Opt) - mock json for testing this directive without the back-end
//             banner-endpoint="/banners.json" // (Req) - endpoint where the json will be fetched.
//                                                        NOTE:  prefixing this with "window." will tell the directive to search the DOM for
//                                                               the JSON instead of making an ajax requiest.  
//                                                               Example: banner-endpoint="window.local_json"
//                                                                  will call
//                                                                      var local_json = { "some": "json" };
//
//             // Settings for the carousel itself.
//             banner-start="3" // (Opt) Number - starting slide
//             banner-target="#banner_carousel" // (Opt) jQuery selector - the target carousel widget 
//             banner-indicators="true" // (Opt) Boolean - if the carousel should have dot indicators
//             banner-controls="true" // (Opt) Boolean - if the carousel should have left and right arrow controls
//             banner-breakpoint="640" // (Opt) Number - screen width at which to load a mobile version of the slide image
//             banner-slide-template="banner_carousel_slide_template" // (Opt) angular template for the banner slide
//             >
//  </cn-banner>
//
// JSON EXAMPLE:
//  [{
//    "success": true,
//    "result": {
//      "has_banner" : true,
//      "banners" : [
//        {
//          "link" : "http://www.google.com",
//          "target" : "external",
//          "picture_url" : "https://cnccjp.dev/assets/mock/img/banner_desktop_1.jpg",
//          "alternative_picture_url" : "https://cnccjp.dev/assets/mock/img/banner_mobile_1.jpg"
//        },
//        {
//          "link" : "http://www.bing.com",
//          "target" : "internal",
//          "picture_url" : "https://cnccjp.dev/assets/mock/img/banner_desktop_2.jpg",
//          "alternative_picture_url" : "https://cnccjp.dev/assets/mock/img/banner_mobile_2.jpg"
//        }
//      ]
//    }
//  }];


angular.module('cnBanner', []).directive('cnBanner', [function (){
  return {
    restrict: 'AE',
    controller: ['$scope', '$rootScope', '$element', '$attrs', '$templateCache', '$compile', function($scope, $rootScope, $element, $attrs, $templateCache, $compile) {
      
      // ----------  Setup  ---------- //
      
      // check dependancies
      if (!window.jQuery) throw 'ERROR: cn-banner requires jQuery';

      // ensure we have some place from which to get JSON
      if (!$attrs.hasOwnProperty('bannerEndpoint')) throw 'ERROR: cn-banner requires a banner-endpoint attribute.';
      
      // determine if instantiated as an element or an attribute
      var targ = $attrs.bannerTarget ? $($attrs.bannerTarget) : $($element);
      
      // check if the banner should display slide indicators, default is false
      var useDots = $attrs.hasOwnProperty('bannerIndicators') && $attrs.bannerIndicators === 'true' ? true : false;
      
      // check if the banner should display left and right arrows to switch slides, default is false
      var useCtrls = $attrs.hasOwnProperty('bannerControls') && $attrs.bannerControls === 'true' ? true : false;
      
      // check if the banner should use a different image based on a screen-width breakpoint
      var breakpoint = $attrs.hasOwnProperty('bannerBreakpoint') ? Number($attrs.bannerBreakpoint) : 0; 
      var img_src = ''; // stores mobile or desktop image source key
      
      // the carousel requires that one slide be marked as "active".  This will be the first slide that displays.
      // TODO: Make this more robust.  Add ability to start at last slide, half way, etc.
      var startAt = $attrs.hasOwnProperty('bannerStart') ? Number($attrs.bannerStart) - 1 : 0;
      if (startAt < 1) startAt = 0;
      
      // load an angular template for the slides.  If none is specified, a hardcoded string is used instead
      var slideTemplate = false; // assume we're not using a template
      if ($attrs.hasOwnProperty('bannerSlideTemplate')) slideTemplate = $templateCache.get($attrs.bannerSlideTemplate);
      
      // Store slide information.  This is an array of object literals if we're
      // using a template, and an array of html strings if we're not.
      $scope.slides = [];
      
      
      // ----------  Data  ---------- //
      
      // object literal to store banner information
      var model = {};
      
      // Build parameters that will be sent as part of the
      // ajax request for the banner info.
      var params = {};
      
      var makeParam = function (_key, _val, _dataType) {
        if (_dataType == 'number') {
          params[_key] = Number(_val); 
        } else if (_dataType == 'string') {
          params[_key] = String(_val);
        } else if (_dataType == 'boolean') {
          params[_key] = Boolean(_val);
        }
        return params;
      }
      
      var buildParams = function() {
        if ($attrs.hasOwnProperty('bannerBrandId') && $attrs.bannerBrandId) makeParam('brand_id', $attrs.bannerBrandId, 'number');
        if ($attrs.hasOwnProperty('bannerCategoryId') && $attrs.bannerCategoryId) makeParam('category_id', $attrs.bannerCategoryId, 'number');
        if ($attrs.hasOwnProperty('bannerOfferId') && $attrs.bannerOfferId) makeParam('offer_id', $attrs.bannerOfferId, 'number');
        if ($attrs.hasOwnProperty('bannerPageType') && $attrs.bannerPageType) makeParam('mode', $attrs.bannerPageType, 'string');
        return params;
      }

      // If we should search the DOM for the JSON with banner info or make an ajax request.
      var getEndpoint = function () {
        var _endpointStr = $attrs.bannerEndpoint;
        var _endpoint = _endpointStr.split('.');
        if ( _endpoint[0] === 'window' ) { // seach DOM for JSON
          parseJsonResult( window[_endpoint[1]] )
        } else { // load JSON via ajax
          requestBanners();
        }
      }

      // Makes the ajax request for getting banner information
      var requestBanners = function () {
        $.get($attrs.bannerEndpoint, buildParams(), function(resp) {
          if (resp) {
            parseJsonResult(resp);
          } else {
            targ.hide(); // hide the carousel because it has no content to show
          }
        },'JSON');
      }

      // Checks JSON for banners
      var parseJsonResult = function ( json ) {
        if (json[0]['result']['has_banner']) {
          model = json[0]['result'];
          generateSlides();
        } else {
          console.warn('CN-BANNER: JSON loaded, but no banners were found.')
          targ.hide(); // hide the carousel because it has no content to show
        }
      }
      
      
      // ----------  Responsive  ---------- //
      
      // returns the correct image, based on screen width
      var getPictureUrl = function() {
        // picture_url = desktop, alternative_picture_url = mobile
        return $rootScope.getData().width <= breakpoint ? 'alternative_picture_url' : 'picture_url';
      }
      
      // windowstate is fired by the cn-windowstate directive
      $rootScope.$on('windowstate', function(e, data) {
        refreshImages();
      });
      
      
      // ----------  Generate Carousel Content  ---------- //
      
      // The HTML and addition for dot indicators
      var addIndicators = function (i, _active) {
        var _dot = '<li data-target="#banner_carousel" data-slide-to="' + i + '" class="' + _active + ' item_indicator"></li>';
        targ.find('.carousel-indicators').append(_dot);
      }
      
      var addCtrls = function() {
        var _ctrls = '<a class="left  carousel-control" href="#banner_slides" role="button" data-slide="prev">' +
                     '  <span class="vAlign"></span><span class="fa fa-angle-left"></span>' + 
                     '</a>' +
                     '<a class="right carousel-control" href="#banner_slides" role="button" data-slide="next">' + 
                     '  <span class="vAlign"></span><span class="fa fa-angle-right"></span>' +
                     '</a>';
        targ.append(_ctrls);
        
        // re-bind click handlers
        targ.find('[data-slide="prev"]').on('click', function(e) {
          e.preventDefault();
          targ.carousel('prev');
        });
        targ.find('[data-slide="next"]').on('click', function(e) {
          e.preventDefault();
          targ.carousel('next');
        });
        targ.on('swiperight', function(e) {
          targ.carousel('prev');
        });
        targ.on('swipeleft', function(e) {
          targ.carousel('next');
        });
      }
      
      // This is the HTML for the slide if no angular template is used
      var slideString = function(_active, _url, _target, _src) {
        return '<div class="item ' + _active + '">' +
               '  <a href="' + _url + '" target="' + _target + '" rel="noopener">' +
               '    <img src="' + _src + '" alt="" class="item_img">' + 
               '  </a>' +
               '</div>';
      }
      
      // Iterate through slide info and write the slide HTML.
      // Most of this should be done by the controller.
      var generateSlides = function() {
        for (var i = 0; i < model.banners.length; i++) {
          // get general data for this slide
          var _data = model.banners[i];

          // determine if this should be the starting slide
          var _active = i == startAt ? 'active' : '';

          var _slide = {
            url: _data.link,
            href_target: _data.target == 'internal' ? '_self' : '_blank',
            src: model.banners[i][img_src],
            active: i == startAt ? 'active' : ''
          }

          // Add the slide HTML to the $scope.slides array.
          if (slideTemplate) {
            // used by angular template
            $scope.slides.push(_slide);
          } else {
            // injected as a string
            $scope.slides.push( slideString(_slide.active, _slide.url, _slide.href_target, _slide.src) )
          }

          // Add an indicator dot if specified
          if (useDots && model.banners.length > 1) addIndicators(i, _active);
        }
        
        injectSlides();
      }
      
      // Injects slides onto the DOM.
      function injectSlides () {
        if (slideTemplate) {
          var _cpl = $compile(slideTemplate)($scope);
          targ.find('.carousel-inner').append(_cpl);
        } else {
          for (var s = 0; s < $scope.slides.length; s++) {
            targ.find('.carousel-inner').append($scope.slides[s]);
          }
        }
        
        // re-align cnTakeover if it appears on this page.
        bounceTakeover();
        
        // add left and right navigation arrows (if specified)
        if (useCtrls && model.banners.length > 1) {
          addCtrls(); 
          targ.carousel(); // start the carousel, weeeeee!
        }
      }
      
      var refreshImages = function() {
        img_src = getPictureUrl();
        $.each(targ.find('.item_img'), function (_i, _val) {
          $(this).attr('src', model.banners[_i][img_src]);
        });
        bounceTakeover();
      }
      
      // If this page uses cnTakeover, the takeover may need to
      // re-align itself after the first image is loaded.
      var bounceTakeover = function() {
        if (window.cnTakeover) {
          var _img = new Image();
          _img.src = model.banners[0][img_src];
          _img.onload = function() {
            window.cnTakeover.reset();
          }
        }
      }
      
      
      // ----------  Startup  ---------- //
      
      var init = (function() {
        img_src = getPictureUrl(); // make sure screen size it up to date
        getEndpoint();
      })();
      
    }]
  }
}]);