'use strict';

angular.module('abzu.stopPlaceEditor', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/stopPlaceEditor/:stopPlaceId', {
    templateUrl: 'modules/stop-place-editor/stop-place-editor.html',
    controller: 'StopPlaceEditorCtrl'
  });
}])

.controller('StopPlaceEditorCtrl', ['$window', '$routeParams', '$scope', 'stopPlaceService', 'stopPlaceTypeService', 'leafletData', 'appConfig',
	function($window, $routeParams, $scope, stopPlaceService, stopPlaceTypeService, leafletData, config) {


		var extraMarkerIcon = {
            type: 'extraMarker',
            icon: 'ion-gear-a',
            markerColor: 'grey',
            prefix: 'ion',
            shape: 'circle' 
		};

        $scope.definedLayers = {
            local_map: config.leaflet.tesseraLayer,
            osm: {
                name: 'OpenStreetMap',
                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                type: 'xyz'
            }
        };

		angular.extend($scope, {
            center: {
       		   autodiscover: true,
       		   zoom: 6
            },
            layers: {
                baselayers: {
                    osm: $scope.definedLayers.osm,
                    local_map: $scope.definedLayers.local_map
                }
            }
        });

	    $scope.toggleLayer = function(layerName) {
            var baselayers = $scope.layers.baselayers;
            if (baselayers.hasOwnProperty(layerName)) {
                delete baselayers[layerName];
            } else {
                baselayers[layerName] = $scope.definedLayers[layerName];
            }
	    };


		$scope.update = function() {
        	$scope.master = angular.copy($scope.stopPlace);
        	stopPlaceService.saveStopPlace($scope.stopPlace).then(function() {
        		console.log("saved");
				$window.location.href = '#/';
        	});
      	};

      	$scope.reset = function() {
       		$scope.stopPlace = angular.copy($scope.master);
	    };

	    var populateStopPlace = function(stopPlace) {
			$scope.stopPlace = stopPlace;
			$scope.master = angular.copy($scope.stopPlace);

			var latitude = $scope.stopPlace.centroid.location.latitude;
			var longitude = $scope.stopPlace.centroid.location.longitude;

	        var bounds = [];
            bounds.push([latitude, longitude]);


			

			$scope.markers = {
				mainMarker: {
					lat: latitude,
					lng: longitude,
					message: $scope.stopPlace.name,
					focus: true,
		            draggable: true,
		            icon: extraMarkerIcon
				}			
			};


			if(stopPlace.quays) {
				for(var i in stopPlace.quays) {
					var quay = stopPlace.quays[i];
					$scope.markers["quay1"] = {
						lat: quay.centroid.location.latitude,
						lng: quay.centroid.location.longitude,
						message: "Stoppunkt "+quay.name,
						icon: extraMarkerIcon,
						focus: true,
			            draggable: true
					}

					bounds.push([quay.centroid.location.latitude, quay.centroid.location.longitude]);

				}
				
			}

			$scope.originalMarker = angular.copy($scope.markers);

            $scope.$on("leafletDirectiveMarker.dragend", function(event, args){
                $scope.stopPlace.centroid.location.latitude = args.model.lat.toString();
                $scope.stopPlace.centroid.location.longitude = args.model.lng.toString();
            });

            leafletData.getMap().then(function(map) {
            	if(bounds.length > 0) {
            		map.fitBounds(bounds);
            	}
	            map.on('moveend', function() { 
	            	stopPlaceService.getStopPlacesWithin(createBoundingBox(map)).then(populateNearbyMarkers);
				});
				stopPlaceService.getStopPlacesWithin(createBoundingBox(map)).then(populateNearbyMarkers);
	        });
        };

        var createBoundingBox = function(map) {
			var bounds = map.getBounds();

			var boundingBox = {
				xMin: bounds.getSouthWest().lng,
				yMin: bounds.getSouthWest().lat,
				xMax: bounds.getNorthEast().lng,
				yMax: bounds.getNorthEast().lat
			};
			return boundingBox;
        };

	    var populateNearbyMarkers = function(stopPlacesWithinBoundingBox) {
			console.log("Got " + stopPlacesWithinBoundingBox.length +" stop places from current bounding box");

			$scope.markers = angular.copy($scope.originalMarker);
	
			for(var i in stopPlacesWithinBoundingBox) {

				var relatedStopPlace = stopPlacesWithinBoundingBox[i];
				
				var key = relatedStopPlace.id.replace(/[-]+/g, '_');

				if(relatedStopPlace.id == $scope.stopPlace.id) {
					//console.log("Ignoring stop place with id " + $scope.stopPlace.id);
					continue;
				}

	            $scope.markers[key] = {
	                lat: relatedStopPlace.centroid.location.latitude,
	                lng: relatedStopPlace.centroid.location.longitude,
	                message: "<a href='#/stopPlaceEditor/"+relatedStopPlace.id+"'>"+relatedStopPlace.name+"</a>",
	                draggable: false,
	                clickable: true,
	                riseOnHover: true
	            };
			}

		};

		var stopPlaceId = $routeParams.stopPlaceId;
		stopPlaceService.getStopPlace(stopPlaceId).then(populateStopPlace);

		$scope.stopPlaceTypes = stopPlaceTypeService.getStopPlaceTypes();
	}
]);