//  DOC: cnOfferFilterRouter
//  
//  Creates URL to to view filtered offers when a store or category is selected,
//  then redirects to that URL.
//
//  USAGE:
//  <div cn-offer-filter-router="{
//                                current_category: 0,
//                                current_store: 0,
//                               }">
//  </div>
//
//  PARAMS:
//    current_category : (Number) (Required) ID of the current category.
//    current_store    : (Number) (Required) ID of the current store.

angular.module('cnOfferFilterRouter', []).directive('cnOfferFilterRouter', [function(){
  return {
    restrict: 'A',
    controller: ['$scope', '$rootScope', '$attrs', function($scope, $rootScope, $attrs) {
      $scope.opts = $scope.$eval($attrs.cnOfferFilterRouter);
      
      $rootScope.$on('cnDropdown_event', function(event, args) {
        // Get the ID information from the event
        // We do this here because this directive is far less likely to be reused
        // than cn-dropdown, which has to be as flexible as possible when sending data.
        var _url = angular.element(args.element).attr('href');
        
        // Generate date for the cookie, if need
        if (args.role == 'stores') {
           var _date = new Date();
          _date.setTime(_date.getTime() + (3600*24*60*60*1000)); // ten years
          document.cookie = 'active_store=' + _url + '; expires=' + _date.toUTCString();
        }
        
        window.location = _url;
      });
    }]
  }
}]);