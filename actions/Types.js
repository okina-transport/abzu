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


// Apollo-Client actions
export const APOLLO_QUERY_RESULT = 'APOLLO_QUERY_RESULT';
export const APOLLO_MUTATION_RESULT = 'APOLLO_MUTATION_RESULT';
export const APOLLO_MUTATION_ERROR = 'APOLLO_MUTATION_ERROR';

// StopPlaceActions
export const CHANGED_MAP_CENTER = 'CHANGED_MAP_CENTER';
export const SET_ACTIVE_MARKER = 'SET_ACTIVE_MARKER';
export const REMOVED_ELEMENT_BY_TYPE = 'REMOVED_ELEMENT_BY_TYPE';
export const CHANGED_ACTIVE_STOP_POSITION = 'CHANGED_ACTIVE_STOP_POSITION';
export const CHANGED_STOP_NAME = 'CHANGED_STOP_NAME';
export const CREATED_NEW_STOP = 'CREATED_NEW_STOP';
export const DESTROYED_NEW_STOP = 'DESTROYED_NEW_STOP';
export const CHANGED_STOP_DESCRIPTION = 'CHANGED_STOP_DESCRIPTION';
export const CHANGED_STOP_TYPE = 'CHANGED_STOP_TYPE';
export const RESTORED_TO_ORIGINAL_STOP_PLACE =
  'RESTORED_TO_ORIGINAL_STOP_PLACE';
export const CHANGED_QUAY_COMPASS_BEARING = 'CHANGED_QUAY_COMPASS_BEARING';
export const SET_FOCUS_ON_ELEMENT = 'SET_FOCUS_ON_ELEMENT';
export const SET_ACTIVE_MAP = 'SET_ACTIVE_MAP';
export const ADDED_JUNCTION_ELEMENT = 'ADDED_JUNCTION_ELEMENT';
export const CHANGE_ELEMENT_POSITION = 'CHANGE_ELEMENT_POSITION';
export const CHANGED_ELEMENT_DESCRIPTION = 'CHANGED_ELEMENT_DESCRIPTION';
export const CHANGED_LOCATION_NEW_STOP = 'CHANGED_LOCATION_NEW_STOP';
export const USE_NEW_STOP_AS_CURRENT = 'USE_NEW_STOP_AS_CURENT';
export const CHANGE_PUBLIC_CODE_NAME = 'CHANGE_PUBLIC_CODE_NAME';
export const CHANGE_PRIVATE_CODE_NAME = 'CHANGE_PRIVATE_CODE_NAME';
export const ADDED_ALT_NAME = 'ADDED_ALT_NAME';
export const EDITED_ALT_NAME = 'EDITED_ALT_NAME';
export const REMOVED_ALT_NAME = 'REMOVED_ALT_NAME';
export const CHANGED_WEIGHTING_STOP_PLACE = 'CHANGED_WEIGHTING_STOP_PLACE';
export const CHANGED_PARKING_TOTAL_CAPACITY = 'CHANGED_PARKING_TOTAL_CAPACITY';
export const CHANGED_PARKING_NAME = 'CHANGED_PARKING_NAME';
export const CHANGED_STOP_SUBMODE = 'CHANGED_STOP_SUBMODE';
export const ADDED_STOP_PLACES_TO_PARENT = 'ADDED_STOP_PLACES_TO_PARENT';
export const REMOVED_CHILD_FROM_PARENT_STOP_PLACE = 'REMOVED_CHILD_FROM_PARENT_STOP_PLACE';
export const TOGGLED_IS_MULTIMODAL_EDGES_ENABLED = 'TOGGLED_IS_MULTIMODAL_EDGES_ENABLED';
export const TOGGLE_SHOW_FUTURE_AND_EXPIRED = 'TOGGLE_SHOW_FUTURE_AND_EXPIRED';
export const TOGGLE_SEARCH_WITH_ORG_CODE = 'TOGGLE_SEARCH_WITH_ORG_CODE';
export const SET_SERVER_DIFF_TIME = 'SET_SERVER_DIFF_TIME';
export const CLEAR_LAST_MUTATED_STOP_PLACE_IDS = 'CLEAR_LAST_MUTATED_STOP_PLACE_ID';
export const RECEIVED_QUAYS_MERGE_INFO = 'RECEIVED_QUAYS_MERGE_INFO';
export const REQUESTED_QUAYS_MERGE_INFO = 'REQUESTED_QUAYS_MERGE_INFO';
export const ADDED_TARIFF_ZONE = 'ADDED_TARIFF_ZONE';
export const REMOVED_TARIFF_ZONE = 'REMOVED_TARIFF_ZONE';

// UserActions
export const NAVIGATE_TO = 'NAVIGATE_TO';
export const TOGGLED_IS_CREATING_NEW_STOP = 'TOGGLED_IS_CREATING_NEW_STOP';
export const APPLIED_STOPTYPE_SEARCH_FILTER = 'APPLIED_STOPTYPE_SEARCH_FILTER';
export const OPENED_SNACKBAR = 'OPENED_SNACKBAR';
export const DISMISSED_SNACKBAR = 'DISMISSED_SNACKBAR';
export const CHANGED_LOCALIZATION = 'CHANGED_LOCALIZATION';
export const APPLIED_LOCALE = 'APPLIED_LOCALE';
export const ADDED_TOPOS_CHIP = 'ADDED_TOPOS_CHIP';
export const DELETED_TOPOS_CHIP = 'DELETED_TOPOS_CHIP';
export const SET_TOPOS_CHIPS = 'SET_TOPOS_CHIPS';
export const SET_STOP_PLACE_TYPES = 'SET_STOP_PLACE_TYPES';
export const SET_SEARCH_TEXT = 'SET_SEARCH_TEXT';
export const OPENED_FAVORITE_NAME_DIALOG = 'OPENED_FAVORITE_NAME_DIALOG';
export const CLOSED_FAVORITE_NAME_DIALOG = 'CLOSED_FAVORITE_NAME_DIALOG';
export const REMOVE_SEARCH_AS_FAVORITE = 'REMOVE_SEARCH_AS_FAVORITE';
export const CHANGED_ACTIVE_BASELAYER = 'CHANGED_ACTIVE_BASELAYER';
export const REMOVED_STOPS_NEARBY_FOR_OVERVIEW =
  'REMOVED_STOPS_NEARBY_FOR_OVERVIEW';
export const TOGGLED_IS_MULTIPOLYLINES_ENABLED =
  'TOGGLED_IS_MULTIPOLYLINES_ENABLED';
export const STARTED_CREATING_POLYLINE = 'STARTED_CREATING_POLYLINE';
export const ADDED_COORDINATES_TO_POLYLINE = 'ADDED_COORDINATES_TO_POLYLINE';
export const ADDED_FINAL_COORDINATES_TO_POLYLINE =
  'ADDED_FINAL_COORDINATES_TO_POLYLINE';
export const REMOVED_POLYLINE_FROM_INDEX = 'REMOVED_POLYLINE_FROM_INDEX';
export const EDITED_TIME_ESTIMATE_FOR_POLYLINE =
  'EDITED_TIME_ESTIMATE_FOR_POLYLINE';
export const REMOVED_LAST_POLYLINE = 'REMOVED_LAST_POLYLINE';
export const TOGGLED_IS_COMPASS_BEARING_ENABLED =
  'TOGGLED_IS_COMPASS_BEARING_ENABLED';
export const CHANGED_ELEMENT_TYPE_TAB = 'CHANGED_ELEMENT_TYPE_TAB';
export const HID_QUAYS_FOR_NEIGHBOUR_STOP = 'HID_QUAYS_FOR_NEIGHBOUR_STOP';
export const SET_MISSING_COORDINATES = 'SET_MISSING_COORDINATES';
export const HID_EDIT_QUAY_ADDITIONAL = 'HID_EDIT_QUAY_ADDITIONAL';
export const SHOW_EDIT_QUAY_ADDITIONAL = 'SHOW_EDIT_QUAY_ADDITIONAL';
export const SHOW_EDIT_STOP_ADDITIONAL = 'SHOW_EDIT_STOP_ADDITIONAL';
export const HID_EDIT_STOP_ADDITIONAL = 'HID_EDIT_STOP_ADDITIONAL';
export const CLEAR_SEARCH_RESULTS = 'CLEAR_SEARCH_RESULTS';
export const OPENED_MERGE_STOP_DIALOG = 'OPENED_MERGE_STOP_DIALOG';
export const CLOSED_MERGE_STOP_DIALOG = 'CLOSED_MERGE_STOP_DIALOG';
export const STARTED_MERGING_QUAY_FROM = 'STARTED_MERGING_QUAY_FROM';
export const ENDED_MERGING_QUAY_TO = 'ENDED_MERGING_QUAY_TO';
export const CANCELLED_MERGING_QUAY_FROM = 'CANCELLED_MERGING_QUAY_FROM';
export const CLOSED_MERGE_QUAYS_DIALOG = 'CLOSED_MERGE_QUAYS_DIALOG';
export const CANCELLED_DELETE_QUAY_DIALOG = 'CANCELLED_DELETE_QUAY_DIALOG';
export const REQUESTED_DELETE_QUAY = 'REQUESTED_DELETE_QUAY';
export const TERMINATE_DELETE_STOP_DIALOG = 'REQUESTED_DELETE_STOP_DIALOG';
export const CANCELLED_DELETE_STOP_DIALOG = 'CANCELLED_DELETE_STOP_DIALOG';
export const NAVIGATE_TO_MAIN_AFTER_DELETE = 'NAVIGATE_TO_MAIN_AFTER_DELETE';
export const OPENED_KEY_VALUES_DIALOG = 'OPEN_KEY_VALUES_DIALOG';
export const CLOSED_KEY_VALUES_DIALOG = 'CLOSED_KEY_VALUES_DIALOG';
export const TOGGLED_IS_SHOW_EXPIRED_STOPS = 'TOGGLED_IS_SHOW_EXPIRED_STOPS';
export const REQUESTED_MOVE_QUAY = 'REQUESTED_MOVE_QUAY';
export const CANCELLED_MOVE_QUAY_DIALOG = 'CANCELLED_MOVE_QUAY_DIALOG';
export const REQUESTED_MOVE_QUAY_NEW_STOP = 'REQUESTED_MOVE_QUAY_NEW_STOP';
export const CANCELLED_MOVE_QUAY_NEW_STOP = 'CANCELLED_MOVE_QUAY_NEW_STOP';
export const SET_ZOOM_LEVEL = 'SET_ZOOM_LEVEL';
export const UPDATED_KEY_VALUES_FOR_KEY = 'UPDATED_KEY_VALUES_FOR_KEY';
export const CREATED_KEY_VALUES_PAIR = 'CREATED_KEY_VALUES_PAIR';
export const DELETED_KEY_VALUES_BY_KEY = 'DELETED_KEY_VALUES_BY_KEY';
export const OPEN_PARKING_ELEMENT = 'OPEN_PARKING_ELEMENT';
export const SORTED_QUAYS = 'SORTED_QUAYS';
export const REMOVED_ALL_FILTERS = 'REMOVED_ALL_FILTERS';
export const LOOKUP_COORDINATES = 'LOOKUP_COORDINATES';
export const OPEN_LOOKUP_COORDINATES_DIALOG = 'OPEN_LOOKUP_COORDINATES_DIALOG';
export const CLOSED_LOOKUP_COORDINATES_DIALOG = 'CLOSED_LOOKUP_COORDINATES_DIALOG';
export const SET_CENTER_AND_ZOOM = 'SET_CENTER_AND_ZOOM';
export const SHOW_CREATED_NEW_STOP_INFO = 'SHOW_CREATED_NEW_STOP_INFO';
export const HIDE_CREATED_NEW_STOP_INFO = 'HIDE_CREATED_NEW_STOP_INFO';
export const SHOW_REMOVE_STOP_PLACE_FROM_PARENT = 'SHOW_REMOVE_STOP_PLACE_FROM_PARENT';
export const HIDE_REMOVE_STOP_PLACE_FROM_PARENT = 'HIDE_REMOVE_STOP_PLACE_FROM_PARENT';
export const CREATE_NEW_MULTIMODAL_STOP_FROM_EXISTING = 'CREATE_NEW_MULTIMODAL_STOP_FROM_EXISTING';
export const TOGGLE_SHOW_PUBLIC_CODE = 'TOGGLE_SHOW_PUBLIC_CODE';
export const TERMINATE_DELETE_STOP_DIALOG_WARNING = 'TERMINATE_DELETE_STOP_DIALOG_WARNING';

//Snackbar types
export const SUCCESS = 'SUCCESS';
export const ERROR = 'ERROR';

// AssessmentActions
export const CHANGED_STOP_ACCESSIBLITY_ASSESSMENT =
  'CHANGED_STOP_ACCESSIBLITY_ASSESSMENT';
export const CHANGED_QUAY_ACCESSIBLITY_ASSESSMENT =
  'CHANGED_QUAY_ACCESSIBLITY_ASSESSMENT';

// EquipmentActions
export const CHANGED_TICKET_MACHINE_STATE = 'CHANGED_TICKET_MACHINE_STATE';
export const CHANGED_SHELTER_EQUIPMENT_STATE =
  'CHANGED_SHELTER_EQUIPMENT_STATE';
export const CHANGED_SANITARY_EQUIPMENT_STATE =
  'CHANGED_SANITARY_EQUIPMENT_STATE';
export const CHANGED_WAITING_ROOM_STATE = 'CHANGED_WAITING_ROOM_STATE';
export const CHANGED_CYCLE_STORAGE_STATE = 'CHANGED_CYCLE_STORAGE_STATE';
export const CHANGED_TRANSPORT_SIGN_STATE = 'CHANGED_TRANSPORT_SIGN_STATE';

// StopPlacesGroupActions
export const CHANGED_STOP_PLACE_GROUP_NAME = 'CHANGED_STOP_PLACE_GROUP_NAME';
export const CHANGED_STOP_PLACE_GROUP_DESCRIPTION = 'CHANGED_STOP_PLACE_GROUP_DESCRIPTION';
export const REQUESTED_MEMBER_INFO = 'REQUESTED_MEMBER_INFO';
export const RECEIVED_MEMBER_INFO = 'RECEIVED_MEMBER_INFO';
export const
  RECEIVED_MEMBERS_INFO = 'RECEIVED_MEMBERS_INFO';
export const REMOVED_GROUP_MEMBER = 'REMOVED_GROUP_MEMBER';
export const DISCARDED_GOS_CHANGES = 'DISCARDED_GOS_CHANGES';
export const SETUP_NEW_GROUP = 'SETUP_NEW_GROUP';
export const CREATED_NEW_GROUP_OF_STOP_PLACES = 'CREATED_NEW_GROUP_OF_STOP_PLACES';
export const ERROR_NEW_GROUP = 'ERROR_NEW_GROUP';