//  DOC: cn-basketcookie
//  
//  Manages the basket cookie and publishes it as an array to $rootScope
//  so that other directives can use it.
//
//  USAGE:
//    <cn-basketcookie use="true"></cn-basketcookie>
//
//    use="true" - (Boolean) true = use the cookie or create it if it doesn't exist.
//                           false = don't use the cookie and delete (e.g. if user logs out etc.)
//
//  NOTES:
//    The basketCookie object looks like:
//    $rootScope: {
//      basketCookie: {
//        is_new: true, // (Boolean) - flagged as true if the cookie is generated
//                                     on the current page view.
//        cookie: [12345, 67890] // (Array) - contains ID's of clipped offers
//      }
//    } // end $rootScope
//
angular.module('cnBasketcookie', []).directive('cnBasketcookie', [function(){
  return {
    restirct: 'E',
    controller: ['$scope', '$rootScope', '$attrs', function($scope, $rootScope, $attrs) {
      if (!$attrs.use) throw 'ERROR: cn-basketcookie requires a value of true or false.';
      if (document.getElementsByTagName('cn-basketcookie').length > 1) throw 'ERROR: More than one instance of <cn-basketcookie>.';
      
      // Create a basketCookie object on $rootScope in advance.  This needs to be done here so that
      // child objects can be added further down on this directive.
      $rootScope.basketCookie = {};
      
      
      // ----------  Utility Functions  ---------- //
      
      // if the basket cookie exists, returns it as an array.
      // else returns false
      $scope.getCookie = function() {
        var cookie = document.cookie.split(';');
        for (var i = 0; i < cookie.length; i++) {
          var c = cookie[i];
          while (c.charAt(0)== ' ') {
            c = c.substring(1);
          }
          if (c.indexOf('basket=') == 0) {
            return $scope.cleanCookie(c.substring('basket='.length, c.length).split(','));
          }
        }
       return false;
      }
      
      // Gets the basket cookie, checks it for a given offer id and adds or removes
      // the id, depending on the _mode.  Then updates the basket cookie accordingly.
      $scope.updateCookie = function(_id, _mode) { // rebuilds basket cookie from cookieArray
        var _co = $scope.getCookie();
        _id = _id.toString().trim(); // normalize element values
        if (_mode === 'add') {
          if (_co.indexOf(_id) < 0) _co.push(_id);
        } else if (_mode === 'remove' && _co.length) {
          if (_co.indexOf(_id) > -1) _co.splice(_co.indexOf(_id), 1);
        }
        document.cookie = 'basket=' + _co.toString() + '; path=/';
      }
      
      $scope.clearCookie = function() {
        document.cookie = "basket=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
      }
      
      // Remove empty indexes from a given array
      $scope.cleanCookie = function(a) {
        for (var i = 0; i < a.length; i++) {
          if (a[i] === '') a.splice(a.indexOf(i), 1);
        }
        return a;
      }
      
      
      // ----------  Event Handling  ---------- //
      
      // Fired from cn-offertile, ensures that if the back end renders an offer as clipped,
      // the basket cookie will be updated to include that offer's ID.
      $rootScope.$on('register_preclipped_offer', function(evt, args) {
        $scope.updateCookie(args.id, 'add');
      });
      
      
      // Update the basket cookie whenever a clip or unclip occurs.
      $rootScope.$on('clipResponse', function(evt, args) {
        if (args.event_type == 'clip') {
          $scope.updateCookie(args.offer_id, 'add');
        } else if (args.event_type == 'unclip') {
          $scope.updateCookie(args.offer_id, 'remove');
        }
      });
      
      
      // ---------  Instantiation  --------- //
      
      $scope.setup = function() {
        if ($attrs.use == false) {
          $scope.clearCookie(); // clear the cookie so that it doesn't persist between logout and login
        } else {
          // Make the basket cookie available on $rootScope in the form of an array.
          // cn-offertile directives can compare their ID's to those in the cookie and force
          // themselves to clipped status if needed.  This circumvents a possible caching issue
          // on the server side.
          if ($scope.getCookie() == false) { // if the cookie doesn't exist, create it and flag it as new
            $scope.basketCookie.is_new = true;
            document.cookie = 'basket=; path=/';
          } else {
            $scope.basketCookie.is_new = false;
          }
          $rootScope.basketCookie.cookie = $scope.getCookie();
        }
      }
    }],
    link: function($scope) {
      $scope.setup();
    }
  }
}]);