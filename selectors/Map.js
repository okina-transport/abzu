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


export const getMarkersForMap = ({ stopPlace, user, parking, pointOfInterest }) => {
  const {
    newStop,
    findCoordinates,
    activeSearchResult,
    neighbourStops
  } = stopPlace;

  const {
    newParking,
    neighbourParkings
  } = parking;

  const {
    newPointOfInterest,
    neighbourPointsOfInterest
  } = pointOfInterest;

  const { isCreatingNewStop, isCreatingNewParking, isCreatingNewPointOfInterest, showParkings, showStops, showPointsOfInterest } = user;

  let markers = activeSearchResult ? [activeSearchResult] : [];

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

  if (newParking && isCreatingNewParking) {
    markers = markers.concat(newParking);
  }

  if (newPointOfInterest && isCreatingNewPointOfInterest) {
    markers = markers.concat(newPointOfInterest);
  }

  if (neighbourStops && neighbourStops.length && showStops) {
    markers = markers.concat(neighbourStops);
  }

  if (neighbourParkings && neighbourParkings.length && showParkings) {
    markers = markers.concat(neighbourParkings);
  }

  if (neighbourPointsOfInterest && neighbourPointsOfInterest.length && showPointsOfInterest) {
    markers = markers.concat(neighbourPointsOfInterest);
  }

  if (findCoordinates) {
    markers = markers.concat(findCoordinates);
  }

  return markers;
};
