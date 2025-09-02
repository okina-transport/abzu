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

  const { isCreatingNewStop, isCreatingNewParking, isCreatingNewPointOfInterest, showParkings, showStops, showPoiShop, showPoiAmenity, showPoiBuilding, showPoiHistoric, showPoiLanduse, showPoiLeisure, showPoiTourism, showPoiOffice, searchFilters } = user;

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


  if(zoom != undefined && zoom < 9){

    if (stopPlaceClusterMarkers){
      for (let stopPlaceClusterMarker of stopPlaceClusterMarkers) {
        stopPlaceClusterMarker.entityType = Entities.SP_CLUSTER_MARKER;
        stopPlaceClusterMarker.location = [stopPlaceClusterMarker.latitude, stopPlaceClusterMarker.longitude];
        markers = markers.concat(stopPlaceClusterMarker);
      }
    }


    if (poiClusterMarkers){
      for (let poiClusterMarker of poiClusterMarkers) {
        poiClusterMarker.entityType = Entities.POI_CLUSTER_MARKER;
        poiClusterMarker.location = [poiClusterMarker.latitude, poiClusterMarker.longitude];
        markers = markers.concat(poiClusterMarker);
      }
    }

    if (parkingClusterMarkers){
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



  if (zoom != undefined && zoom >= 9 && neighbourStops && neighbourStops.length && showStops) {
    let tadFilteredStops = getFilteredStops(neighbourStops, filterByFullTAD, filterByPartialTAD);
    markers = addTomarkers(markers, tadFilteredStops);
  }

  if (neighbourParkings && neighbourParkings.length && showParkings) {
    markers = markers.concat(neighbourParkings);
  }

  if ( showPoiShop) {
    markers = addPOImarkers(markers, neighbourPointsOfInterest,'shop');
  }

  if ( showPoiAmenity) {
    markers = addPOImarkers(markers, neighbourPointsOfInterest,'amenity');
  }

  if ( showPoiBuilding) {
    markers = addPOImarkers(markers, neighbourPointsOfInterest,'building');
  }

  if ( showPoiHistoric) {
    markers = addPOImarkers(markers, neighbourPointsOfInterest,'historic');
  }

  if ( showPoiLanduse) {
    markers = addPOImarkers(markers, neighbourPointsOfInterest,'landuse');
  }

  if ( showPoiLeisure) {
    markers = addPOImarkers(markers, neighbourPointsOfInterest,'leisure');
  }

  if ( showPoiTourism) {
    markers = addPOImarkers(markers, neighbourPointsOfInterest,'tourism');
  }

  if ( showPoiOffice) {
    markers = addPOImarkers(markers, neighbourPointsOfInterest,'office');
  }


  if (findCoordinates) {
    markers = markers.concat(findCoordinates);
  }

  return markers;
};

const addPOImarkers = ( markers , neighbourPointsOfInterest,  classificationType) => {

  let pois = filterPoiByClassification(neighbourPointsOfInterest, classificationType);
  if (pois && pois.length ) {
    markers = markers.concat(pois);
  }
  return markers;

}

const filterPoiByClassification = ( pointOfInterests , classificationType) => {

  if (!pointOfInterests || pointOfInterests.length === 0){
    return;
  }

  let pointOfSales = [];

  for (let i = 0; i < pointOfInterests.length; i++) {

    if (isMatchingClassification(pointOfInterests[i], classificationType)){
      pointOfSales.push(pointOfInterests[i]);
    }
  }

  return pointOfSales;

};

const isMatchingClassification = ( pointOfInterest, classificationType ) => {

  if (!pointOfInterest || !pointOfInterest.classifications){
    return false;
  }

  for (let i = 0; i < pointOfInterest.classifications.length; i++) {
    if(isClassificationOfType(pointOfInterest.classifications[i], classificationType)){
      return true;
    }
  }
  return false;
}

const isClassificationOfType = ( classification, classificationType ) => {
  if (!classification){
    return false;
  }

  if (classification.name === classificationType){
    return true;
  }

  if (!classification.parent){
    return false;
  }
  return  isClassificationOfType(classification.parent, classificationType);

}
