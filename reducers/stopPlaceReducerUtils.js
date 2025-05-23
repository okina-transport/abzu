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


import formatHelpers from '../modelUtils/mapToClient';
import LZString from "lz-string";



export const getStateByOperation = (state, action) => {
    switch (action.operationName) {
        case 'stopPlace':
        case 'updateChildOfParentStop':
        case 'stopPlaceAndPathLink':
            return getStateWithEntitiesFromQuery(state, action);

        case 'stopPlaceAllVersions':
            return Object.assign({}, state, {
                versions: getAllVersionFromResult(state, action),
                stopHasBeenModified: false
            });

        case 'removeParentStopPlace':
            return updateLocalCacheAfterParentStopRemoval(state, action);

        case 'mutateDeleteQuay':
            return updateStopPlaceStateAfterMutate(state, action, 'deleteQuay');

        case 'mutateTerminateStopPlace':
            return updateStopPlaceStateAfterMutate(state, action, 'terminateStopPlace');

        case 'removeStopPlaceFromParent':
            return updateStopPlaceStateAfterMutate(state, action, 'removeFromMultiModalStopPlace');

        case 'mutateStopPlace':
            return updateStopPlaceStateAfterMutate(state, action, 'mutateStopPlace');

        case 'mutateCreateMultiModalStopPlace':
            return updateStopPlaceStateAfterMutate(state, action, 'createMultiModalStopPlace');

        case 'mutateParentStopPlace':
            return updateStopPlaceStateAfterMutate(state, action, 'mutateParentStopPlace');

        case 'mutateAddToMultiModalStopPlace':
            return updateStopPlaceStateAfterMutate(state, action, 'addToMultiModalStopPlace');

        case 'getTagsQuery':
            return Object.assign({}, state, {
                current: formatHelpers.updateStopWithTags(
                    state.current, action
                )
            });

        case 'stopPlaceBBox':
            return Object.assign({}, state, {
                neighbourStops: formatHelpers.mapNeighbourStopsToClientStops(
                    action.result.data.stopPlaceBBox,
                    state.current
                )
            });

        case 'allStopPlaces':
            return Object.assign({}, state, {
                neighbourStops: formatHelpers.mapNeighbourStopsToClientStops(
                    action.result.data.allStopPlaces,
                    state.current
                )
            });

        case 'mutatePathLink':
            return Object.assign({}, state, {
                pathLink: formatHelpers.mapPathLinkToClient(
                    action.result.data.mutatePathlink
                ),
                originalPathLink: formatHelpers.mapPathLinkToClient(
                    action.result.data.mutatePathlink
                )
            });

        case 'findStop':
            return Object.assign({}, state, {
                searchResults: [
                    ...formatHelpers.mapSearchResultToStopPlaces(action.result.data.stopPlace),
                    ...formatHelpers.mapSearchResultToParkings(action.result.data.parking),
                    ...formatHelpers.mapSearchResultToPointsOfInterest(action.result.data.pointOfInterest)
                ]
            });

        case 'mutateParking':
            let stopPlaceWithParking = Object.assign({}, state.current, {
                parking: formatHelpers.mapParkingToClient(
                    action.result.data.mutateParking
                )
            });

            return Object.assign({}, state, {
                current: stopPlaceWithParking
            });

        case 'mutatePointOfInterest':
            let pointOfInterest = Object.assign({}, state.current, {
                pointOfInterest: formatHelpers.mapPointOfInterestToClient(
                    action.result.data.mutatePointOfInterest
                )
            });

            return Object.assign({}, state, {
                current: pointOfInterest
            });

        case 'neighbourStopPlaceQuays':
            const resourceId = extractResourceId(action, 'neighbourStopPlaceQuays');
            return Object.assign({}, state, {
                neighbourStopQuays: formatHelpers.mapNeighbourQuaysToClient(
                    state.neighbourStopQuays,
                    action.result.data.stopPlace,
                    resourceId
                )
            });

        case 'TopopGraphicalPlaces':
            return Object.assign({}, state, {
                topographicalPlaces: action.result.data.topographicPlace
            });


        default:
            return state;
    }
};

const getProperZoomLevel = (data, prevZoom) => {
    if (!data || data.location) return 5;
    if (prevZoom > 15) return prevZoom;
    return 15;
};

const getStateWithEntitiesFromQuery = (state, action) => {

    if (!action.result.data) {
        return state;
    }

    // result extracted from query
    let stopPlace = action.result.data.stopPlace &&
    action.result.data.stopPlace.length
        ? action.result.data.stopPlace[0]
        : null;

    if (!stopPlace) {
        // result extracted from result from mutation
        if (
            action.result.data.mutateParentStopPlace &&
            action.result.data.mutateParentStopPlace.length
        ) {
            stopPlace = action.result.data.mutateParentStopPlace[0];
        }
    }
    // no stop place found
    if (stopPlace === null) {
        console.warn("Result contains no stop place data, ignored");
        return state;
    }

    const pathLink = action.result.data.pathLink
        ? action.result.data.pathLink
        : [];


    const parking = action.result.data.parking ? action.result.data.parking : [];

    const resourceId = extractResourceId(action, 'updateChildOfParentStop');

    const currentStop = formatHelpers.mapStopToClientStop(
        stopPlace,
        true,
        formatHelpers.mapParkingToClient(parking),
        state.userDefinedCoordinates,
        resourceId
    );
    const originalCurrentStop = JSON.parse(JSON.stringify(currentStop));


    let currState;
    currState =  Object.assign({}, state, {
        current: currentStop,
        versions: getAllVersionFromResult(state, action),
        originalCurrent: originalCurrentStop,
        originalPathLink: formatHelpers.mapPathLinkToClient(pathLink),
        zoom: getProperZoomLevel(stopPlace, state.zoom),
        minZoom: stopPlace && stopPlace.geometry ? 14 : 7,
        pathLink: formatHelpers.mapPathLinkToClient(pathLink),
        neighbourStopQuays: {},
        centerPosition: currentStop.location,
        stopHasBeenModified: false,
        isCreatingPolylines: false
    });
    return currState;
};


const updateLocalCacheAfterParentStopRemoval = (state, action) => {

    if (action.variables.stopPlaceId !== null){
        let child = action.variables.stopPlaceId;

        for (let neighbour of state.neighbourStops){
            if (neighbour.id === child){
                neighbour.hasExpired = false;
            }
        }
    }

    removeFromLocalMarkers(state.current)
    return state;

}

const getAllVersionFromResult = (state, action) => {
    const data = action.result.data.versions && action.result.data.versions.length
        ? action.result.data.versions
        : null;

    return formatHelpers.mapVersionToClientVersion(data);
};

function addToLocalMarkers(newStop) {
    const compressed = sessionStorage.getItem("markersStorage");
    if (compressed !== null) {
        let markersDecompressed = JSON.parse(LZString.decompress(compressed));
        markersDecompressed = markersDecompressed.concat(newStop);
        sessionStorage.setItem("markersStorage", LZString.compress(JSON.stringify(markersDecompressed)));
    }
}

function removeFromLocalMarkers(newStop) {
    const compressed = sessionStorage.getItem("markersStorage");
    if (compressed !== null) {
        let markersDecompressed = JSON.parse(LZString.decompress(compressed));
        markersDecompressed = markersDecompressed.filter(marker => marker.id !== newStop.id);
        sessionStorage.setItem("markersStorage", LZString.compress(JSON.stringify(markersDecompressed)));
    }
}


const updateStopPlaceStateAfterMutate = (state, action, dataResource) => {
    if (!action.result.data[dataResource]) return state;


    let isNeighbourRefreshNeeded = false;
    const isArray = Array.isArray(action.result.data[dataResource]);
    const stopPlace = isArray ? action.result.data[dataResource][0] : action.result.data[dataResource];

    const clientStop = formatHelpers.mapStopToClientStop(stopPlace, true);

    if (state.newStop != null && state.newStop.isNewStop) {
        addToLocalMarkers(clientStop);
    }

    if (action.operationName === "removeStopPlaceFromParent"){
        let detachedChildId = action.variables.stopPlaceId;
        for (let neighbour of state.neighbourStops){
            if (neighbour.id === detachedChildId ){
                neighbour.hasExpired = false;
            }
        }
    }

    return Object.assign({}, state, {
        current: clientStop,
        isNeighbourRefreshNeeded: isNeighbourRefreshNeeded,
        originalCurrent: formatHelpers.mapStopToClientStop(
            stopPlace,
            true
        ),
        isCreatingPolylines: false,
        minZoom: stopPlace.geometry ? 14 : 5,
        centerPosition:
            formatHelpers.getCenterPosition(stopPlace.geometry) ||
            state.centerPosition,
        lastMutatedStopPlaceId: state.lastMutatedStopPlaceId.concat(stopPlace.id)
    });
}

/* determine whether mutation result was intended for a parentStopPlace or child of a parentStopPlace
since body always will be full parentStopPlace */
const extractResourceId = (action, operationName) => {
    if (!action || !action.variables) return null;

    if (
        action.operationName === operationName &&
        action.variables.children &&
        action.variables.children.length
    ) {
        return action.variables.children[0].id;
    }

    return action.variables.id;
};
