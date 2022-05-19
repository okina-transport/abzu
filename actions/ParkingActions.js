import {createThunk} from "./index";
import * as types from "./Types";
import {getIn} from "../utils";

var ParkingActions = {};

ParkingActions.createNewParking = location => dispatch => {
    dispatch(
        createThunk(types.CREATED_NEW_PARKING, {
            location: [
                Number(location.lat),
                Number(location.lng),
            ]
        }),
    );
};

ParkingActions.changeParkingNameTitle = name => dispatch => {
    dispatch(createThunk(types.CHANGED_PARKING_NAME, name));
};

ParkingActions.changeCurrentParkingPosition = position => dispatch => {
    dispatch(
        createThunk(types.CHANGED_ACTIVE_PARKING_POSITION, {
            location: position,
        }),
    );
};

ParkingActions.useNewParkingAsCurrent = () => (dispatch, getState) => {
    let state = getState();
    let location = getIn(state, ['parking', 'newParking', 'location'], null);
    dispatch(createThunk(types.USE_NEW_PARKING_AS_CURRENT, location));
};

ParkingActions.changeLocationNewParking = location => dispatch => {
    dispatch(
        createThunk(types.CHANGED_LOCATION_NEW_PARKING, [location.lat, location.lng]),
    );
};

ParkingActions.changeMapCenter = (position, zoom) => dispatch => {
    dispatch(createThunk(types.CHANGED_MAP_CENTER, {
        position,
        zoom
    }));
};

ParkingActions.setActiveMap = map => dispatch => {
    dispatch(createThunk(types.SET_ACTIVE_MAP, map));
};

ParkingActions.discardChangesForEditingParking = () => dispatch => {
    dispatch(createThunk(types.RESTORED_TO_ORIGINAL_PARKING, null));
};

ParkingActions.changeParkingType = type => dispatch => {
    dispatch(createThunk(types.CHANGED_PARKING_TYPE, type));
};

ParkingActions.changeParkingTotalCapacity = (
    index,
    totalCapacity,
) => dispatch => {
    dispatch(
        createThunk(types.CHANGED_PARKING_TOTAL_CAPACITY, {
            index,
            totalCapacity,
        }),
    );
};

ParkingActions.changeParkingLayout = (index, parkingLayout) => dispatch => {
    dispatch(
        createThunk(types.CHANGED_PARKING_LAYOUT, {
            index,
            parkingLayout
        }),
    );
};

ParkingActions.changeParkingPaymentProcess = (index, parkingPaymentProcess) => dispatch => {
    dispatch(
        createThunk(types.CHANGED_PARKING_PAYMENT_PROCESS, {
            index,
            parkingPaymentProcess
        }),
    );
};

ParkingActions.changeParkingRechargingAvailable = (index, rechargingAvailable) => dispatch => {
    dispatch(
        createThunk(types.CHANGED_PARKING_RECHARGING_AVAILABLE, {
            index,
            rechargingAvailable
        }),
    );
};

ParkingActions.changeParkingCarpoolingAvailable = (index, carpoolingAvailable) => dispatch => {
    dispatch(
        createThunk(types.CHANGED_PARKING_CARPOOLING_AVAILABLE, {
            index,
            carpoolingAvailable
        }),
    );
};

ParkingActions.changeParkingCarsharingAvailable = (index, carsharingAvailable) => dispatch => {
    dispatch(
        createThunk(types.CHANGED_PARKING_CARSHARING_AVAILABLE, {
            index,
            carsharingAvailable
        }),
    );
};

ParkingActions.changeParkingNumberOfSpaces = (index, numberOfSpaces) => dispatch => {
    dispatch(
        createThunk(types.CHANGED_PARKING_NUMBER_OF_SPACES, {
            index,
            numberOfSpaces
        }),
    );
}

ParkingActions.changeParkingNumberOfSpacesWithRechargePoint = (index, numberOfSpacesWithRechargePoint) => dispatch => {
    dispatch(
        createThunk(types.CHANGED_PARKING_NUMBER_OF_SPACES_WITH_RECHARGE_POINT, {
            index,
            numberOfSpacesWithRechargePoint
        }),
    );
}


ParkingActions.changeParkingNumberOfCarsharingSpaces = (index, numberOfCarsharingSpaces) => dispatch => {
    dispatch(
        createThunk(types.CHANGED_PARKING_NUMBER_OF_CARSHARING_SPACES, {
            index,
            numberOfCarsharingSpaces
        }),
    );
}

ParkingActions.changeParkingNumberOfCarpoolingSpaces = (index, numberOfCarpoolingSpaces) => dispatch => {
    dispatch(
        createThunk(types.CHANGED_PARKING_NUMBER_OF_CARPOOLING_SPACES, {
            index,
            numberOfCarpoolingSpaces
        }),
    );
}

ParkingActions.changeParkingNumberOfSpacesForRegisteredDisabledUserType = (index, numberOfSpacesForRegisteredDisabledUserType) => dispatch => {
    dispatch(
        createThunk(types.CHANGED_PARKING_NUMBER_OF_SPACES_FOR_REGISTERED_DISABLED_USER_TYPE, {
            index,
            numberOfSpacesForRegisteredDisabledUserType
        }),
    );
}

ParkingActions.removeElementByType = (index, type) => dispatch => {
    dispatch(
        createThunk(types.REMOVED_ELEMENT_BY_TYPE, {
            index: index,
            type: type,
        }),
    );
};


ParkingActions.clearLastMutatedParkingId = () => dispatch => {
    dispatch(
        createThunk(types.CLEAR_LAST_MUTATED_PARKING_IDS, null)
    );
};


export default ParkingActions;
