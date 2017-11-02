// DOC: cn-basketcounter
//
// Displays the number of offers in the basket (based on the element's "count" attribute) and listens 
// for clip and unclip events, adding or subtracting from that number.
//
// USAGE:
//  <span cn-basketcounter count=12 ng-bind="count"></span>
//
// count - (Num) (Optional) Base number to start from.
// ng-bind="count" - (Required) Ensures the count updates on clip events
//
angular.module('cnBasketcounter', []).directive('cnBasketcounter', [function(){
  return {
    restrict: 'A',
    scope: true,
    controller: ['$scope', '$rootScope', '$attrs', function($scope, $rootScope, $attrs) {
      $scope.count = $attrs.hasOwnProperty('count') ? $attrs.count : 0;
      
      // Check for a basket cookie, if it exists, use it for the count instead.
      // SEE cn-basketcookie (cn_basketcookie.js)
      $scope.checkCookie = function() {
        if ($rootScope.hasOwnProperty('basketCookie')) {
          // If the cookie was created on this page view, don't rely on it for
          // counting offers in the basket.
          if ($rootScope.basketCookie.is_new == false) {
            $scope.count = $rootScope.basketCookie.cookie.length;
          }
        }
      }
      
      $rootScope.$on('clipResponse', function(event, args) {
        $scope.$apply(function() {
          if (args.event_type == 'clip') {
            $scope.count ++;
          } else if (args.event_type == 'unclip') {
            $scope.count --;  
          }
        });
      });
    }],
    link: function($scope) {
      $scope.checkCookie();
    }
  }
}]);