//  DOC: cn-cliphandler
//  
//  Handles all clip and unclip events.
//
//  Change Log:
//    v1.1
//      * Added dependancy checking.
//    v1.2
//      * Updated response handler to coincide with CCJP's code guidelines.
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

      // ----------  Setup  ---------- //

      // make sure the directive is only instantiated once to avoid multiple clip calls
      if (document.getElementsByTagName('cn-cliphandler').length > 1) throw 'ERROR: Found more than one instance of cn-cliphandler.';

      if (!$attrs.hasOwnProperty('clip')) throw 'ERROR: cn-cliphandler requires attribute: clip="<some endpoint>".';
      if (!$attrs.hasOwnProperty('unclip')) throw 'ERROR: cn-cliphandler requires attribute: unclip="<some endpoint>".';

      if ($attrs.hasOwnProperty('responseMap')) {
        var _rspMap = $scope.$eval($attrs.responseMap);
        console.log( _rspMap );
      }
      
      
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
        if (_resp.success == false) {
          throw 'ERROR: Snapp returned false.';
          return false;
        }
        if (_resp.message.success) {
          $scope.publishResponse(_args, _resp);
        } else {
          if (_resp.next == null || _resp.next == undefined) {
            if (_resp.message.hasOwnProperty('error')) throw 'ERROR: ' + _resp.message.error;
            if (_resp.message.hasOwnProperty('warning')) console.warn('WARNING: ' + _resp.message.warning);
            if (!_resp.message.hasOwnProperty('error') && !_resp.message.hasOwnProperty('warning')) {
              throw 'ERROR: Clip may have failed due to an application issue.';
            }
          } else {
            window.location = _resp.next;
          }
        }
      };
      
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