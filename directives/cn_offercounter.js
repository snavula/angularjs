//  DOC: cnOffercounter
//  
//  Counts all of the offer tiles on a page, and caclulates the total discount
//  value based on each tile's data-discount attribute.
//
//  USAGE:
//  <div cn-offercounter=".offer_tile_class">
//    display data here
//  </div>
//
//  PARAMS:
//    cn-offercounter : (string) jQuery selector for, ideally a class name including the "."
//                      for which elements to include in the calculations
//
//  NOTE: Target elements MUST have a data-discount attribute, an error will be thrown if one does not.

angular.module('cnOffercounter', []).directive('cnOffercounter', [function() {
  return {
    restrict: 'A',
    controller: ['$scope', '$rootScope', '$attrs', function($scope, $rootScope, $attrs) {
      // Check dependancies
      if (!window.jQuery) throw 'ERROR: cn-offercounter requires jQuery.';
      
      // counts the number of DOM elements on the page that match the selector passed as this directive's value.
      $scope.count_offers = function() {
        $scope.offer_count = $($attrs.cnOffercounter + ':visible').length;
      }
      
      // Find total available points on the page
      // This is done by calculating a data-discount attribute on
      // each target offer tile.
      $scope.calc_total_points = function() {
        $scope.total_points = 0;
        angular.forEach( angular.element($attrs.cnOffercounter), function(_ele, _index){
          var $ele = angular.element(_ele);
          if (!$ele.attr('data-discount')) throw 'ERROR: cn-offercounter cannot count an offer tile with no data-discount attribute.'
          if ($ele.is(':visible')) {
            $scope.total_points += Number(angular.element(_ele).attr('data-discount'));
          }
        });
      }
      
      $scope.recalculate = function() {
        $scope.$apply(function() {
          $scope.calc_total_points();
          $scope.count_offers();
        });
      }
      
      $rootScope.$on('recount_offers', function(e, args) {
        $scope.recalculate();
      });
    }],
    link: function($scope) {
      $scope.count_offers();
      $scope.calc_total_points();
    }
  }
}]);