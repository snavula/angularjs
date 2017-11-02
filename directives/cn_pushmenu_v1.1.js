// DOC: cnPushMenu
//
// Assumes jQuery, since it's a requirement for Bootstrap
//
// CHANGE LOG
//   v1.1
//        * Added "save_scroll" option that saves the window's scroll position
//          when the menu is opened, and returns to that position when it is closed.
//
// USAGE:
// <div cn-pushmenu="{
//                    buttons     : '#close_btn, .open_btn', (Req) (jQuery) - Selectors for DOM elements that will toggle the menu.
//                    moves       : '#page, #header',        (Req) (jQuery) - Selectors for DOM elements that move when the menu is toggled.
//                    class       : 'open'                   (Req) (jQuery) - CSS class that gets applied to any element in the 'moves' selectors.
//                    save_scroll : true                     (Opt) (Boolean) - Saves the page's scroll position when the menu is opened.
//                                                                             Returns to that position when the menu is closed. 
//                   }">
//   <menu content here> 
// </div>
//
// NOTES:
//   Movement is controlled through CSS.  Use the "class" property on each element
//   to change that element when the menu should be open.
//   Example: #menu { left: 100%; }
//            #menu.open { left: 50%; }

angular.module('cnPushmenu', []).directive('cnPushmenu', [function(){
  return {
    restrict: 'A',
    scope: true,
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
      // Check dependancies
      if (!window.jQuery) throw 'ERROR: cn-pushmenu requires jQuery';
      
      // grab opts from DOM
      $scope.opts = $scope.$eval($attrs.cnPushmenu);
      
      if (!$scope.opts.hasOwnProperty('buttons')) throw 'ERROR: cn-pushmenu requires a "buttons" property.  (See souce code.)'
      if (!$scope.opts.hasOwnProperty('moves')) throw 'ERROR: cn-pushmenu requires a "moves" property.  (See source code.)'
      if (!$scope.opts.hasOwnProperty('class')) throw 'ERROR: cn-pushmenu requires a "class" property. (See source code.)'
      
      // store the state of the menu
      $scope.is_open = false;
      $scope.scrollTop = null;
      $scope.save_scroll = function () {
        $scope.scrollTop = $(window).scrollTop();
      }

      $scope.apply_scroll = function() {
        $(window).scrollTop( $scope.scrollTop );
      }

      // ---------- Menu Toggling ---------- //
      $scope.toggleMenu = function() {
        $($scope.opts.moves).toggleClass($scope.opts.class);
        $scope.is_open = !$scope.is_open;
        if ($scope.opts.hasOwnProperty('save_scroll')) {
          $scope.is_open ? $scope.save_scroll() : $scope.apply_scroll();
        }
      }
    }],
    link: function (scope, element, attrs) {
      $(scope.opts.buttons).on('click', function (e) { scope.toggleMenu() });
    },
  }
}]);