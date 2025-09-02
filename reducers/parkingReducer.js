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


import {getStateByOperation,} from './parkingReducerUtils';
import * as types from '../actions/Types';
import formatHelpers from '../modelUtils/mapToClient';
import {setDecimalPrecision} from '../utils/';
import equipmentHelpers from "../modelUtils/equipmentHelpers";

const parkingReducer = (state = {}, action) => {
    switch (action.type) {

        /* These actions are dispatched by Apollo-Client */
        case types.APOLLO_QUERY_RESULT:
        case types.APOLLO_MUTATION_RESULT:
            return getStateByOperation(state, action);

        case types.CLEAR_SEARCH_RESULTS:
            return Object.assign({}, state, {
                searchResults: [],
            });

        case types.DESTROYED_NEW_PARKING:
            return Object.assign({}, state, {
                newParking: null
            });


        case types.REMOVED_PARKING_NEARBY_FOR_OVERVIEW:
            return Object.assign({}, state, {
                neighbourParkings: [],
            });

        case types.NAVIGATE_TO_MAIN_AFTER_DELETE:
            return Object.assign({}, state, {
                searchResults: [],
                pathLink: [],
                current: null,
                parkingHasBeenModified: false,
                activeSearchResult: null,
                versions: [],
                originalCurrent: null,
            });

        case types.RESTORED_TO_ORIGINAL_PARKING:
            return Object.assign({}, state, {
                parkingHasBeenModified: false,
                current: JSON.parse(JSON.stringify(state.originalCurrent)),
            });


        case types.SET_CENTER_AND_ZOOM:
            return Object.assign({}, state, {
                centerPosition: action.payLoad.position.slice(),
                zoom: action.payLoad.zoom
            });

        case types.CLEAR_LAST_MUTATED_PARKING_IDS:
            return Object.assign({}, state, {
                lastMutatedParkingId: []
            });

        case types.NAVIGATE_TO:
            if (action.payLoad === '' || action.payLoad.includes('PointOfInterest') || action.payLoad.includes('StopPlace')) {
                return Object.assign({}, state, {
                    pathLink: [],
                    current: null,
                    newParking: null
                });
            } else {
                return state
            }

        case types.LOOKUP_COORDINATES:
            return Object.assign({}, state, {
                findCoordinates: {
                    position: action.payLoad.position.map(pos => setDecimalPrecision(pos, 6)),
                    coordinatePin: true
                },
                centerPosition: action.payLoad.triggeredByDrag ? state.centerPosition : action.payLoad.position,
                zoom: action.payLoad.triggeredByDrag ? state.zoom : 5,
            });

        case types.CREATED_NEW_PARKING:
            const { location } = action.payLoad;
            const parkingToBeCreated = formatHelpers.createNewParkingFromLocation(location);

            return Object.assign({}, state, {
                newParking: parkingToBeCreated,
                originalCurrent: JSON.parse(JSON.stringify(parkingToBeCreated)),
                versions: [],
                pathLink: [],
                parkingHasBeenModified: false
            });


        case types.CHANGED_LOCATION_NEW_PARKING:
            return Object.assign({}, state, {
                newParking: formatHelpers.createNewParkingFromLocation(action.payLoad),
                parkingHasBeenModified: true
            });

        case types.CHANGED_PARKING_TYPE:
            if ( action.payLoad !== "other"){
                delete state.current.typeOfParkingRef;

            }

            return Object.assign({}, state, {
                current: formatHelpers.updateCurrentParkingWithType(
                    state.current,
                    action.payLoad,
                ),
                parkingHasBeenModified: true
            });

        case types.CHANGED_PARKING_COVERED:
            return Object.assign({}, state, {
                current: formatHelpers.updateCurrentParkingCovered(
                    state.current,
                    action.payLoad,
                ),
                parkingHasBeenModified: true
            });

        case types.CHANGED_PARKING_TYPE_OF_PARKING_REF:
            return Object.assign({}, state, {
                current: formatHelpers.updateCurrentParkingTypeOfParkingRef(
                    state.current,
                    action.payLoad,
                ),
                parkingHasBeenModified: true
            });

        case types.CHANGED_PARKING_SECURE:
            return Object.assign({}, state, {
                current: formatHelpers.updateCurrentParkingSecure(
                    state.current,
                    action.payLoad,
                ),
                parkingHasBeenModified: true
            });

        case types.CHANGED_ACTIVE_PARKING_POSITION:
            return Object.assign({}, state, {
                current: formatHelpers.updateCurrentWithPosition(
                    state.current,
                    action.payLoad.location,
                ),
                parkingHasBeenModified: true
            });

        case types.USE_NEW_PARKING_AS_CURRENT:
            return Object.assign({}, state, {
                current: JSON.parse(JSON.stringify(state.newParking)),
                centerPosition: state.newParking.location,
                isCreatingPolylines: false,
                zoom: 14,
                parkingHasBeenModified: false,
                versions: []
            });


        case types.SET_ACTIVE_MARKER:
            return Object.assign({}, state, {
                activeSearchResult: action.payLoad,
                centerPosition: getProperCenterLocation(action.payLoad.location),
                zoom: getProperZoomLevel(action.payLoad.location),
            });

        case types.SET_MISSING_COORDINATES:
            return Object.assign({}, state, {
                centerPosition: getProperCenterLocation(action.payLoad.position),
                zoom: getProperZoomLevel(action.payLoad.position),
                userDefinedCoordinates: action.payLoad,
                activeSearchResult: Object.assign({}, state.activeSearchResult, {
                    location: action.payLoad.position,
                }),
            });

        case types.CHANGED_MAP_CENTER:
            return Object.assign({}, state, {
                centerPosition: action.payLoad.position,
                zoom: action.payLoad.zoom
            });

        case types.CHANGED_PARKING_NAME:
            return {
                ...state,
                current: {
                    ...state.current,
                    name: action.payLoad,
                },
                parkingHasBeenModified: true
            };
        case types.CHANGED_PARKING_LAYOUT:
            return Object.assign({}, state, {
                current: formatHelpers.changeParkingLayout(state.current, action.payLoad),
                parkingHasBeenModified: true
            });

        case types.CHANGED_PARKING_PAYMENT_PROCESS:
            return Object.assign({}, state, {
                current: formatHelpers.changeParkingPaymentProcess(state.current, action.payLoad),
                parkingHasBeenModified: true
            });

        case types.CHANGED_PARKING_RECHARGING_AVAILABLE:
            return Object.assign({}, state, {
                current: formatHelpers.changeParkingRechargingAvailable(state.current, action.payLoad),
                parkingHasBeenModified: true
            });

        case types.CHANGED_PARKING_CARPOOLING_AVAILABLE:
            return Object.assign({}, state, {
                current: formatHelpers.changeParkingCarpoolingAvailable(state.current, action.payLoad),
                parkingHasBeenModified: true
            });

        case types.CHANGED_PARKING_CARSHARING_AVAILABLE:
            return Object.assign({}, state, {
                current: formatHelpers.changeParkingCarsharingAvailable(state.current, action.payLoad),
                parkingHasBeenModified: true
            });

        case types.CHANGED_PARKING_NUMBER_OF_SPACES:
            return Object.assign({}, state, {
                current: formatHelpers.changeParkingNumberOfSpaces(state.current, action.payLoad),
                parkingHasBeenModified: true
            });

        case types.CHANGED_PARKING_NUMBER_OF_SPACES_WITH_RECHARGE_POINT:
            return Object.assign({}, state, {
                current: formatHelpers.changeParkingNumberOfSpacesWithRechargePoint(state.current, action.payLoad),
                parkingHasBeenModified: true
            });

        case types.CHANGED_PARKING_NUMBER_OF_CARSHARING_SPACES:
            return Object.assign({}, state, {
                current: formatHelpers.changeParkingNumberOfCarsharingSpaces(state.current, action.payLoad),
                parkingHasBeenModified: true
            });

        case types.CHANGED_PARKING_NUMBER_OF_CARPOOLING_SPACES:
            return Object.assign({}, state, {
                current: formatHelpers.changeParkingNumberOfCarpoolingSpaces(state.current, action.payLoad),
                parkingHasBeenModified: true
            });

        case types.CHANGED_PARKING_NUMBER_OF_SPACES_FOR_REGISTERED_DISABLED_USER_TYPE:
            return Object.assign({}, state, {
                current: formatHelpers.changeParkingNumberOfSpacesForRegisteredDisabledUserType(state.current, action.payLoad),
                parkingHasBeenModified: true
            });

        case types.CHANGED_PARKING_TOTAL_CAPACITY:
            return Object.assign({}, state, {
                current: formatHelpers.changeParkingTotalCapacity(
                    state.current,
                    action.payLoad,
                ),
                parkingHasBeenModified: true
            });
            
        case types.SET_ZOOM_LEVEL:
            return Object.assign({}, state, {
                zoom: action.payLoad
            });

        case types.CREATED_KEY_VALUES_PAIR_PARKING:
            return Object.assign({}, state, {
                current: formatHelpers.createKeyValuesPair(
                    state.current,
                    action.payLoad.key,
                    action.payLoad.values,
                    action.payLoad.origin,
                ),
                parkingHasBeenModified: true,
            });

        case types.UPDATED_KEY_VALUES_FOR_KEY_PARKING:
            return Object.assign({}, state, {
                current: formatHelpers.updateKeyValuesByKey(
                    state.current,
                    action.payLoad.key,
                    action.payLoad.values,
                    action.payLoad.origin,
                ),
                parkingHasBeenModified: true,
            });

        case types.DELETED_KEY_VALUES_BY_KEY_PARKING:
            return Object.assign({}, state, {
                current: formatHelpers.deleteKeyValuesByKey(
                    state.current,
                    action.payLoad.key,
                    action.payLoad.origin,
                ),
                parkingHasBeenModified: true,
            });


        case types.CHANGED_PARKING_DESCRIPTION:
            return {
                ...state,
                current: {
                    ...state.current,
                    description: action.payLoad,
                },
                parkingHasBeenModified: true,
            };

        case types.CHANGED_TICKET_MACHINE_STATE_PARKING:
            return Object.assign({}, state, {
                current: equipmentHelpers.updateTicketMachineState(
                    state.current,
                    action.payLoad,
                ),
                parkingHasBeenModified: true,
            });

        case types.CHANGED_SHELTER_EQUIPMENT_STATE_PARKING:
            return Object.assign({}, state, {
                current: equipmentHelpers.updateShelterEquipmentState(
                    state.current,
                    action.payLoad,
                ),
                parkingHasBeenModified: true,
            });

        case types.CHANGED_SANITARY_EQUIPMENT_STATE_PARKING:
            return Object.assign({}, state, {
                current: equipmentHelpers.updateSanitaryEquipmentState(
                    state.current,
                    action.payLoad,
                ),
                parkingHasBeenModified: true,
            });

        case types.CHANGED_WAITING_ROOM_STATE_PARKING:
            return Object.assign({}, state, {
                current: equipmentHelpers.updateWaitingRoomState(
                    state.current,
                    action.payLoad,
                ),
                parkingHasBeenModified: true,
            });

        case types.CHANGED_CYCLE_STORAGE_STATE_PARKING:
            return Object.assign({}, state, {
                current: equipmentHelpers.updateCycleStorageEquipmentState(
                    state.current,
                    action.payLoad,
                ),
                parkingHasBeenModified: true,
            });

        case types.CHANGED_TRANSPORT_SIGN_STATE_PARKING:
            return Object.assign({}, state, {
                current: equipmentHelpers.update512SignEquipment(
                    state.current,
                    action.payLoad,
                ),
                parkingHasBeenModified: true,
            });


        default:
            return state;
    }
};

const getProperCenterLocation = location => {
    return location || [62.928595, 12.083002];
};

const getProperZoomLevel = location => {
    return location ? 15 : 5;
};

export default parkingReducer;
