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


import * as types from './Types';
import * as limitations from '../models/Limitations';
import { createThunk } from './';

var AssessmentActions = {};

/////////////////////
// StopPlace actions
/////////////////////
AssessmentActions.setStopWheelchairAccess = value => dispatch => {
  dispatch(
    createThunk(types.CHANGED_STOP_ACCESSIBLITY_ASSESSMENT, {
      value: value,
      limitationType: limitations.wheelchairAccess,
    }),
  );
};

AssessmentActions.setStopStepFreeAccess = value => dispatch => {
  dispatch(
    createThunk(types.CHANGED_STOP_ACCESSIBLITY_ASSESSMENT, {
      value: value,
      limitationType: limitations.stepFreeAccess,
    }),
  );
};

AssessmentActions.setStopEscalatorFreeAccess = value => dispatch => {
    dispatch(
        createThunk(types.CHANGED_STOP_ACCESSIBLITY_ASSESSMENT, {
            value: value,
            limitationType: limitations.escalatorFreeAccess,
        }),
    );
};

AssessmentActions.setStopLiftFreeAccess = value => dispatch => {
    dispatch(
        createThunk(types.CHANGED_STOP_ACCESSIBLITY_ASSESSMENT, {
            value: value,
            limitationType: limitations.liftFreeAccess,
        }),
    );
};

AssessmentActions.setStopAudibleSignalsAvailable = value => dispatch => {
    dispatch(
        createThunk(types.CHANGED_STOP_ACCESSIBLITY_ASSESSMENT, {
            value: value,
            limitationType: limitations.audibleSignalsAvailable,
        }),
    );
};

AssessmentActions.setStopVisualSignsAvailable = value => dispatch => {
    dispatch(
        createThunk(types.CHANGED_STOP_ACCESSIBLITY_ASSESSMENT, {
            value: value,
            limitationType: limitations.visualSignsAvailable,
        }),
    );
};


/////////////////////
// Quay actions
/////////////////////
AssessmentActions.setQuayWheelchairAccess = (value, index) => dispatch => {
  dispatch(
    createThunk(types.CHANGED_QUAY_ACCESSIBLITY_ASSESSMENT, {
      value: value,
      index: index,
      limitationType: limitations.wheelchairAccess,
    }),
  );
};

AssessmentActions.setQuayStepFreeAccess = (value, index) => dispatch => {
  dispatch(
    createThunk(types.CHANGED_QUAY_ACCESSIBLITY_ASSESSMENT, {
      value: value,
      index: index,
      limitationType: limitations.stepFreeAccess,
    }),
  );
};

AssessmentActions.setQuayEscalatorFreeAccess = (value, index) => dispatch => {
    dispatch(
        createThunk(types.CHANGED_QUAY_ACCESSIBLITY_ASSESSMENT, {
            value: value,
            index: index,
            limitationType: limitations.escalatorFreeAccess,
        }),
    );
};

AssessmentActions.setQuayLiftFreeAccess = (value, index) => dispatch => {
    dispatch(
        createThunk(types.CHANGED_QUAY_ACCESSIBLITY_ASSESSMENT, {
            value: value,
            index: index,
            limitationType: limitations.liftFreeAccess,
        }),
    );
};

AssessmentActions.setQuayAudibleSignalsAvailable = (value, index) => dispatch => {
    dispatch(
        createThunk(types.CHANGED_QUAY_ACCESSIBLITY_ASSESSMENT, {
            value: value,
            index: index,
            limitationType: limitations.audibleSignalsAvailable,
        }),
    );
};

AssessmentActions.setQuayVisualSignsAvailable = (value, index) => dispatch => {
    dispatch(
        createThunk(types.CHANGED_QUAY_ACCESSIBLITY_ASSESSMENT, {
            value: value,
            index: index,
            limitationType: limitations.visualSignsAvailable,
        }),
    );
};

/////////////////////
// Point of interest actions
/////////////////////


AssessmentActions.setPoiWheelchairAccess = value => dispatch => {
    dispatch(
        createThunk(types.CHANGED_POI_ACCESSIBLITY_ASSESSMENT, {
            value: value,
            limitationType: limitations.wheelchairAccess,
        }),
    );
};

export default AssessmentActions;
