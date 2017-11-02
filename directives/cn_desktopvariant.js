//  ======================================================  //
//  ********************  DEPRICATED  ********************  //
//
//  Please use cn-useragentcss instead.
//
//  ======================================================  //
//
//  DOC: cn-desktopvariant
//
//  Adds a desktopvariant class to its element of cn-useragent assigns the 'Desktop'
//  value to $rootScope.userAgent.
//
//  USAGE:
//    <div cn-desktopvariant="desktop_class" ng-class="desktopvariant"></div>
//
//  cn-desktopvariant - (CSS class) (Required) A css class that is applied to the DOM element if a desktop user agent is detected.
//  ng-class="desktopvariant" - (Optional) Applies the variant class.  (We use an default Angular directive for speed and flexibility).
//                                         This could also be used with ng-bind etc. for various tasks.

angular.module('cnDesktopvariant', []).directive('cnDesktopvariant', [function(){
  return {
    restrict: 'A',
    controller: ['$scope', '$rootScope', '$attrs', function($scope, $rootScope, $attrs) {
      // Check dependancies
      if (!$rootScope.hasOwnProperty('userAgent')) throw 'ERROR: cn-desktopvariant could not find property "userAgent" on $rootScope.';
      if (!$attrs.cnDesktopvariant) throw 'ERROR: cn-desktopvariant requires a CSS class value';
      
      $scope.desktopvariant = $rootScope.userAgent == 'Desktop' ? $attrs.cnDesktopvariant : '';
    }]
  }
}]);