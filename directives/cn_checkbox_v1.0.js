// DOC: cn-checkbox
//
// Since checkboxes can't be styled, a common approach is to style the <label> for the checkbox
// instead.  This directive handles interactivity for this type of setup.
// * Expects css classes for the checked and unchecked state of the box.  These will be attached to the label.
//
// Usage: 
//   <label cn-checkbox="{
//                        checked   : 'checkbox_checked',  // (Required) : css class for the checked state
//                        unchecked : 'checkbox_unchecked' // (Required) : css class for the unchecked state
//                        sprite    : 'checkbox_sprite'    // (Required) : jQuery selector for the DOM element that will act as the checkbox's sprite
//                      }">
//     <input type="checkbox"> Label text
//   </label>

angular.module('cnCheckbox', []).directive('cnCheckbox', [function() {
  return {
    restrict: 'A',
    scope: {
      opts: '=cnCheckbox'
    },
    controller: ['$scope', '$element', function($scope, $element) {
      
      // Check dependancies
      if (!window.jQuery) throw 'ERROR: cn-checkbox requires jQuery.';
      
      if (!$scope.opts.hasOwnProperty('checked') || !$scope.opts.hasOwnProperty('unchecked')) throw 'ERROR: cn-checkbox is missing either "checked" or "unchecked" property.';
      
      // Setup
      var $checked = $scope.opts.checked;
      var $unchecked = $scope.opts.unchecked;
      var $box = $element.children('input:first');
      var $sprite = $($scope.opts.sprite);
      
      $box.css({'opacity' : '0', 
                'width'   : '0', 
                'height'  : '0',
                'padding' : '0',
                'margin'  : '0'
               });
      $element.css({'cursor' : 'pointer'});
      
      // Interactivity
      $box.on('click', function(e){
        $scope.toggleChecked();
      });
      
      $scope.toggleChecked = function() {
        if ($box.prop('checked')) {
          $sprite.removeClass($unchecked).addClass($checked);
        } else {
          $sprite.removeClass($checked).addClass($unchecked);
        }
      }
      
      $scope.toggleChecked();
    }]
  }
}]);