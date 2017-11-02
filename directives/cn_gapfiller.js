//  DOC: cnGapfiller
//  
//  Expands to fill the vertical space between two elements.
//  Useful for pages that don't have enough content to fill 
//  the window but a container div needs to extend down to
//  the footer.
//
//  USAGE:
//  <cn-gapfiller stopAt="footer"></cn-gapfiller>
//
//  NOTE:
//  Since <cn-gapfiller> is an element, it is affected by CSS (inline or external).
//  The <cn-gapfiller> element should remain a block level element to work properly.
//
//  OPTIONS:
//    stopAt : (string) jQuery selector for an element who's Y position should be used
//                      when calculating where the directive should expand to.

angular.module('cnGapfiller', []).directive('cnGapfiller', [function(){
  return {
    restrict: 'E',
    controller: ['$scope', '$element', '$attrs', '$document', function($scope, $element, $attrs, $document){
      
      // Check dependancies
      if (!window.jQuery) throw 'ERROR: cn-gapfiller requires jQuery';
      
      // Force CSS to "safe" defaults for this directive to work properly.
      $element.css({'display': 'block',
                    'height': '0px',
                    'padding-top': '0px',
                    'padding-bottom': '0px',
                    'margin-top': '0px',
                    'margin-bottom': '0px',
                   });
      
      // Calculate the difference between the element's Y position, and the stopper's Y position.
      // Then set the element's height accordingly to the difference.
      $scope.calcHeight = function() {
        $element.css({
          'height' : $($attrs.stopat).offset().top - $element.offset().top + 'px'
        });
      }
      
      $document.ready(function(){
        $scope.calcHeight();
      });
      
      // Recalculate if the window's dimensions change.
      $scope.$on('windowstate', function(e, args) {
        $scope.calcHeight();
      });
    }],
  }
}]);