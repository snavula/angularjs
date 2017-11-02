// DOC: cnDropdown
//
// Extends Bootstrap's dropdown functionality by switching the button's content with that
// of the selected item.  Also supports icons, assuming they're just image tags with different
// src attributes.
//
// v1.1 Changes:
//    * Added regex to remove trailing number "(8)" from the end of title text.
//
// v1.2 Changes:
//    * Removed regex for trailing number "(8)" at the end of title text because it breaks in Japanese.
//    * Improved usage example.
//    * Added dependency checking.
//    * Add positioning support for when content extends onto multiple lines.
//
// USAGE:
//  <div class="dropdown" 
//       cn-dropdown="{
//                     role: 'stores',
//                     title_text: '#filters_retailers_title',
//                     title_icon: null,
//                     li_trigger: 'a',
//                     li_text: '.dropdown_title',
//                     li_icon: null, 
//                    }">
//
//    <button class="dropdown-toggle" data-toggle="dropdown">
//      <span id="filters_retailers_title" class="dropdown_title">Current Store</span>
//      <span class="dropdown_caret"></span>
//    </button>
//
//    <ul class="dropdown-menu">
//      <?php foreach($stores as $index => $store): ?>
//      <li class="<?php echo $index == 0 ? 'default' : '' ?>">
//        <a href="#">
//          <span class="dropdown_title"><?php echo $store['name']; ?></span>
//        </a>
//      </li>
//      <?php endforeach ?>
//    </ul>
//  </div>
//
// options {}
//   role            : (String) (Optional) the role of the dropdown, sent with click information on rootScope so other directives know where
//                     the event originated from.
//   prevent_default : (Boolean) (Optional) if the directive should prevent default click events and handle them instead by publishing
//                     the event on $rootScope.  (Default is true)  This allows use of regular links in the dropdown.
//   title_text      : (jQuery selector) (Required) the element containing the dropdown's title text (what the user sees before opening the dropdown)
//   title_icon      : (jQuery selector) (Optional) the icon for the currently selected dropdown item, usually displays next to title text.
//   li_trigger      : (jQuery selector) (Required) the element that actually triggers a change in the dropdowm list.  In this case a link tag.
//   li_text         : (jQuery selector) (Required) the element containing the text to pass to the title button
//   li_icon         : (jQuery selector) (Optional) the list item's icon (image tag).  The source attr will be passed to the title button.
//
// additional options:
//   * One item in the dropdown list can have a .default class.  This will render the item as selected by default.
//   * Selected items, including the defualt item, are giiven a .selected class.  This class is removed when the item
//     is no longer selected.

angular.module('cnDropdown', []).directive('cnDropdown', [function() {
  return {
    restrict: 'A',
    scope: true,
    controller: ['$scope', '$element', '$attrs', '$rootScope', function($scope, $element, $attrs, $rootScope) {
      $scope.opts = $scope.$eval($attrs.cnDropdown);

      // Check dependencies

      if (!$scope.opts.hasOwnProperty('title_text')) throw 'ERROR: cn_dropdown requires a title_text param.';
      if (!$scope.opts.hasOwnProperty('li_trigger')) throw 'ERROR: cn_dropdown requires a "li_trigger" param.';
      if (!$scope.opts.hasOwnProperty('li_text')) throw 'ERROR: cn_dropdown requires a "li_text" param.';
      
      // If one of the items in the drop
      $scope.setDefault = function() {
        var _default = $element.find('.default');
        if (_default.lemgth <= 0) { // OK if no default value specified
          return false;
        } else if (_default.length == 1) {
          $scope.switchTitle(_default);
        } else if (_default.length > 1) {
          throw 'ERROR: cn-dropdown has more than one item with class ".default".'
        }
        $scope.positionMenu();
      }
      
      // Switches the title button's text and icon.
      $scope.switchTitle = function(_link) {
        $element.find('.selected').removeClass('selected');
        _link.addClass('selected');
        angular.element($scope.opts.title_text).text( _link.find($scope.opts.li_text).text() );
        angular.element($scope.opts.title_icon).attr('src', _link.find($scope.opts.li_icon).attr('src') );
        $scope.positionMenu();
      }
      
      // Publish selection on $rootScope so it can be responded to by other directives
      $scope.publishSelect = function(_link){
        $rootScope.$emit('cnDropdown_event', {role    : $scope.opts.role, 
                                              element : _link});
      }

      // Position the "menu" part of the dropdown menu.
      // This overrides Bootstrap to add support for when
      // the dropdown button needs to expand due to long content.
      $scope.positionMenu = function() {
        var _menu = $( $element.find('.dropdown-menu') );
        var _button = $( $element.find('.dropdown-toggle') );
        $(_menu).css({
          'top' : $(_button).outerHeight(),
          'width' : $(_button).outerWidth()
        });
      }

      // Reposition the menu if the window size changes
      $rootScope.$on('windowstate', function(event, data) {
        if (data.type == 'resize') {
          $scope.positionMenu();
        }
      });
      
    }],
    link: function($scope, $element) {
      // Bind a click handler to the trigger elements
      $element.find($scope.opts.li_trigger).on('click', function(e) {
        if ($scope.opts.prevent_default) e.preventDefault();
        $scope.switchTitle($(this).parent());
        $scope.publishSelect($(this));
      });
      
      $scope.setDefault();
    }
  }
}]);