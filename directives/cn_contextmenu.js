//  DOC: cn-contextmenu
//
//  Defines a button DOM elemenr and a menu DOM element.
//  When the button item is clicked, a css class is applied to the menu item.
//  This can be used to show/hide the menu item conditionally.  Clicking outside
//  of the menu item will remove the css class.
//
//  USAGE:
//    <div cn-contextmenu="{
//                          button: '#myButton', (Required) (jQuery) Selector for the button element(s)
//                          menu: '#myMenu', (Required) (jQuery) Selector for the meny element
//                          open: 'open_css_class', (Required) (CSS class) Class applied to the menu when button is clicked.
//                          noclick: '.dont_close' (Optional) (jQuery) jQuery selector(s) for elements that should not close
//                                                                     close the menu when clicked.
//                         }">
//      <button id="myButton"></button>
//      <button class="dont_close"></button>
//      <div id="contextMenu">
//        Menu content
//      </div>
//    </div>
//
angular.module('cnContextmenu', []).directive('cnContextmenu', [function(){
  return {
    restrict: 'A',
    controller: ['$scope', '$rootScope', '$attrs', function($scope, $rootScope, $attrs) {
      // check dependancies
      if (!window.jQuery) throw 'ERROR: cn-contextmenu requires jQuery.';
      
      // pull options from DOM
      $scope.opts = $scope.$eval($attrs.cnContextmenu);
      
      if (!$scope.opts.hasOwnProperty('button')) throw 'ERROR: cn-contextmenu has no button element defined.'
      if (!$scope.opts.hasOwnProperty('menu')) throw 'ERROR: cn-contextmenu has no menu element defined.'
      if (!$scope.opts.hasOwnProperty('open')) throw 'ERROR: cn-contextmenu has no "open" css class defined.'
      if (!$scope.opts.hasOwnProperty('noclick')) $scope.opts.noclick = '';
      
      $scope.bindClickHandlers = function() {
        var _menu = $($scope.opts.menu);
        var _open = $scope.opts.open;
        
        // Subclass the click events and always unbind before binding them again.  This prevents
        // redundant click binds from jQuery and ensures that $(window) doesn't have a click handler
        // when it doesn't need one.
        $($scope.opts.button).unbind('click.cncontextmenu').on('click.cncontenxtmenu', function(e) {
          e.preventDefault();
          if (!_menu.hasClass(_open)) {
            // add a css class to display the meny as open and fire a custom event that can be used
            // in javascript
            _menu.addClass(_open).trigger('cncontextmenu_open');
            $(window).unbind('click.cncontextmenu').on('click.cncontextmenu', function(e) {
              // TODO: optimize this
              if (!$(e.target).closest(_menu).length && // anything outside of the menu item
                  !$(e.target).closest($($scope.opts.button)).length && // the button toggles the class anyway
                  !$(e.target).is($scope.opts.noclick) // anything matching the noclick selectors
                 ) {
                _menu.removeClass(_open);
              }
            });
          } else {
            _menu.removeClass(_open);
            $(window).unbind('click.cncontextmenu');
          }
        });
      }
    }],
    link: function($scope) {
      $scope.bindClickHandlers();
    }
  }
}]);