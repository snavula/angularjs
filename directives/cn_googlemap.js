angular.module('cnGooglemap', []).directive('cnGooglemap', [function() {
  return {
    restrict: 'A',
    controller: ['$scope', '$rootScope', '$element', '$attrs', function($scope, $rootScope, $element, $attrs) {
      // Fetch options
      $scope.opts = $scope.$eval($attrs.cnGooglemap);
      
      // Set defaults
      if (!$scope.opts.hasOwnProperty('zoom')) $scope.opts.zoom = 10;
      if (!$scope.opts.hasOwnProperty('assets')) $scope.opts.assets = {};
      if (!$scope.opts.assets.hasOwnProperty('marker_inactive_selector')) $scope.opts.assets.marker_inacive_selector = null;
      if (!$scope.opts.assets.hasOwnProperty('marker_active_selector')) $scope.opts.assets.marker_acive_selector = null;
      
      // Set utility variables
      $scope.markerCoords = []; // archives each marker's coordinates so that they can be compared to
      $scope.current = {}; // the current coordinates being displayed (Useful for setting css classes on DOM elements.)
      $scope.mapMarkers = []; // archives each marker's object so that it can be modified
      
      //  Find custom image assets.  Image source url's are versioned dynamically based
      //  on the build, which means we can't simply call them with javascript. *Facepalms*
      //  Instead, we load them as images onto the page (with display:none) and grab their source
      //  attribute at runtime.
      function findIcon (_ico) {
        if ($element.find($scope.opts.assets[_ico]).length) {
          return angular.element($scope.opts.assets[_ico]).attr('src');
        }
        return null;
      }
      $scope.marker_icon_inactive = findIcon('marker_inactive_selector');
      $scope.marker_icon_active = findIcon('marker_active_selector');
        
      $scope.initMarkers = function(_lat, _lng) { // Draw all of the markers onto the map
        var m = new google.maps.Marker({
          position: {lat: _lat, lng: _lng},
          icon: $scope.marker_icon_inactive,
          map: map,
        });
        $scope.markerCoords.push({lat: _lat, lng: _lng}); // archive this marker's lat and lng
        $scope.mapMarkers.push(m); // push the marker object into another array so it can be referenced
      }
      
      // Switch a marker to "active" state and focuses the map to its location.
      $scope.panTo = function(_lat, _lng) {
        for (var i = 0; i < $scope.mapMarkers.length; i++ ) {
          $scope.mapMarkers[i].setMap(null); // remove the pin from the map
          
          // if this marker is the one we're panning to, set the icon to Google's default icon
          // else use the inactive icon
          var _ico = $scope.marker_icon_inactive;
          if ($scope.markerCoords[i].lat == _lat && $scope.markerCoords[i].lng == _lng) {
            _ico = $scope.marker_icon_active; // use the "active" icon
            
            // Update $scope.current to match this marker
            $scope.current.lat = $scope.markerCoords[i].lat;
            $scope.current.lng = $scope.markerCoords[i].lng;
          }
          
          // Redraw the pin with the appropriate icon
          var pin = new google.maps.Marker({
            position: { lat:$scope.markerCoords[i].lat, lng: $scope.markerCoords[i].lng },
            icon: _ico,
            map: map
          });
          
          $scope.mapMarkers[i] = pin; // Replace the pin object in mapMarkers array.
        } // end forloop

        map.setZoom($scope.opts.zoom);
        map.panTo({lat: _lat, lng: _lng});
      }
    }]
  }
}]);