import {createThunk} from "./index";
import * as types from "./Types";

var PointOfInterestActions = {};

PointOfInterestActions.changePointOfInterestNameTitle = name => dispatch => {
    dispatch(createThunk(types.CHANGED_POI_NAME, name));
};

PointOfInterestActions.changeCurrentPointOfInterestPosition = position => dispatch => {
    dispatch(
        createThunk(types.CHANGED_ACTIVE_POI_POSITION, {
            location: position,
        }),
    );
};

PointOfInterestActions.changeMapCenter = (position, zoom) => dispatch => {
    dispatch(createThunk(types.CHANGED_MAP_CENTER, {
        position,
        zoom
    }));
};

PointOfInterestActions.setActiveMap = map => dispatch => {
    dispatch(createThunk(types.SET_ACTIVE_MAP, map));
};

PointOfInterestActions.discardChangesForEditingPointOfInterest = () => dispatch => {
    dispatch(createThunk(types.RESTORED_TO_ORIGINAL_POI, null));
};

PointOfInterestActions.removeElementByType = (index, type) => dispatch => {
    dispatch(
        createThunk(types.REMOVED_ELEMENT_BY_TYPE, {
            index: index,
            type: type,
        }),
    );
};


PointOfInterestActions.clearLastMutatedPointOfInterestId = () => dispatch => {
    dispatch(
        createThunk(types.CLEAR_LAST_MUTATED_POI_IDS, null)
    );
};

PointOfInterestActions.createKeyValuesPairPointOfInterest = (key, values) => (dispatch, getState) => {
    let state = getState();
    let origin = state.user.keyValuesOrigin;

    dispatch(createThunk(types.CREATED_KEY_VALUES_PAIR_POI, {
        key,
        values,
        origin
    }));
};

PointOfInterestActions.updateKeyValuesForKeyPointOfInterest = (key, values) => (dispatch, getState) => {
    let state = getState();
    let origin = state.user.keyValuesOrigin;

    dispatch(createThunk(types.UPDATED_KEY_VALUES_FOR_KEY_POI, {
        key,
        values,
        origin
    }));
};

PointOfInterestActions.deleteKeyValuesByKeyPointOfInterest = key => (dispatch, getState) => {
    let state = getState();
    let origin = state.user.keyValuesOrigin;

    dispatch(createThunk(types.DELETED_KEY_VALUES_BY_KEY_POI, {
        key,
        origin
    }));
};

PointOfInterestActions.changePointOfInterestDescription = description => dispatch => {
    dispatch(createThunk(types.CHANGED_POI_DESCRIPTION, description));
};


export default PointOfInterestActions;
