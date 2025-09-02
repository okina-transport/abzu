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


import {getStateByOperation,} from './pointOfInterestReducerUtils';
import * as types from '../actions/Types';
import formatHelpers from '../modelUtils/mapToClient';
import {setDecimalPrecision} from '../utils/';
import limitationHelpers from "../modelUtils/limitationHelpers";
import {CHANGED_POI_OPENING_HOURS} from "../actions/Types";

const pointOfInterestReducer = (state = {}, action) => {
    switch (action.type) {

        /* These actions are dispatched by Apollo-Client */
        case types.APOLLO_QUERY_RESULT:
        case types.APOLLO_MUTATION_RESULT:
            return getStateByOperation(state, action);

        case types.CLEAR_SEARCH_RESULTS:
            return Object.assign({}, state, {
                searchResults: [],
            });


        case types.NAVIGATE_TO_MAIN_AFTER_DELETE:
            return Object.assign({}, state, {
                searchResults: [],
                pathLink: [],
                current: null,
                pointOfInterestHasBeenModified: false,
                activeSearchResult: null,
                versions: [],
                originalCurrent: null,
            });

        case types.RESTORED_TO_ORIGINAL_POI:
            return Object.assign({}, state, {
                pointOfInterestHasBeenModified: false,
                current: JSON.parse(JSON.stringify(state.originalCurrent)),
            });


        case types.SET_CENTER_AND_ZOOM:
            return Object.assign({}, state, {
                centerPosition: action.payLoad.position.slice(),
                zoom: action.payLoad.zoom
            });

        case types.CLEAR_LAST_MUTATED_POI_IDS:
            return Object.assign({}, state, {
                lastMutatedPointOfInterestId: []
            });

        case types.NAVIGATE_TO:
            if (action.payLoad === '' || action.payLoad.includes('StopPlace') || action.payLoad.includes('Parking')) {
                return Object.assign({}, state, {
                    pathLink: [],
                    current: null,
                    newPointOfInterest: null
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

        case types.CHANGED_ACTIVE_POI_POSITION:
            return Object.assign({}, state, {
                current: formatHelpers.updateCurrentWithPosition(
                    state.current,
                    action.payLoad.location,
                ),
                pointOfInterestHasBeenModified: true
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

        case types.CHANGED_POI_NAME:
            return {
                ...state,
                current: {
                    ...state.current,
                    name: action.payLoad,
                },
                pointOfInterestHasBeenModified: true
            };
            
        case types.SET_ZOOM_LEVEL:
            return Object.assign({}, state, {
                zoom: action.payLoad
            });

        case types.MAP_MOVE_END:
            const zoom = action.payLoad.zoom;
            if (Number(zoom) < 9 ){
                return Object.assign({}, state, {
                    neighbourPointsOfInterest: []
                });
            }else{
                return Object.assign({}, state, {
                });
            }


        case types.CREATED_KEY_VALUES_PAIR_POI:
            return Object.assign({}, state, {
                current: formatHelpers.createKeyValuesPair(
                    state.current,
                    action.payLoad.key,
                    action.payLoad.values,
                    action.payLoad.origin,
                ),
                pointOfInterestHasBeenModified: true,
            });

        case types.UPDATED_KEY_VALUES_FOR_KEY_POI:
            return Object.assign({}, state, {
                current: formatHelpers.updateKeyValuesByKey(
                    state.current,
                    action.payLoad.key,
                    action.payLoad.values,
                    action.payLoad.origin,
                ),
                pointOfInterestHasBeenModified: true,
            });

        case types.DELETED_KEY_VALUES_BY_KEY_POI:
            return Object.assign({}, state, {
                current: formatHelpers.deleteKeyValuesByKey(
                    state.current,
                    action.payLoad.key,
                    action.payLoad.origin,
                ),
                pointOfInterestHasBeenModified: true,
            });

        case types.CHANGED_POI_DESCRIPTION:
            return {
                ...state,
                current: {
                    ...state.current,
                    description: action.payLoad,
                },
                pointOfInterestHasBeenModified: true,
            };

        case types.CHANGED_POI_ACCESSIBLITY_ASSESSMENT:
            return Object.assign({}, state, {
                current: limitationHelpers.updateCurrentWithLimitations(
                    state.current,
                    action.payLoad,
                ),
                pointOfInterestHasBeenModified: true,
            });

        case types.CHANGED_POI_OPENING_HOURS:
            return {
                ...state,
                current: {
                    ...state.current,
                    pointOfInterestOpeningHours: action.payLoad.pointOfInterestOpeningHours.pointOfInterestOpeningHours,
                },
                pointOfInterestHasBeenModified: true,
            };

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

export default pointOfInterestReducer;
