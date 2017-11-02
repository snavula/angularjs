// DOC: cn-basketdiscount
//
// Displays the total discount representing the sum of each offer on the page.
// Responds to unclip events by subtracting the value of the offer id listed in
// in the event.
//
// NOTE:  This version is set up for points, not currency.
//
// TODO:  Decouple this from the DOM
//
// USAGE:
//  <span cn-basketdiscount discount="150" ng-bind="discount"></span>
//
// discount - (Num) (Optional) Base number to start from.
// ng-bind="discount" - (Required) Ensures the discount value updates on clip events

angular.module('cnBasketdiscount', []).directive('cnBasketdiscount', [function(){
  return {
    restrict: 'A',
    scope: true,
    controller: ['$scope', '$rootScope', '$attrs', function($scope, $rootScope, $attrs) {
      $scope.discount = $attrs.hasOwnProperty('discount') ? $attrs.discount : 0; 

      $scope.getDiscountTotal = function() {
        $('.offer_tile').each(function(index, ele) {
          $scope.discount += $(ele).data('discount');
        });
      }

      $scope.subtractFromTotal = function( _offer_id ) {
        $scope.discount -= $('#offer_tile_' + _offer_id ).data('discount');
      }

      $rootScope.$on('clipResponse', function(event, args) {
        if (args.event_type == "unclip" && args.response.message.success == true) {
          $scope.$apply(function() {    
            $scope.subtractFromTotal( args.offer_id );
          });
        }
      });

    }],
    link: function($scope) {
      $scope.getDiscountTotal();
    }
  }
}]);