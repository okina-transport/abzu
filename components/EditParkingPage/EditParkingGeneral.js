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

import {connect} from 'react-redux';
import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import {ParkingActions, UserActions} from '../../actions/';
import {injectIntl} from 'react-intl';
import ConfirmDialog from '../Dialogs/ConfirmDialog';
import {withApollo} from 'react-apollo';
import * as types from '../../actions/Types';
import MdUndo from 'material-ui/svg-icons/content/undo';
import MdSave from 'material-ui/svg-icons/content/save';
import MdBack from 'material-ui/svg-icons/navigation/arrow-back';
import Divider from 'material-ui/Divider';
import SaveDialog from '../Dialogs/SaveDialog';
import {MutationErrorCodes} from '../../models/ErrorCodes';
import {deleteParking, saveParking} from '../../graphql/Tiamat/actions';
import {getIn, getIsCurrentVersionMax} from '../../utils/';
import RequiredFieldsMissingDialog from '../Dialogs/RequiredFieldsMissingDialog';
import Routes from '../../routes/';
import ToolTippable from "../EditStopPage/ToolTippable";
import Warning from 'material-ui/svg-icons/alert/warning';
import TerminateParkingDialog from "../Dialogs/TerminateParkingDialog";
import ParkingDetails from "./ParkingDetails";

class EditParkingGeneral extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmUndoOpen: false,
      confirmGoBack: false,
      saveDialogOpen: false,
      errorMessage: '',
      requiredFieldsMissingOpen: false,
      isLoading: false
    };
  }

  handleSave() {
    const {parking} = this.props;
    if (
        !parking.name ||
        !parking.name.trim().length ||
        !parking.parkingType ||
        !parking.parkingPaymentProcess ||
        !parking.parkingPaymentProcess.length
    ) {
      this.setState({
        requiredFieldsMissingOpen: true
      });
    } else {
      this.setState({
        saveDialogOpen: true,
        errorMessage: ''
      });
    }
  }

  handleCloseDeleteParking() {
    this.props.dispatch(UserActions.hideDeleteParkingDialog());
  }

  handleSaveSuccess(parkingId) {
    const {client, dispatch} = this.props;

    this.setState({
      saveDialogOpen: false
    });

    dispatch(UserActions.navigateTo(`/${Routes.PARKING}/`, parkingId));
    dispatch(UserActions.openSnackbar(types.SUCCESS));
  }

  handleSaveError(errorCode) {
    this.setState({
      errorMessage: errorCode
    });
  }

  handleDeleteParking() {
    const {client, parking, dispatch} = this.props;
    this.setState({isLoading: true});
    deleteParking(client, parking.id)
        .then(response => {
          this.setState({isLoading: false});
          dispatch(UserActions.hideDeleteParkingDialog());
          if (response.data.deleteParking) {
            dispatch(UserActions.navigateToMainAfterDelete());
          }
        })
        .catch(() => {
          this.setState({isLoading: false});
          dispatch(UserActions.hideDeleteParkingDialog(true));
        });
  }

  handleSaveAllEntities(userInput) {
    const {parking, client} = this.props;

    let id = null;

    saveParking(client, parking, userInput)
        .then(resultId => {
          id = resultId;
          this.handleSaveSuccess(id);
        })
        .catch(err => {
          this.handleSaveError(MutationErrorCodes.ERROR_PARKING);
        });
  }

  handleGoBack() {
    this.setState({
      confirmGoBack: false
    });
    this.props.dispatch(UserActions.navigateTo('/', ''));
  }

  handleAllowUserToGoBack() {
    if (this.props.parkingHasBeenModified) {
      this.setState({
        confirmGoBack: true
      });
    } else {
      this.handleGoBack();
    }
  }

  handleDiscardChanges() {
    this.setState({
      confirmUndoOpen: false
    });
    this.props.dispatch(ParkingActions.discardChangesForEditingParking());
  }

  showMoreParking() {
    this.props.dispatch(UserActions.showEditStopAdditional());
  }

  showLessParking = () => {
    this.props.dispatch(UserActions.hideEditStopAdditional());
  };

  handleDialogClose(dialog) {
    this.setState({
      [dialog]: false,
      allowPathLinkAdjustmentsDialog: false,
      saveDialogOpen: false
    });
  }

  getTitleText = (parking, originalParking, formatMessage) => {
    const parkingName = originalParking
        ? originalParking.name
        : parking.name;
    return parking && parking.id
        ? `${parkingName}, ${parking.parentTopographicPlace} (${
            parking.id
        })`
        : formatMessage({id: 'new_parking_title'});
  };

  severalDataProducers() {
    const {parking} = this.props;
    let importerIdDataProducer = [];
    let severalDP = false;
    if (parking.importedId !== undefined) {
      parking.importedId.forEach((element) => {
        if (importerIdDataProducer[parking.importedId.indexOf(element) - 1] && importerIdDataProducer[parking.importedId.indexOf(element) - 1] !== element.substring(0, 3)) {
          severalDP = true;
        }
        importerIdDataProducer.push(element.substring(0, 3));
      });
    }
    return severalDP;
  }

  render() {
    const {
      parking,
      parkingHasBeenModified,
      intl,
      versions,
      disabled,
      originalParking,
      canDeleteParking
    } = this.props;
    const {formatMessage} = intl;

    if (!parking) return null;

    const translations = {
      name: formatMessage({id: 'name'}),
      description: formatMessage({id: 'description'}),
      unsaved: formatMessage({id: 'unsaved'}),
      undefined: formatMessage({id: 'undefined'}),
      none: formatMessage({id: 'none_no'}),
      capacity: formatMessage({id: 'total_capacity'}),
      parking: formatMessage({id: 'parking_general'}),
      parkAndRide: formatMessage({id: 'parking_item_title_parkAndRide'}),
      bikeParking: formatMessage({id: 'parking_item_title_bikeParking'}),
      unknown: formatMessage({id: 'uknown_parking_type'}),
      elements: formatMessage({id: 'elements'}),
      versions: formatMessage({id: 'versions'}),
      validBetween: formatMessage({id: 'valid_between'}),
      notAssigned: formatMessage({id: 'not_assigned'}),
      severalDataProducers: formatMessage({id: 'several_data_producers'})
    };

    const parkingLabel = this.getTitleText(
        parking,
        originalParking,
        formatMessage
    );
    const isCurrentVersionMax = getIsCurrentVersionMax(
        versions,
        parking.version
    );

    const style = {
      border: '1px solid #511E12',
      background: '#fff',
      width: 405,
      marginTop: 1,
      position: 'absolute',
      zIndex: 999,
      marginLeft: 2
    };

    const scrollable = {
      overflowY: 'auto',
      overflowX: 'hidden',
      width: '100%',
      height: '82vh',
      position: 'relative',
      display: 'block',
      marginTop: 2
    };

    const parkingBoxBar = {
      color: '#fff',
      background: 'rgb(39, 58, 70)',
      fontSize: 12,
      padding: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    };

    const disableTerminate =
        parking.isNewParking ||
        disabled ||
        (parking.hasExpired && !isCurrentVersionMax);

    return (
        <div style={style}>
          <div style={parkingBoxBar}>
            <div style={{display: 'flex', alignItems: 'center', color: '#fff'}}>
              <MdBack
                  color="#fff"
                  style={{
                    cursor: 'pointer',
                    marginRight: 2,
                    transform: 'scale(0.8)'
                  }}
                  onClick={() => this.handleAllowUserToGoBack()}
              />
              <div>{parkingLabel}</div>
              {this.severalDataProducers() &&
              <ToolTippable
                  toolTipText={translations.severalDataProducers}
              >
                <Warning
                    color="orange"
                    style={{width: 20, height: 20, marginRight: 25}}
                />
              </ToolTippable>}
            </div>
          </div>
          <div id="scroll-body" style={scrollable}>
            <div style={{padding: '5 5'}}>
              <ParkingDetails
                  translations={translations}
                  disabled={disabled}
                  intl={intl}
                  showLessParking={this.showLessParking.bind(this)}
                  showMoreParking={this.showMoreParking.bind(this)}
              />
              <Divider inset={true}/>
            </div>
            <ConfirmDialog
                open={this.state.confirmUndoOpen}
                handleClose={() => {
                  this.handleDialogClose('confirmUndoOpen');
                }}
                handleConfirm={() => {
                  this.handleDiscardChanges();
                }}
                messagesById={{
                  title: 'discard_changes_title',
                  body: 'discard_changes_body',
                  confirm: 'discard_changes_confirm',
                  cancel: 'discard_changes_cancel'
                }}
                intl={intl}
            />
            <ConfirmDialog
                open={this.state.confirmGoBack}
                handleClose={() => {
                  this.handleDialogClose('confirmGoBack');
                }}
                handleConfirm={() => {
                  this.handleGoBack();
                }}
                messagesById={{
                  title: 'discard_changes_title',
                  body: 'discard_changes_body',
                  confirm: 'discard_changes_confirm',
                  cancel: 'discard_changes_cancel'
                }}
                intl={intl}
            />
            {this.state.saveDialogOpen && !disabled ? (
                <SaveDialog
                    open={this.state.saveDialogOpen}
                    handleClose={() => {
                      this.handleDialogClose();
                    }}
                    handleConfirm={this.handleSaveAllEntities.bind(this)}
                    errorMessage={this.state.errorMessage}
                    intl={intl}
                    serverTimeDiff={this.props.serverTimeDiff}
                    currentValidBetween={parking.validBetween}
                    severalDataProducers={this.severalDataProducers()}
                    canTerminateValidBetween={this.props.canEditParentStop}
                />
            ) : null}
            <TerminateParkingDialog
                open={this.props.deleteParkingDialogOpen}
                handleClose={this.handleCloseDeleteParking.bind(this)}
                handleConfirm={this.handleDeleteParking.bind(this)}
                intl={intl}
                previousValidBetween={parking.validBetween}
                parking={parking}
                canDeleteParking={canDeleteParking}
                isLoading={this.state.isLoading}
                serverTimeDiff={this.props.serverTimeDiff}
                warningInfo={this.props.deleteParkingDialogWarning}
            />
            <RequiredFieldsMissingDialog
                open={this.state.requiredFieldsMissingOpen}
                handleClose={() => {
                  this.setState({requiredFieldsMissingOpen: false});
                }}
                requiredMissing={{
                  name: !parking.name || !parking.name.trim().length,
                  type: !parking.parkingType,
                  payment: !parking.parkingPaymentProcess || !parking.parkingPaymentProcess.length
                }}
                formatMessage={formatMessage}
                isNewParking={parking.isNewParking}
            />
          </div>
          <div
              style={{
                border: '1px solid #efeeef',
                textAlign: 'right',
                width: '100%',
                display: isCurrentVersionMax ? 'flex' : 'none',
                justifyContent: 'space-around'
              }}
          >
            {!parking.permanentlyTerminated && !parking.isChildOfParent &&
            isCurrentVersionMax && (
                <FlatButton
                    disabled={disableTerminate}
                    label={formatMessage({id: 'terminate_parking'})}
                    style={{margin: '8 5', zIndex: 999}}
                    labelStyle={{
                      fontSize: '0.7em',
                      color: disableTerminate ? 'rgba(0, 0, 0, 0.3)' : 'initial'
                    }}
                    onClick={() => {
                      this.props.dispatch(
                          UserActions.requestTerminateParking(parking.id)
                      );
                    }}
                />
            )}
            <FlatButton
                icon={<MdUndo style={{height: '1.3em', width: '1.3em'}}/>}
                disabled={!parkingHasBeenModified}
                label={formatMessage({id: 'undo_changes'})}
                style={{margin: '8 5', zIndex: 999, minWidth: '120px'}}
                labelStyle={{fontSize: '0.7em'}}
                onClick={() => {
                  this.setState({confirmUndoOpen: true});
                }}
            />
            <FlatButton
                icon={<MdSave style={{height: '1.3em', width: '1.3em'}}/>}
                disabled={disabled || !parkingHasBeenModified}
                label={formatMessage({id: 'save_new_version'})}
                style={{margin: '8 5', zIndex: 999}}
                labelStyle={{fontSize: '0.7em'}}
                onClick={this.handleSave.bind(this)}
            />
          </div>
        </div>
    );
  }
}

const mapStateToProps = state => ({
  parking: state.parking.current,
  parkingHasBeenModified: state.parking.parkingHasBeenModified,
  activeElementTab: state.user.activeElementTab,
  deleteParkingDialogOpen: state.mapUtils.deleteParkingDialogOpen,
  versions: state.parking.versions,
  activeMap: state.mapUtils.activeMap,
  canDeleteParking: getIn(state.roles, ['allowanceInfo', 'canDeleteParking'], false),
  originalParking: state.parking.originalCurrent,
  serverTimeDiff: state.user.serverTimeDiff,
  deleteParkingDialogWarning: state.user.deleteParkingDialogWarning,
});

export default withApollo(
    injectIntl(connect(mapStateToProps)(EditParkingGeneral))
);

