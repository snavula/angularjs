//  DOC: cn-cliphandler
//  
//  Handles all clip and unclip events.
//
//  USAGE:
//    <cn-cliphandler
//      cookie="basketcookie"
//      clip=""
//      unclip="" >
//    </cn-cliphandler>
//
//  Attributes:
//    cookie: (String) (Optional) the name of the cookie to update when a clip or unclip occurs.

angular.module('cnCliphandler', []).directive('cnCliphandler', [function() {
  return {
    restrict: 'E',
    controller: ['$scope', '$rootScope', '$attrs', function ($scope, $rootScope, $attrs) {
      
      // make sure the directive is only instantiated once to avoid multiple clip calls
      if (document.getElementsByTagName('cn-cliphandler').length > 1) throw 'ERROR: Found more than one instance of cn-cliphandler.';
      
      
      // Cookie Handling
      // set $scope.useCookie to false if it hasn't been set
      $scope.useCookie = $attrs.cookie !== undefined ? $attrs.cookie : false;
      
      // When a clip event is heard, make a post request with the relevant
      // information contained in the event.
      $rootScope.$on('clipEvent', function(event, args) {
        var _dest = args.event_type == 'clip' ? $attrs.clip : $attrs.unclip;
        $.post(_dest, args, function(resp) {
          $scope.handleResponse(args, resp); // pass this off to repsonse handler
        }, 'JSON');
      });
      
      $scope.handleResponse = function (_args, _resp) {
        if (_resp.success) {
          $scope.publishResponse(_args, _resp);
        } else {
          if (_resp.location == null) {
            throw 'ERROR: Clip failed due to API issue.';
          } else {
            window.location = _resp.location;
          }
        }
      }
      
      $scope.publishResponse = function(_args, _resp) {
        $rootScope.$emit('clipResponse', {
          offer_id   : _args.offer_id,
          event_type : _args.event_type,
          response   : _resp
        });
      }
    }]
  }
}]);