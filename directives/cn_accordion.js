// DOC: cn-accordion
//
// Turns a nested, unordered list into an accordion style UI widget.
// * Accordions are also nestable
//
// Usage: <ul cn-accordion="{
//                            trigger : 'span' // Required (jQuery Selector) - opens/closes the accordion element when clicked.
//                            speed   : 150    // Optional (Num) - Speed of the accordion animation in milleseconds, default is 300.
//                            default : '.trigger.default' // Optional (jQuery Selector) - Selector for a defualt accordion node.
//                                                            //                           (MUST target the trigger element.)
//                          }">
//          <li>
//            <span>Item 1's Trigger/Title Element</span>
//            <ul>
//              <li>Child Item</li>
//              <li>Child Item</li>
//              <li>Child Item</li>
//            </ul>
//          </li>
//          <li>
//            <span>Item 2's Trigger/Title Element</span>
//            <ul>
//              <li>Child Item</li>
//              <li>Child Item</li>
//            </ul>
//          </li>
//        </ul>

angular.module('cnAccordion', []).directive('cnAccordion', [function() {
  return {
    restrict: 'A',
    scope: {},
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
      
      // Check dependancies
      if (!window.jQuery) throw 'ERROR: cn-accordion requires jQuery.';
      
      // Pull options from DOM node.
      $scope.opts = $scope.$eval($attrs.cnAccordion);
      
      // If no default node was specified (all accordions should be closed), set default to false.
      if (!$scope.opts.hasOwnProperty('default')) $scope.opts.default = false;
      
      // Make sure a "trigger" element is specified so users can interact with the accordion
      // This is dynamic in case devs need to use links, H tags, etc. as triggers.
      if ($scope.opts !== undefined && $scope.opts.hasOwnProperty('trigger')) {
        $scope.trigger = $scope.opts.trigger;
      } else {
        throw 'ERROR: cn-accordion requires a trigger element to be specified.'
      }
      
      // Set animation speed (defualt is 300ms).
      $scope.speed = $scope.opts !== undefined && $scope.opts.hasOwnProperty('speed') ? $scope.opts.speed : 300;
      
      // Check if this widget is nested within another cn-accordion directive
      // Make sure the parent directive displays properly when this directive is interacted with.
      var nested = $element.parent().parent().attr('cn-accordion'); // since jQuery doesn't have a 'hasAttr' function
      if (typeof nested !== typeof undefined && nested !== false) $scope.nested = true;
      
      $scope.toggleItem = function( $targ ) {
        // Closes old items and open new ones simultaniously
        // Better UX than a for loop
        $.each($element.children('li').children('ul'), function (index, value) {
          var $value = $(value);
          if ($targ.is(value) && ($value.siblings($scope.trigger).attr('data-open') == 'false')) {
            // console.log('open');
            $scope.openItem($value); // Since jQuery doesn't allow you to animate to an "auto" pixel value
            $value.siblings($scope.trigger).attr('data-open', true);
          } else {
            $value.animate({'height': '0em'}, $scope.speed);
            $value.siblings($scope.trigger).attr('data-open', false);
          }
        });
        
        // make sure the opened item is visible in case of a nested accordion
        if ($scope.nested !== undefined) $element.css({'height':'auto'});
      }
      
      // Animate $value's height to 'auto' by capturing auto as an explicit pixel value
      // We use this method so to ensure that nested accordion widgets display properly
      $scope.openItem = function(_targ) {
        // (This block should happen too fast for the user to see.)
        var current = _targ.height() + 'px'; // store $value's current height
        _targ.css({'height': 'auto'}); // snap $value's height to auto
        var auto = _targ.height() + 'px'; // store $value's 'auto' height in pixels
        _targ.css({'height': current}); // snap $value back to its original height
        
        _targ.animate({'height': auto}, $scope.speed); // animate $value to the stored auto height (wooooo)
      }
      
      // Open a default accordion item if one is specified.
      $scope.defaultLock = false; // prevent this function from being called more than once on link.
      $scope.openDefault = function() {
        if ($scope.defaultLock == false) {
          $scope.defaultLock = true;
          var $default = $($scope.opts.default);
          $scope.openItem($default.siblings('ul'));
          $default.attr('data-open', true);
        }
      }
      
    }],
    link: function($scope, $element) {
      // Setup
      $.each($element.children('li'), function(index, value) {
        var $this  = $(this);
        var $ul    = $this.children('ul');
        var $trigger = $($scope.trigger);
        
        $ul.css({ // set the list's height to 0 and hide any overflow. (Height is animated to show and hide the list.)
          'height': '0em', 
          'overflow-y': 'hidden'
        });
        
        // bind click event to each list's "title" element
        $this.children( $scope.trigger ).on('click', function(e) {
          e.preventDefault();
          $scope.toggleItem($ul);
        });
        
        if ($scope.opts.default != false) {
          $.each($trigger, function(index, value) {
            if (!$(this).is($scope.opts.default)) $(this).attr('data-open', false);
          });
          $scope.openDefault();
        } else {
          $trigger.attr('data-open', false);
        }
      });
    }
  }
}]);