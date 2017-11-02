// DOC: cn-showforagent
//
// Hides its elemenet and only shows it if $rootScope.userAgent matches one of its options.
//
// USAGE: <element cn-showformobile="['iOS', 'Desktop']">
//
// AVAILABLE OPTIONS: 'iOS', 'Android', 'Desktop' (Should be in an array, even if only one option is used.)
  
  
angular.module('cnShowforagent', []).directive('cnShowforagent', ['$rootScope', function() {
  return {
    restrict: 'A',
    scope: {
      opts: '=cnShowforagent'
    },
    controller: ['$scope', '$rootScope', '$element', '$attrs', function($scope, $rootScope, $element, $attrs) {
      $element.hide(); // make sure the element is hidden to start
      $scope.ua = $rootScope.userAgent.toLowerCase();
      
      // Iterate through this directive's options.
      // If a match is found, show the element and stop the loop.
      function checkOpts() {
        for (var i = 0; i < $scope.opts.length; i++) {
          if ($scope.opts[i].toLowerCase() == $scope.ua) {
            $element.show();
            return false;
          }
        }
      }
      checkOpts();
    }]
  }
}]);