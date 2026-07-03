/*
 *  Licensed under the EUPL, Version 1.2 or – as soon they will be approved by
the European Commission - subsequent versions of the EUPL (the "Licence");
You may not use this work except in compliance with the Licence.
You may obtain a copy of the Licence at:

  https://joinup.ec.europa.eu/software/page/eupl

Unless required by applicable law or agreed to in writing, software
distributed under the Licence is distributed on an "AS IS" basis,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the Licence for the specific language governing permissions and
limitations under the Licence. */


import { getFilteredStops } from '../utils/FilteringUtils';
import {Entities} from "../models/Entities";



const addTomarkers = function (markers, tadFilteredStops) {
  for (let currStop of tadFilteredStops){
    let isAlreadyExisting = markers.some(marker => marker.id === currStop.id);
    if (!isAlreadyExisting){
      markers = markers.concat(currStop);
    }
  }
  return markers;
};


export const getMarkersForMap = ({ stopPlace, user, parking, pointOfInterest}) => {


  const {
    newStop,
    findCoordinates,
    activeSearchResult,
    neighbourStops,
    stopPlaceClusterMarkers
  } = stopPlace;

  const {
    newParking,
    neighbourParkings,
    parkingClusterMarkers
  } = parking;

  const {
    newPointOfInterest,
    neighbourPointsOfInterest,
    poiClusterMarkers
  } = pointOfInterest;

  const { isCreatingNewStop, isCreatingNewParking, isCreatingNewPointOfInterest, showParkings, showStops, showPois, searchFilters, clusterThreshold } = user;

  let markers = activeSearchResult ? [activeSearchResult] : [];

  let filterByFullTAD = searchFilters !== undefined && searchFilters.filterByFullTAD;
  let filterByPartialTAD = searchFilters !== undefined && searchFilters.filterByPartialTAD;


  if (
    activeSearchResult &&
    activeSearchResult.isParent &&
    activeSearchResult.children
  ) {
    markers = markers.concat(activeSearchResult.children);
  }

  if (newStop && isCreatingNewStop) {
    markers = markers.concat(newStop);
  }
  const zoom = stopPlace.zoom;

  if(zoom != undefined && zoom < clusterThreshold){

    if (stopPlaceClusterMarkers && showStops){
      for (let stopPlaceClusterMarker of stopPlaceClusterMarkers) {
        stopPlaceClusterMarker.entityType = Entities.SP_CLUSTER_MARKER;
        stopPlaceClusterMarker.location = [stopPlaceClusterMarker.latitude, stopPlaceClusterMarker.longitude];
        markers = markers.concat(stopPlaceClusterMarker);
      }
    }


    if (poiClusterMarkers && showPois){
      for (let poiClusterMarker of poiClusterMarkers) {
        poiClusterMarker.entityType = Entities.POI_CLUSTER_MARKER;
        poiClusterMarker.location = [poiClusterMarker.latitude, poiClusterMarker.longitude];
        markers = markers.concat(poiClusterMarker);
      }
    }

    if (parkingClusterMarkers && showParkings){
      for (let parkingClusterMarker of parkingClusterMarkers) {
        parkingClusterMarker.entityType = Entities.PARKING_CLUSTER_MARKER;
        parkingClusterMarker.location = [parkingClusterMarker.latitude, parkingClusterMarker.longitude];
        markers = markers.concat(parkingClusterMarker);
      }
    }
  }

  if (newParking && isCreatingNewParking) {
    markers = markers.concat(newParking);
  }

  if (newPointOfInterest && isCreatingNewPointOfInterest) {
    markers = markers.concat(newPointOfInterest);
  }


  if(zoom != undefined && zoom >= clusterThreshold) {
      if (neighbourStops && neighbourStops.length && showStops) {
       let tadFilteredStops = getFilteredStops(neighbourStops, filterByFullTAD, filterByPartialTAD);
       markers = addTomarkers(markers, tadFilteredStops);
      }

      if (neighbourParkings && neighbourParkings.length && showParkings) {
       markers = markers.concat(neighbourParkings);
      }

      if (showPois && neighbourPointsOfInterest && neighbourPointsOfInterest.length) {
       markers = markers.concat(neighbourPointsOfInterest);
      }
  }

  if (findCoordinates) {
    markers = markers.concat(findCoordinates);
  }

  return markers;
};
