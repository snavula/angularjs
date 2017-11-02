//  DOC: cn-useragentcss
//
//  Applies a specified class to the directive's element based on the user agent
//  as set by the cn-useragent directive
//
//  USAGE:
//  <div cn-useragentcss="{
//                          Desktop : 'desktop_class', (CSS class) (Optional) CSS class for desktop user agents.
//                          iOS     : 'ios_class', (CSS class) (Optional) CSS class for iOS agents.
//                          Android : 'droid_class' (CSS class) (Optional) CSS class for android agents.
//                        }">
//  </div>

angular.module('cnUseragentcss', []).directive('cnUseragentcss', [function(){
  return {
    restrict: 'A',
    controller: ['$scope', '$rootScope', '$element', '$attrs', function($scope, $rootScope, $element, $attrs) {
      // Pull options from DOM
      $scope.opts = $scope.$eval($attrs.cnUseragentcss);
      
      // All values are optional, so set them to blank if they don't exist.
      if (!$scope.opts.Desktop) $scope.opts.Desktop = '';
      if (!$scope.opts.iOS) $scope.opts.iOS = '';
      if (!$scope.opts.Android) $scope.opts.Android = '';
      
      // Assign the appropriate class based on user agent.
      $scope.checkAgent = function() {
        var _ua = $rootScope.userAgent;
        if (_ua === "Desktop") {
          $scope.userAgent = $scope.opts.Desktop;
        } else if (_ua === 'iOS') {
          $scope.userAgent = $scope.opts.iOS;
        } else if (_ua === 'Android') {
          $scope.userAgent = $scope.opts.Android;
        }
      }
      
      // Ensures that userAgent updates only after cn-useragent has posted the data.
      $rootScope.$on('userAgent', function() {
        $scope.checkAgent();
      });
    }]
  }
}]);