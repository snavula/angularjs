//	DOC: cnStoreSeach
//	
//	Front-end logic for searching for stores,
//	Initially used on CCJP.
//
//	USAGE:
//		<div cn-store-search="{
//			endpoint: '/ajax/store_search', - (string) (req) : Destination for which to send the ajax request to search for stores 
//			per_page: 10, - (num) (opt) : Number of results to display per request, defaults to 5
//			pages: 2, - (num) (opt) : Maximum pages that can be displayed by additional requesys. defaults to 100
//		}">
//
//	NOTES:
//		* In the example above, the widget would display 10 results per request across a maximum of 2 pages. So the user would
//			see a total of 20 results.  (10 results * 2 pages)

angular.module('cnStoreSearch', []).directive('cnStoreSearch', [function(){
	return {
		restrict: 'A',
		controller: ['$scope', '$rootScope', '$element', '$attrs', function($scope, $rootScope, $element, $attrs) {

			// ----------  Setup  ---------- //

			//	Check dependencoes
			if (!window.jQuery) throw 'ERROR: cn-store-search requires jQuery';

			var _opts = $scope.$eval($attrs.cnStoreSearch);
			if (!_opts.hasOwnProperty('endpoint')) throw 'ERROR: cn-store-search requires an endpoint from which to get stores results.';

			if (!_opts.hasOwnProperty('per_page')) _opts.per_page = 5;
			if (!_opts.hasOwnProperty('pages')) _opts.pages = 100;

			//	Holds data for the selected store.
			//	This hash may be represented several times on the view.
			$scope.selected = {
				store_id: null,
				retailer_id: null
			};

			//	Make an identical copy of $scope.selected on $rootScope so that
			//	it can be accessed outside of this directive if need be.
			$rootScope.storeSearch = {};
			$rootScope.storeSearch.selected = $scope.selected;
			// This needs to be a boolean so it can be used by
			// ng-disabled on the view.
			$rootScope.storeSearch.needs_selection = true;

			//	State of the directive: 
			//		'inactive'     - no search has been run 
			//		'loading'      - search has been run, awaiting response from back-end
			//		'loadingMore'	 - requesting additional store results from the back-end
			//		'returned' 		 - search has been run, displaying results
			//		'limitReached' - the maximum number of pages has been reached
			$scope.state = 'inactive';

			$scope.search_query = ''; //	The query being passed for the search.

			$scope.results = []; // Array of store results

			var _per_page = _opts.per_page; // Number of results per page
			$scope.currentPage = 0; // Which page is being displayed
			$scope.maxPages = _opts.pages; // Max number of pages


			// ----------  Data Management  ---------- //

			// Reset selection data to its default values
			var _clearSelection = function () {
				$scope.currentPage = 0;
				$scope.results = [];
				$scope.selected.store_id = null;
				$scope.selected.retailer_id = null;

				// Update $rootScope as well
				$rootScope.storeSearch.selected = $scope.selected;
				$rootScope.storeSearch.needs_selection = true;
			}

			// Update $scope and $rootScope with the values of the selected
			// search result.  We do this from the controller so that changes
			// can take place on $rootScope as well.
			$scope.updateSelected = function ( _store_id, _retailer_id ) {
				$scope.selected.store_id = _store_id;
				$scope.selected.retailer_id = _retailer_id;

				$rootScope.storeSearch.selected.store_id = _store_id;
				$rootScope.storeSearch.selected.retailer_id = _retailer_id;
				$rootScope.storeSearch.needs_selection = false;
			} 

			// Gathers data that will be included with the AJAX request.
			var _assembleRequestData = function () {
				return {
					search_text: $scope.search_query,
					page: $scope.currentPage,
					per_page: _per_page + 1 // request an addititional store to test if there are more pages available
				}
			}


			// ----------  Store Request  ---------- //

			// Starts the store request.  If _reset, clear any old
			// data because the user is requesting stores from a new
			// location
			$scope.getStores = function (e, _newLocation) {
				e.preventDefault();
				if ($scope.search_query) {
					if (_newLocation) _clearSelection();
					$scope.currentPage ++;
					_requestStores( _newLocation );
				}
			}

			// Makes the actual request and modifies the state of the widget accordingly
			var _requestStores = function ( _newLocation ) {
				_newLocation == true ? $scope.state = 'loading' : $scope.state = 'loadingMore';
				$.post(_opts.endpoint, _assembleRequestData(), function (resp) {
					if (resp.success) {
						// Check if we got more results than the _per_page setting
						var _hasMorePages = resp.result.length > _per_page ? true : false;
						// If we did, remove the last result so we don't display it
						if ( _hasMorePages ) resp.result = resp.result.slice(0, resp.result.length - 1);
						
						$scope.$apply(function() {
							$scope.currentPage < $scope.maxPages && _hasMorePages ? $scope.state = 'returned' : $scope.state = 'returned limitReached';
							$scope.results = $scope.results.concat(resp.result);
						});
					} else {
						$scope.$apply(function() {
							$scope.state = 'returned limitReached';
						});
					}
				}, 'JSON');
			}

		}]
	}
}]);