//  DOC: cn-offer-tile
//  
//  Adds interactivity to offer tiles, fires clip events etc.
//
//  This directive keeps strict separation between the view and
//  the controller.  ng-class="tile_state" can be used to dynamically
//  assign and remove classes for clipped status and when the thumbnail
//  image has finished loading.
//
//  Usage:
//    <div cn-offer-tile="{
//                          id: <?php echo $tileData->id; ?>,
//                          store_id: 12345,
//                          retailer_id: 67,
//                          reward_id: 12,
//                          image_thumb: '<?php echo $tileData->picture_url; ?>',
//                          signed_in: false,
//                          in_basket: false,
//                          classes: {
//                            desktop_variant : 'desktop',
//                            tile_clipped    : 'offer_tile_clipped',
//                            tile_unclipped  : 'offer_tile_removed',
//                            image_loaded    : 'offer_tile_img_loaded'
//                          }
//                        }">
//
//  Params:
//    NOTE:  ID's are sent to the back-end.  Not all ID's are used for every API call, so they
//           can be junk data depending on what the API needs or doesn't need.
//
//    id: (num) (required) - id for this offer, used when emitting clip event.
//    store_id: (num) - store id for this offer, used on clip event.
//    retailer_id: (num) - retailer id, used on clip event.
//    reward_id: (num) - reward id for this offer, used on clip event.
//    
//    in_basket: (bookean) (required if site uses a basket cookie) - if this offer is in the basket.
//                         * used to synchronize a basket cookie is one is being used.
//
//    image_thumb: (url) - image for the offer, loaded asynchronously.
//    signed_in: (boolean) (required) - if the tile is displayed for an anonymous user (who can't clip).
//    
//    Note:  CSS classes are optional.  They are placed on the view using ng-class="tile_state"
//           for user feedback.
//
//    desktop_variant: (css class) (optional) - assigned to the offer if a special class
//                     is used for desktop versions of this tile.
//    tile_clipped: (css class) (optional) - assigned using ng-class when the offer is clipped.
//    image_loaded: (css class) assigned using ng-class when the thumbnail image has finished
//                  loading.

var cnOfferTile = angular.module('cnOfferTile', []).directive('cnOfferTile', [function(){
  return {
    restrict: 'A',
    scope: true,
    controller: ['$scope', '$rootScope', '$attrs', '$http', function($scope, $rootScope, $attrs, $http) {
      
      // Import data
      $scope.data = $scope.$eval($attrs.cnOfferTile);
      
      
      // ----------  Display Handling  ---------- //
      
      // Add a css class for the desktop variant if one exists
      // If not, or if the user agent isn't for desktop, set
      // the desktop variant to an empty string so to avoid
      // unnecessary conditionals later in this directive.
      // $rootScope.isDesktop is set by the cn_useragent directive
      if ($scope.data.classes.hasOwnProperty('desktop_variant') && $rootScope.isDesktop) {
        $scope.tile_state = $scope.data.classes.desktop_variant;
      } else {
        $scope.data.classes.desktop_variant = '';
      }
      
      // Force the tile into clipped or unclipped state.  This is an aesthetic change only
      $scope.force_display = function( _clipped ) {
        if (_clipped) {
          $scope.tile_state = $scope.data.classes.tile_clipped + ' ' + $scope.data.classes.desktop_variant;
          $scope.clipLock = true;
        } else {
          $scope.tile_state = $scope.data.classes.desktop_variant;
          $scope.clipLock = false;
        }
      }     
      
      // Check if tile should be displayed in clipped status by default.
      if ($scope.data.hasOwnProperty('in_basket') && $scope.data.in_basket == true) {
        $scope.force_display(true);
      } 

      
      // ----------  Image Management  ---------- //
      
      // Since the image is the most expensive piece
      // of the offer, delay loading it.  When it's
      // time to load, we pre-cache it, then fade it
      // in with css.
      
      var _img = new Image();
      
      $scope.precache_image = function(){ // load the image source
        _img.src = $scope.data.image_thumb;
      }
      
      _img.onload = function(){ // when the image is cached, apply it to the DOM and fade it in
        $scope.$apply(function(){ // the change wont be seen without $apply()
          $scope.image_thumb = $scope.data.image_thumb;
          $scope.image_state = $scope.data.classes.image_loaded; // fade in the image (animation is with css)
        });
      }
      
      
      // ----------  Clipping  ---------- //
      
      $scope.clipLock = false; // prevents user from sending multiple clip requests from the same offer
      
      // Publish clip event to $rootScope
      $scope.clip = function(e, _type) { // (Optional) third argument "force" will fire the clip event regardless of clipLock
        if ($scope.clipLock == false || arguments[2] === 'force') {
          $rootScope.$emit('clipEvent', {
            event_type  : _type,
            offer_id    : $scope.data.id,
            store_id    : $scope.data.store_id,
            retailer_id : $scope.data.retailer_id,
            reward_id   : $scope.data.reward_id
          });
        }
      }
      
      // Handle clip response (this is emitted form cn-cliphandler)
      $rootScope.$on('clipResponse', function(e, args) {
        // if this instance of cn-offertile sent the original clip
        if ($scope.data.id == args.offer_id) {
          if (args.event_type == 'clip') {
            $scope.$apply(function() { // make sure Angular applies the change to the view
              $scope.tile_state = $scope.data.classes.tile_clipped + ' ' + $scope.data.classes.desktop_variant;
              $scope.clipLock = true;
            });
          } else if (args.event_type == 'unclip') {
            $scope.$apply(function() {
              $scope.tile_state = $scope.data.classes.tile_unclipped + ' ' + $scope.data.classes.desktop_variant;
            });
          }
          $rootScope.$emit('recount_offers'); // tell cn-offercounter to recalculate
        }
      });
      
      
      // ----------  Cookie Handling  ---------- //
      //
      // SEE: cn-basketcookie (cn_basketcookie.js)
      //
      // If $rootScope has a property called "basketCookie" (implying there's a cookie containing clipped offer ID's), 
      // the tile will reference the the cookie to display itself as clipped or inclipped.  This will override how the
      // back-end rendered the tile.
      // NOTE:  This is an aesthetic change only, offers are NOT programmatically clipped or unclipped.
      $scope.checkBasketCookie = function() {
        if ($rootScope.hasOwnProperty('basketCookie')) {
          // If the cookie was created on this page view, it can't be trusted to accurately
          // reflect the basket, so only use the basket cookie if it existed before this page view.
          if ($rootScope.basketCookie.is_new == false) {
            if ($rootScope.basketCookie.cookie.indexOf($scope.data.id.toString()) > -1) {
              $scope.force_display(true);
            } else {
              $scope.force_display(false);
            }
          } else {
            // if the basket cookie is new and the DOM says this offer is clipped,
            // register this offer's id with the newly created basket cookie.
            if ($scope.data.in_basket) {
              $rootScope.$emit('register_preclipped_offer', {id: $scope.data.id});
            }
          }
        }
      }
      
    }],
    link: function ($scope) {
      $scope.precache_image();
      $scope.checkBasketCookie();
    }
  }
}]);