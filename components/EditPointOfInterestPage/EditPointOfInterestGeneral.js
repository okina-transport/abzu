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
import {UserActions} from '../../actions/';
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
import {
  savePointOfInterest,
  deletePointOfInterest,
  getNeighbourPointsOfInterest
} from '../../graphql/Tiamat/actions';
import {getIsCurrentVersionMax} from '../../utils/';
import RequiredFieldsMissingDialog from '../Dialogs/RequiredFieldsMissingDialog';
import Routes from '../../routes/';
import PointOfInterestActions from "../../actions/PointOfInterestActions";
import PointOfInterestDetails from "./PointOfInterestDetails";
import TerminatePointOfInterestDialog from "../Dialogs/TerminatePointOfInterestDialog";
import Settings from "../../singletons/SettingsManager";

class EditPointOfInterestGeneral extends React.Component {
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
    const {pointOfInterest} = this.props;
    if (
        !pointOfInterest.name ||
        !pointOfInterest.name.trim().length
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

  handleCloseDeletePointOfInterest() {
    this.props.dispatch(UserActions.hideDeletePointOfInterestDialog());
  }

  handleSaveSuccess(pointOfInterestId) {
    const {dispatch} = this.props;

    this.setState({
      saveDialogOpen: false
    });

    dispatch(UserActions.navigateTo(`/${Routes.POINT_OF_INTEREST}/`, pointOfInterestId));
    dispatch(UserActions.openSnackbar(types.SUCCESS));
  }

  handleSaveError(errorCode) {
    this.setState({
      errorMessage: errorCode
    });
  }

  handleDeletePointOfInterest() {
    const {client, pointOfInterest, dispatch} = this.props;
    this.setState({isLoading: true});
    deletePointOfInterest(client, pointOfInterest.id)
        .then(response => {
          this.setState({isLoading: false});
          dispatch(UserActions.hideDeletePointOfInterestDialog());
          if (response.data.deletePointOfInterest) {
            dispatch(UserActions.navigateToMainAfterDelete());
          }
        })
        .catch(() => {
          this.setState({isLoading: false});
          dispatch(UserActions.hideDeletePointOfInterestDialog(true));
        });
  }

  handleSaveAllEntities(userInput) {
    const {pointOfInterest, client} = this.props;

    let id = null;

    savePointOfInterest(client, pointOfInterest, userInput)
        .then(resultId => {
          id = resultId;
          this.handleSaveSuccess(id);
        })
        .catch(err => {
          this.handleSaveError(MutationErrorCodes.ERROR_POI);
        });
  }

  handleGoBack() {
    const { client, activeMap } = this.props;
    this.setState({
      confirmGoBack: false
    });
    this.props.dispatch(UserActions.navigateTo('/', ''));
    if (activeMap) {
      let includeExpired = new Settings().getShowExpiredStops();
      getNeighbourPointsOfInterest(
          client,
          null,
          activeMap.getBounds(),
          includeExpired
      );
    }
  }

  handleAllowUserToGoBack() {
    if (this.props.pointOfInterestHasBeenModified) {
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
    this.props.dispatch(PointOfInterestActions.discardChangesForEditingPointOfInterest());
  }

  showMorePointOfInterest() {
    this.props.dispatch(UserActions.showEditStopAdditional());
  }

  showLessPointOfInterest() {
    this.props.dispatch(UserActions.hideEditStopAdditional());
  }

  handleDialogClose(dialog) {
    this.setState({
      [dialog]: false,
      allowPathLinkAdjustmentsDialog: false,
      saveDialogOpen: false
    });
  }

  getTitleText = (pointOfInterest, originalPointOfInterest, formatMessage) => {
    const pointOfInterestName = originalPointOfInterest
        ? originalPointOfInterest.name
        : pointOfInterest.name;
    return pointOfInterest && pointOfInterest.id
        ? `${pointOfInterestName} (${pointOfInterest.id})`
        : formatMessage({id: 'new_poi_title'});
  };

  render() {
    const {
      pointOfInterest,
      pointOfInterestHasBeenModified,
      intl,
      versions,
      disabled,
      originalPointOfInterest,
    } = this.props;
    const {formatMessage} = intl;

    if (!pointOfInterest) return null;

    const translations = {
      name: formatMessage({id: 'name'}),
      description: formatMessage({id: 'description'}),
      unsaved: formatMessage({id: 'unsaved'}),
      undefined: formatMessage({id: 'undefined'}),
      none: formatMessage({id: 'none_no'}),
      elements: formatMessage({id: 'elements'}),
      versions: formatMessage({id: 'versions'}),
      validBetween: formatMessage({id: 'valid_between'}),
      notAssigned: formatMessage({id: 'not_assigned'}),
    };

    const pointOfInterestLabel = this.getTitleText(
        pointOfInterest,
        originalPointOfInterest,
        formatMessage
    );
    const isCurrentVersionMax = getIsCurrentVersionMax(
        versions,
        pointOfInterest.version
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

    const pointOfInterestBoxBar = {
      color: '#fff',
      background: 'rgb(39, 58, 70)',
      fontSize: 12,
      padding: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    };

    const disableTerminate =
        disabled ||
        (pointOfInterest.hasExpired && !isCurrentVersionMax);

    return (
        <div style={style}>
          <div style={pointOfInterestBoxBar}>
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
              <div>{pointOfInterestLabel}</div>
            </div>
          </div>
          <div id="scroll-body" style={scrollable}>
            <div style={{padding: '5 5'}}>
              <PointOfInterestDetails
                  translations={translations}
                  disabled={disabled}
                  intl={intl}
                  showLessPointOfInterest={this.showLessPointOfInterest.bind(this)}
                  showMorePointOfInterest={this.showMorePointOfInterest.bind(this)}
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
                    currentValidBetween={pointOfInterest.validBetween}
                />
            ) : null}
            <TerminatePointOfInterestDialog
                open={this.props.deletePointOfInterestDialogOpen}
                handleClose={this.handleCloseDeletePointOfInterest.bind(this)}
                handleConfirm={this.handleDeletePointOfInterest.bind(this)}
                intl={intl}
                pointOfInterest={pointOfInterest}
                isLoading={this.state.isLoading}
            />
            <RequiredFieldsMissingDialog
                open={this.state.requiredFieldsMissingOpen}
                handleClose={() => {
                  this.setState({requiredFieldsMissingOpen: false});
                }}
                requiredMissing={{
                  name: !pointOfInterest.name || !pointOfInterest.name.trim().length,
                }}
                formatMessage={formatMessage}
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
            {!pointOfInterest.permanentlyTerminated &&
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
                          UserActions.requestTerminatePointOfInterest(pointOfInterest.id)
                      );
                    }}
                />
            )}
            <FlatButton
                icon={<MdUndo style={{height: '1.3em', width: '1.3em'}}/>}
                disabled={!pointOfInterestHasBeenModified}
                label={formatMessage({id: 'undo_changes'})}
                style={{margin: '8 5', zIndex: 999, minWidth: '120px'}}
                labelStyle={{fontSize: '0.7em'}}
                onClick={() => {
                  this.setState({confirmUndoOpen: true});
                }}
            />
            <FlatButton
                icon={<MdSave style={{height: '1.3em', width: '1.3em'}}/>}
                disabled={disabled || !pointOfInterestHasBeenModified}
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
  pointOfInterest: state.pointOfInterest.current,
  pointOfInterestHasBeenModified: state.pointOfInterest.pointOfInterestHasBeenModified,
  activeElementTab: state.user.activeElementTab,
  deletePointOfInterestDialogOpen: state.mapUtils.deletePointOfInterestDialogOpen,
  versions: state.pointOfInterest.versions,
  activeMap: state.mapUtils.activeMap,
  originalPointOfInterest: state.pointOfInterest.originalCurrent,
  serverTimeDiff: state.user.serverTimeDiff,
  deletePointOfInterestDialogWarning: state.user.deletePointOfInterestDialogWarning,
});

export default withApollo(
    injectIntl(connect(mapStateToProps)(EditPointOfInterestGeneral))
);

