//	DOC: cnFileExists
//
//	Validates a given file path with an XMLHttp request and
//	sets a boolean ($scope.file_exists) to the result.
//	Also holds a reference to the given file , ($scope.file) which 
//	will be null if the file isn't found.
//
//	This can be useful for dislpaying fallback images.
//
//	USAGE:
//		<div cn-file-exits="path/to-file.jpg">
//			<img ng-src="{{ file_exists ? file : 'path/to-fallback-file.jpg' }}"
//		</div>

angular.module('cnFileExists', []).directive('cnFileExists', [function () {
	return {
		restrict: 'A',
		scope: true,
		controller: ['$scope', '$attrs', function($scope, $attrs) {
			var _request = new XMLHttpRequest();
			$scope.file_exists = false;

			_request.open('HEAD', $attrs.cnFileExists, false);
			_request.send();

			if (_request.status != 404) { 
				$scope.file_exists = true;
				$scope.file = $attrs.cnFileExists;
			} else {
				$scope.file = null;
			}
		}]
	}
}]);