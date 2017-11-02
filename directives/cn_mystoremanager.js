// DOC: cn-mystoremanager
//
// * 
//
// Usage: <ul cn-mystore-manager="{    
//                            store_selector: '.mystores_store' // jQuery selector for store element.  Used to
//                                                                 track how many stores are in each retailer.
//                            notAllowed_error: 'not allowed'   // String for the error meesage that displays when
//                                                                 a user isn't allowed to delete the store.
//                          }">
//        </ul>
angular.module('cnMystoreManager', []).directive('cnMystoreManager', [function () {
  return {
    restrict: 'A',
    scope: true,
    controller: ['$scope', '$element', '$attrs', '$http', function ($scope, $element, $attrs, $http) {
      // Check dependancies
      if (!window.jQuery) throw 'ERROR: cn-mystore-manager requires jQuery.';
      
      // Pull options from the DOM
      $scope.opts = $scope.$eval($attrs.cnMystoreManager);
      
      //Trigger click event to delete store
      $scope.deleteStore = function (_storeId) {
        var storeCount = $element.find($scope.opts.store_selector).length;
        // make sure more than one store exists (user can't delete the last store for a retailer)
        storeCount > 1 ? $scope.deleteStoreByAjaxCall(_storeId) : alert($scope.opts.notAllowed_error);
      }
      
      $scope.lock = false; // prevent deleting additional stores during the ajax call
      
      $scope.deleteStoreByAjaxCall = function (_storeId) {
        // var cnf_del = window.confirm('Are you sure you want to delete the store?');
        
        // if (cnf_del) {
          // Making ajax call with param store_id to delete the store 
        if (!$scope.lock) {
          $scope.lock = true;
          $.post('/cwajax/remove_favorite_store', { store_id: _storeId }, function (response) {
            if (response.success) {
              location.reload();
            } else {
              alert("Store was not deteled successfully.");
              $scope.lock = false;
            }
          }, 'json');
        }
        // }
      }
    }]
  }
}]);