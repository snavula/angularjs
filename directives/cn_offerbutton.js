angular.module('cnOfferbutton', []).directive('cnOfferbutton', [function() {
  return {
    restrict: 'A',
    controller: ['$scope', '$rootScope', '$element', '$attrs', function($scope, $rootScope, $element, $attrs) {
      $scope.data = $scope.$eval($attrs.cnOfferbutton);
      $scope.state = $scope.data.state;
      
      $scope.clipLock = false; // prevents user from sending multiple clip requests from the same offer
      
      // Publish clip event to $rootScope
      $scope.clip = function(e, _type) {
        if ($scope.clipLock == false) {
          $rootScope.$emit('clipEvent', {
            event_type  : _type,
            offer_id    : $scope.data.id,
            store_id    : $scope.data.store_id,
            retailer_id : $scope.data.retailer_id,
          });
        }
      }
      
      $rootScope.$on('clipResponse', function(e, args) {
        console.log('heard response');
        console.log(args);
        if ($scope.data.id == args.offer_id) {
          if (args.event_type == 'clip') {
            $scope.$apply(function() { // make sure Angular applies the change to the view
              $scope.state = 'clipped';
              $scope.clipLock = true;
            });
          } else if (args.event_type == 'unclip') {
            $scope.$apply(function() {
              $scope.state = 'unclipped';
            });
          }
          $rootScope.$emit('recount_offers'); // tell cn-offercounter to recalculate
        }
      });
      
      
    }]
  }
}]);