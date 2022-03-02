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
        case 'getParking':
            return getStateWithEntitiesParkingFromQueryParking(state, action);
        case 'parkingBBox':
            return Object.assign({}, state, {
                neighbourParkings: formatHelpers.mapNeighbourParkingsToClientParkings(
                    action.result.data.parkingBBox,
                    state.current
                )
            });

        case 'mutateParking':
            return updateParkingStateAfterMutate(state, action, 'mutateParking');

        default:
            return state;
    }
};

const updateParkingStateAfterMutate = (state, action, dataResource) => {
    if (!action.result.data[dataResource]) return state;

    const isArray = Array.isArray(action.result.data[dataResource]);
    const parking = isArray ? action.result.data[dataResource][0] : action.result.data[dataResource];

    return Object.assign({}, state, {
        current: formatHelpers.mapParkingToClientParking(parking, true),
        originalCurrent: formatHelpers.mapParkingToClientParking(
            parking,
            true
        ),
        isCreatingPolylines: false,
        minZoom: parking.geometry ? 14 : 5,
        centerPosition:
            formatHelpers.getCenterPosition(parking.geometry) ||
            state.centerPosition,
        lastMutatedParkingId: state.lastMutatedParkingId.concat(parking.id),
        parkingHasBeenModified: false
    });
}

const getStateWithEntitiesParkingFromQueryParking = (state, action) => {
    if (!action.result.data) {
        return state;
    }

    // result extracted from query
    let parking = action.result.data.parking &&
    action.result.data.parking.length
        ? action.result.data.parking[0]
        : null;

    // no parking found
    if (parking === null) {
        console.warn("Result contains no parking data, ignored");
        return state;
    }


    const currentParking = formatHelpers.mapParkingToClientParking(
        parking,
        true,
        state.userDefinedCoordinates,
    );
    const originalCurrentParking = JSON.parse(JSON.stringify(currentParking));

    return Object.assign({}, state, {
        current: currentParking,
        versions: getAllVersionFromResult(state, action),
        originalCurrent: originalCurrentParking,
        zoom: getProperZoomLevel(parking, state.zoom),
        minZoom: parking && parking.geometry ? 14 : 7,
        centerPosition: currentParking.location,
        parkingHasBeenModified: false
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