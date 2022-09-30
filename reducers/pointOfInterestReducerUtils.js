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

export const getStateByOperation = (state, action) => {
    switch (action.operationName) {
        case 'getPointOfInterest':
            return getStateWithEntitiesPointOfInterestFromQueryPointOfInterest(state, action);
        case 'pointOfInterestBBox':
            return Object.assign({}, state, {
                neighbourPointsOfInterest: formatHelpers.mapNeighbourPointsOfInterestToClientPointsOfInterest(
                    action.result.data.pointOfInterestBBox,
                    state.current
                )
            });

        case 'mutatePointOfInterest':
            return updatePointOfInterestStateAfterMutate(state, action, 'mutatePointOfInterest');

        default:
            return state;
    }
};

const updatePointOfInterestStateAfterMutate = (state, action, dataResource) => {
    if (!action.result.data[dataResource]) return state;

    const isArray = Array.isArray(action.result.data[dataResource]);
    const pointOfInterest = isArray ? action.result.data[dataResource][0] : action.result.data[dataResource];

    return Object.assign({}, state, {
        current: formatHelpers.mapPointOfInterestToClientPointOfInterest(pointOfInterest, true),
        originalCurrent: formatHelpers.mapPointOfInterestToClientPointOfInterest(
            pointOfInterest,
            true
        ),
        isCreatingPolylines: false,
        minZoom: pointOfInterest.geometry ? 14 : 5,
        centerPosition:
            formatHelpers.getCenterPosition(pointOfInterest.geometry) ||
            state.centerPosition,
        lastMutatedPointOfInterestId: state.lastMutatedPointOfInterestId.concat(pointOfInterest.id),
        pointOfInterestHasBeenModified: false
    });
}

const getStateWithEntitiesPointOfInterestFromQueryPointOfInterest = (state, action) => {
    if (!action.result.data) {
        return state;
    }

    // result extracted from query
    let pointOfInterest = action.result.data.pointOfInterest &&
    action.result.data.pointOfInterest.length
        ? action.result.data.pointOfInterest[0]
        : null;

    // no point of interest found
    if (pointOfInterest === null) {
        console.warn("Result contains no point of interest data, ignored");
        return state;
    }


    const currentPointOfInterest = formatHelpers.mapPointOfInterestToClientPointOfInterest(
        pointOfInterest,
        true,
        state.userDefinedCoordinates,
    );
    const originalCurrentPointOfInterest = JSON.parse(JSON.stringify(currentPointOfInterest));

    return Object.assign({}, state, {
        current: currentPointOfInterest,
        versions: getAllVersionFromResult(state, action),
        originalCurrent: originalCurrentPointOfInterest,
        zoom: getProperZoomLevel(pointOfInterest, state.zoom),
        minZoom: pointOfInterest && pointOfInterest.geometry ? 14 : 7,
        centerPosition: currentPointOfInterest.location,
        pointOfInterestHasBeenModified: false
    });
};

const getProperZoomLevel = (data, prevZoom) => {
    if (!data || data.location) return 5;
    if (prevZoom > 15) return prevZoom;
    return 15;
};

const getAllVersionFromResult = (state, action)   => {
    const data = action.result.data.versions && action.result.data.versions.length
        ? action.result.data.versions
        : null;

    return formatHelpers.mapVersionToClientVersion(data);
};