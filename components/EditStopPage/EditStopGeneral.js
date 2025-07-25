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

import { connect } from 'react-redux';
import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import { StopPlaceActions, UserActions } from '../../actions/';
import stopTypes from '../../models/stopTypes';
import { injectIntl } from 'react-intl';
import ConfirmDialog from '../Dialogs/ConfirmDialog';
import EditStopBoxTabs from './EditStopBoxTabs';
import { Tabs, Tab } from 'material-ui/Tabs';
import StopPlaceDetails from './StopPlaceDetails';
import { withApollo } from 'react-apollo';
import mapToMutationVariables from '../../modelUtils/mapToQueryVariables';
import { mutatePathLink, mutateParking } from '../../graphql/Tiamat/mutations';
import { stopPlaceAndPathLinkByVersion } from '../../graphql/Tiamat/queries';
import * as types from '../../actions/Types';
import EditStopAdditional from './EditStopAdditional';
import MdUndo from 'material-ui/svg-icons/content/undo';
import MdSave from 'material-ui/svg-icons/content/save';
import MdBack from 'material-ui/svg-icons/navigation/arrow-back';
import MdLess from 'material-ui/svg-icons/navigation/expand-less';
import Divider from 'material-ui/Divider';
import SaveDialog from '../Dialogs/SaveDialog';
import MergeStopDialog from '../Dialogs/MergeStopDialog';
import MergeQuaysDialog from '../Dialogs/MergeQuaysDialog';
import { MutationErrorCodes } from '../../models/ErrorCodes';
import DeleteQuayDialog from '../Dialogs/DeleteQuayDialog';
import {
  deleteQuay,
  getStopPlaceVersions,
  deleteStopPlace,
  mergeQuays,
  getStopPlaceWithAll,
  mergeAllQuaysFromStop,
  moveQuaysToStop,
  getNeighbourStops,
  moveQuaysToNewStop,
  saveStopPlaceBasedOnType,
  terminateStop
} from '../../graphql/Tiamat/actions';
import TerminateStopPlaceDialog from '../Dialogs/TerminateStopPlaceDialog';
import MoveQuayDialog from '../Dialogs/MoveQuayDialog';
import MoveQuayNewStopDialog from '../Dialogs/MoveQuayNewStopDialog';
import Settings from '../../singletons/SettingsManager';
import { getIn, getIsCurrentVersionMax } from '../../utils/';
import VersionsPopover from './VersionsPopover';
import RequiredFieldsMissingDialog from '../Dialogs/RequiredFieldsMissingDialog';
import Routes from '../../routes/';
import {
  shouldMutateParking,
  shouldMutatePathLinks
} from '../../modelUtils/shouldMutate';
import ToolTippable from "./ToolTippable";
import Warning from 'material-ui/svg-icons/alert/warning';
import LZString from "lz-string";

class EditStopGeneral extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmUndoOpen: false,
      confirmGoBack: false,
      saveDialogOpen: false,
      errorMessage: '',
      requiredFieldsMissingOpen: false,
      isLoading: false,

      // ✅ SIMPLE : Référence vers les méthodes de la Map
      mapMethods: null
    };

    this.stopPlaceDetailsRef = React.createRef();

    // Bind des méthodes
    this.handleSave = this.handleSave.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
    this.handleDiscardChanges = this.handleDiscardChanges.bind(this);
    this.handleMapReady = this.handleMapReady.bind(this);
  }

  // ✅ SIMPLE : Callback quand la Map est prête
  handleMapReady(mapMethods) {
    this.setState({ mapMethods: mapMethods });
    console.log('Map prête avec méthodes:', mapMethods);
  }

  // ✅ SIMPLE : Vérifier s'il y a des changements (Redux + Map)
  hasAnyChanges() {
    const hasReduxChanges = this.props.stopHasBeenModified;
    const hasMapChanges = this.state.mapMethods && this.state.mapMethods.hasChanges
        ? this.state.mapMethods.hasChanges()
        : false;

    const hasStopPlaceDetailsChanges = this.stopPlaceDetailsRef.current &&
    typeof this.stopPlaceDetailsRef.current.hasLocalChanges === 'function'
        ? this.stopPlaceDetailsRef.current.hasLocalChanges()
        : false;

    return hasReduxChanges || hasMapChanges || hasStopPlaceDetailsChanges;
  }

  handleSave() {
    // ✅ SIMPLE : Synchroniser les positions de la carte vers Redux avant sauvegarde
    if (this.state.mapMethods && this.state.mapMethods.syncPositions) {
      console.log('Synchronisation des positions avant sauvegarde...');
      this.state.mapMethods.syncPositions();
    }

    // Synchroniser les détails du StopPlace si nécessaire
    if (this.stopPlaceDetailsRef.current &&
        typeof this.stopPlaceDetailsRef.current.syncToReduxBeforeSave === 'function') {
      this.stopPlaceDetailsRef.current.syncToReduxBeforeSave();
    }

    // Attendre que Redux soit mis à jour avant de valider
    setTimeout(() => {
      const { stopPlace } = this.props;
      if (
          !stopPlace.name ||
          !stopPlace.name.trim().length ||
          !stopPlace.stopPlaceType
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
    }, 100);
  }

  handleCloseMergeStopDialog() {
    this.props.dispatch(UserActions.hideMergeStopDialog());
  }

  handleCloseMergeQuaysDialog() {
    this.props.dispatch(UserActions.hideMergeQuaysDialog());
  }

  handleCloseDeleteQuay() {
    this.props.dispatch(UserActions.hideDeleteQuayDialog());
  }

  handleCloseDeleteStop() {
    this.props.dispatch(UserActions.hideDeleteStopDialog());
  }

  handleCloseMoveQuay() {
    this.props.dispatch(UserActions.closeMoveQuayDialog());
  }

  handleCloseMoveQuayNewStop() {
    this.props.dispatch(UserActions.closeMoveQuayToNewStopDialog());
  }

  handleSaveSuccess(stopPlaceId) {
    const { client, dispatch } = this.props;

    this.setState({
      saveDialogOpen: false
    });

    // ✅ SIMPLE : Reset des positions locales après sauvegarde réussie
    if (this.state.mapMethods && this.state.mapMethods.resetPositions) {
      this.state.mapMethods.resetPositions();
    }

    getStopPlaceVersions(client, stopPlaceId).then(() => {
      dispatch(UserActions.navigateTo('/' + Routes.STOP_PLACE + '/', stopPlaceId));
      dispatch(UserActions.openSnackbar(types.SUCCESS));
    });
  }

  handleSaveError(errorCode) {
    this.setState({
      errorMessage: errorCode
    });
  }

  handleMergeQuaysFromStop(fromVersionComment, toVersionComment) {
    const { stopPlace, mergeSource, client, dispatch, activeMap } = this.props;
    this.setState({ isLoading: true });

    mergeAllQuaysFromStop(
        client,
        mergeSource.id,
        stopPlace.id,
        fromVersionComment,
        toVersionComment
    )
        .then(() => {
          dispatch(UserActions.openSnackbar(types.SUCCESS));
          this.handleCloseMergeStopDialog();
          getStopPlaceWithAll(client, stopPlace.id).then(() => {
            this.setState({ isLoading: false });

            if (activeMap) {
              let includeExpired = new Settings().getShowExpiredStops();
              getNeighbourStops(
                  client,
                  stopPlace.id,
                  activeMap.getBounds(),
                  includeExpired
              );
            }
          });
          this.removeStopFromLocalStorage(mergeSource.id);
        })
        .catch(() => {
          this.setState({ isLoading: false });
        });
  }

  removeStopFromLocalStorage(stopId){
    const compressed = sessionStorage.getItem("markersStorage");
    if (compressed !== null) {
      let markersDecompressed = JSON.parse(LZString.decompress(compressed));
      markersDecompressed = markersDecompressed.filter(marker => marker.id !== stopId);
      sessionStorage.setItem("markersStorage", LZString.compress(JSON.stringify(markersDecompressed)));
    }
  }

  handleMergeQuays(versionComment) {
    const { mergingQuay, client, stopPlace, dispatch } = this.props;

    this.setState({ isLoading: true });

    mergeQuays(
        client,
        stopPlace.id,
        mergingQuay.fromQuay.id,
        mergingQuay.toQuay.id,
        versionComment
    )
        .then(() => {
          this.setState({ isLoading: false });
          dispatch(UserActions.openSnackbar(types.SUCCESS));
          this.handleCloseMergeQuaysDialog();
          getStopPlaceWithAll(client, stopPlace.id);
        })
        .catch(() => {
          this.setState({ isLoading: false });
        });
  }

  handleDeleteQuay() {
    const { client, deletingQuay, dispatch, stopPlace } = this.props;
    this.setState({ isLoading: true });
    deleteQuay(client, deletingQuay)
        .then(() => {
          this.setState({ isLoading: false });
          dispatch(UserActions.hideDeleteQuayDialog());
          getStopPlaceWithAll(client, stopPlace.id).then(() => {
            dispatch(UserActions.openSnackbar(types.SUCCESS));
          });
        })
        .catch(() => {
          this.setState({ isLoading: false });
        });
  }

  handleMoveQuay(fromVersionComment, toVersionComment) {
    const { client, movingQuay, dispatch, stopPlace } = this.props;
    this.setState({ isLoading: true });
    moveQuaysToStop(
        client,
        stopPlace.id,
        movingQuay.id,
        fromVersionComment,
        toVersionComment
    )
        .then(() => {
          this.setState({ isLoading: false });
          dispatch(UserActions.closeMoveQuayDialog());
          dispatch(UserActions.openSnackbar(types.SUCCESS));
          getStopPlaceWithAll(client, stopPlace.id);
        })
        .catch(() => {
          this.setState({ isLoading: false });
        });
  }

  handleTerminateStop(shouldHardDelete, shouldTerminatePermanently, comment, dateTime) {
    const { client, stopPlace, dispatch } = this.props;
    this.setState({ isLoading: true });
    this.removeStopFromLocalStorage(stopPlace.id);

    if (shouldHardDelete) {
      deleteStopPlace(client, stopPlace.id)
          .then(response => {
            this.setState({ isLoading: false });
            dispatch(UserActions.hideDeleteStopDialog());
            if (response.data.deleteStopPlace) {
              dispatch(UserActions.navigateToMainAfterDelete());
            }
          })
          .catch(() => {
            this.setState({ isLoading: false });
            dispatch(UserActions.hideDeleteStopDialog(true));
          });
    } else {
      terminateStop(client, stopPlace.id, shouldTerminatePermanently, comment, dateTime)
          .then(result => {
            this.setState({ isLoading: false });
            this.handleSaveSuccess(stopPlace.id);
            this.handleCloseDeleteStop();
          })
          .catch(err => {
            this.setState({ isLoading: false });
          });
    }
  }

  handleSaveAllEntities(userInput) {
    // ✅ SIMPLE : Les positions ont déjà été synchronisées dans handleSave()
    const { stopPlace, pathLink, originalPathLink, client } = this.props;

    const saveParking = shouldMutateParking(stopPlace.parking);

    const pathLinkVariables = mapToMutationVariables.mapPathLinkToVariables(
        pathLink
    );

    const savePathLinks = shouldMutatePathLinks(
        pathLinkVariables,
        pathLink,
        originalPathLink
    );

    let id = null;

    saveStopPlaceBasedOnType(client, stopPlace, userInput)
        .then(resultId => {
          id = resultId;
          if (!saveParking && !savePathLinks) {
            this.handleSaveSuccess(id);
          } else {
            const parkingVariables = mapToMutationVariables.mapParkingToVariables(
                stopPlace.parking,
                stopPlace.id || id
            );

            if (savePathLinks) {
              client
                  .mutate({
                    variables: { PathLink: pathLinkVariables },
                    mutation: mutatePathLink
                  })
                  .then(() => {
                    if (saveParking) {
                      client
                          .mutate({
                            variables: { Parking: parkingVariables },
                            mutation: mutateParking
                          })
                          .then(result => {
                            this.handleSaveSuccess(id);
                          })
                          .catch(err => {
                            this.handleSaveError(MutationErrorCodes.ERROR_PARKING);
                          });
                    } else {
                      this.handleSaveSuccess(id);
                    }
                  })
                  .catch(err => {
                    this.handleSaveError(MutationErrorCodes.ERROR_PATH_LINKS);
                  });
            } else if (saveParking) {
              client
                  .mutate({
                    variables: { Parking: parkingVariables },
                    mutation: mutateParking
                  })
                  .then(result => {
                    this.handleSaveSuccess(id);
                  })
                  .catch(err => {
                    this.handleSaveError(MutationErrorCodes.ERROR_PARKING);
                  });
            }
          }
        })
        .catch(err => {
          this.handleSaveError(MutationErrorCodes.ERROR_STOP_PLACE);
        });
  }

  handleGoBack() {
    const { client, activeMap } = this.props;
    this.setState({
      confirmGoBack: false
    });
    this.props.dispatch(UserActions.navigateTo('/', ''));
  }

  handleAllowUserToGoBack() {
    if (this.hasAnyChanges()) {
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

    // ✅ SIMPLE : Reset des positions locales
    if (this.state.mapMethods && this.state.mapMethods.resetPositions) {
      this.state.mapMethods.resetPositions();
    }

    // Reset des changements dans StopPlaceDetails
    if (this.stopPlaceDetailsRef.current &&
        typeof this.stopPlaceDetailsRef.current.resetToOriginalState === 'function') {
      this.stopPlaceDetailsRef.current.resetToOriginalState();
    }

    this.props.dispatch(StopPlaceActions.discardChangesForEditingStop());
  }

  handleSlideChange(value) {
    this.props.dispatch(UserActions.changeElementTypeTab(value));
  }

  showMoreStopPlace() {
    this.props.dispatch(UserActions.showEditStopAdditional());
  }

  showLessStopPlace = () => {
    this.props.dispatch(UserActions.hideEditStopAdditional());
  };

  handleDialogClose(dialog) {
    this.setState({
      [dialog]: false,
      allowPathLinkAdjustmentsDialog: false,
      saveDialogOpen: false
    });
  }

  handleMoveQuaysNewStop(quayIds, fromVersionComment, toVersionComment) {
    const { client, dispatch, stopPlace } = this.props;
    let newStopPlaceId = null;

    this.setState({ isLoading: true });

    moveQuaysToNewStop(client, quayIds, fromVersionComment, toVersionComment)
        .then(response => {
          this.setState({ isLoading: false });
          if (
              response.data &&
              response.data.moveQuaysToStop &&
              response.data.moveQuaysToStop.id
          ) {
            newStopPlaceId = response.data.moveQuaysToStop.id;
          }
          dispatch(UserActions.closeMoveQuayToNewStopDialog());
          dispatch(UserActions.openSnackbar(types.SUCCESS));
          getStopPlaceWithAll(client, stopPlace.id).then(response => {
            if (newStopPlaceId) {
              dispatch(
                  UserActions.openSuccessfullyCreatedNewStop(newStopPlaceId)
              );
            }
          });
        })
        .catch(() => {
          this.setState({ isLoading: false });
        });
  }

  handleLoadVersion = function(versionInfo) {
    const { client } = this.props;
    const id = versionInfo.id;
    const version = versionInfo.version;
    client.query({
      fetchPolicy: 'network-only',
      query: stopPlaceAndPathLinkByVersion,
      variables: {
        id: id,
        version: version
      }
    });
  };

  getTitleText = function(stopPlace, originalStopPlace, formatMessage) {
    const stopPlaceName = originalStopPlace
        ? originalStopPlace.name
        : stopPlace.name;
    return stopPlace && stopPlace.id
        ? stopPlaceName + ', ' + stopPlace.parentTopographicPlace + ' (' + stopPlace.id + ')'
        : formatMessage({ id: 'new_stop_title' });
  };

  getQuayItemName = function(locale, stopPlace) {
    stopTypes[locale].forEach(stopType => {
      if (stopType.value === stopPlace.stopPlaceType) {
        return stopType.quayItemName;
      }
    });
  };

  getQuaysForMoveQuayToNewStop() {
    const { stopPlace, movingQuayToNewStop, neighbourStopQuays } = this.props;
    if (!movingQuayToNewStop || !stopPlace) return [];
    const stopPlaceId = movingQuayToNewStop.stopPlaceId;
    if (stopPlaceId === stopPlace.id) {
      return stopPlace.quays;
    } else {
      return neighbourStopQuays[stopPlaceId] || [];
    }
  }

  severalDataProducers(){
    const {stopPlace} = this.props;
    let importerIdDataProducer = [];
    let severalDP = false;
    if(stopPlace.importedId !== undefined) {
      stopPlace.importedId.forEach((element) => {
        if(importerIdDataProducer[stopPlace.importedId.indexOf(element) - 1] && importerIdDataProducer[stopPlace.importedId.indexOf(element) - 1] !== element.substring(0,3)){
          severalDP = true;
        }
        importerIdDataProducer.push(element.substring(0, 3));
      });
    }
    return severalDP;
  }

  render() {
    const {
      stopPlace,
      stopHasBeenModified,
      activeElementTab,
      intl,
      showEditStopAdditional,
      versions,
      disabled,
      canDeleteStop,
      mergeStopDialogOpen,
      originalStopPlace,
      deleteQuayImportedId,
      fetchOTPInfoMergeLoading,
      mergeQuayWarning,
      fetchOTPInfoDeleteLoading,
      deleteQuayWarning
    } = this.props;
    const { formatMessage, locale } = intl;

    if (!stopPlace) return null;

    const translations = {
      name: formatMessage({ id: 'name' }),
      publicCode: formatMessage({ id: 'publicCode' }),
      description: formatMessage({ id: 'description' }),
      unsaved: formatMessage({ id: 'unsaved' }),
      undefined: formatMessage({ id: 'undefined' }),
      none: formatMessage({ id: 'none_no' }),
      quays: formatMessage({ id: 'quays' }),
      pathJunctions: formatMessage({ id: 'pathJunctions' }),
      entrances: formatMessage({ id: 'entrances' }),
      quayItemName: this.getQuayItemName(locale, stopPlace),
      capacity: formatMessage({ id: 'total_capacity' }),
      parking: formatMessage({ id: 'parking_general' }),
      parkAndRide: formatMessage({ id: 'parking_item_title_parkAndRide' }),
      bikeParking: formatMessage({ id: 'parking_item_title_bikeParking' }),
      unknown: formatMessage({ id: 'uknown_parking_type' }),
      elements: formatMessage({ id: 'elements' }),
      versions: formatMessage({ id: 'versions' }),
      validBetween: formatMessage({ id: 'valid_between' }),
      notAssigned: formatMessage({ id: 'not_assigned' }),
      severalDataProducers: formatMessage({ id: 'several_data_producers' })
    };

    const stopPlaceLabel = this.getTitleText(
        stopPlace,
        originalStopPlace,
        formatMessage
    );
    const isCurrentVersionMax = getIsCurrentVersionMax(
        versions,
        stopPlace.version,
        stopPlace.isChildOfParent
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

    const stopBoxBar = {
      color: '#fff',
      background: 'rgb(39, 58, 70)',
      fontSize: 12,
      padding: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    };

    const tabStyle = { color: '#000', fontSize: 10, fontWeight: 600 };
    const disableTerminate =
        stopPlace.isNewStop ||
        disabled ||
        (stopPlace.hasExpired && !isCurrentVersionMax);
    const quaysForMoveQuayToNewStop = this.getQuaysForMoveQuayToNewStop();

    // ✅ SIMPLE : Détecter tous les changements (Redux + Map + StopPlaceDetails)
    const hasAnyModifications = this.hasAnyChanges();

    return (
        React.createElement('div', { style: style }, [
          React.createElement('div', { key: 'header', style: stopBoxBar }, [
            React.createElement('div', {
              key: 'title',
              style: { display: 'flex', alignItems: 'center', color: '#fff' }
            }, [
              React.createElement(MdBack, {
                key: 'back',
                color: "#fff",
                style: {
                  cursor: 'pointer',
                  marginRight: 2,
                  transform: 'scale(0.8)'
                },
                onClick: () => this.handleAllowUserToGoBack()
              }),
              React.createElement('div', { key: 'label' }, stopPlaceLabel),
              this.severalDataProducers() &&
              React.createElement(ToolTippable, {
                key: 'warning',
                toolTipText: translations.severalDataProducers
              }, React.createElement(Warning, {
                color: "orange",
                style: { width: 20, height: 20, marginRight: 25 }
              }))
            ]),
            React.createElement(VersionsPopover, {
              key: 'versions',
              versions: versions,
              buttonLabel: translations.versions,
              disabled: !versions.length,
              hide: stopPlace.isChildOfParent,
              handleSelect: this.handleLoadVersion.bind(this),
              defaultValue: translations.notAssigned
            })
          ]),

          React.createElement('div', { key: 'content', id: "scroll-body", style: scrollable }, [
            React.createElement('div', { key: 'main', style: { padding: '5 5' } }, [
              React.createElement(StopPlaceDetails, {
                key: 'details',
                ref: this.stopPlaceDetailsRef,
                disabled: disabled,
                intl: intl,
                expanded: showEditStopAdditional,
                showLessStopPlace: this.showLessStopPlace.bind(this),
                showMoreStopPlace: this.showMoreStopPlace.bind(this),
                onMapReady: this.handleMapReady
              }),

              showEditStopAdditional ? React.createElement(EditStopAdditional, {
                key: 'additional',
                disabled: disabled
              }) : null,

              React.createElement('div', {
                    key: 'more-btn',
                    style: { textAlign: 'center', marginBottom: 5 }
                  }, showEditStopAdditional ?
                      React.createElement(FlatButton, {
                        icon: React.createElement(MdLess),
                        onClick: () => this.showLessStopPlace()
                      }) :
                      React.createElement(FlatButton, {
                        label: formatMessage({ id: 'more' }),
                        labelStyle: { fontSize: 12 },
                        onClick: () => this.showMoreStopPlace()
                      })
              ),

              React.createElement(Divider, { key: 'divider', inset: true }),

              React.createElement(Tabs, {
                key: 'tabs',
                onChange: this.handleSlideChange.bind(this),
                value: activeElementTab,
                tabItemContainerStyle: { backgroundColor: '#fff' }
              }, [
                React.createElement(Tab, {
                  key: 'quays-tab',
                  style: tabStyle,
                  label: formatMessage({ id: 'quays' }) + ' (' + (stopPlace.quays ? stopPlace.quays.length : 0) + ')',
                  value: 0
                }),
                React.createElement(Tab, {
                  key: 'parking-tab',
                  style: tabStyle,
                  label: formatMessage({ id: 'parking_general' }) + ' (' + stopPlace.parking.length + ')',
                  value: 2
                })
              ]),

              React.createElement(EditStopBoxTabs, {
                key: 'tabs-content',
                disabled: disabled,
                activeStopPlace: stopPlace,
                itemTranslation: translations,
                intl: intl
              })
            ]),

            // Dialogs
            React.createElement(ConfirmDialog, {
              key: 'confirm-undo',
              open: this.state.confirmUndoOpen,
              handleClose: () => this.handleDialogClose('confirmUndoOpen'),
              handleConfirm: () => this.handleDiscardChanges(),
              messagesById: {
                title: 'discard_changes_title',
                body: 'discard_changes_body',
                confirm: 'discard_changes_confirm',
                cancel: 'discard_changes_cancel'
              },
              intl: intl
            }),

            React.createElement(ConfirmDialog, {
              key: 'confirm-goback',
              open: this.state.confirmGoBack,
              handleClose: () => this.handleDialogClose('confirmGoBack'),
              handleConfirm: () => this.handleGoBack(),
              messagesById: {
                title: 'discard_changes_title',
                body: 'discard_changes_body',
                confirm: 'discard_changes_confirm',
                cancel: 'discard_changes_cancel'
              },
              intl: intl
            }),

            this.state.saveDialogOpen && !disabled ? React.createElement(SaveDialog, {
              key: 'save-dialog',
              open: this.state.saveDialogOpen,
              handleClose: () => this.handleDialogClose(),
              handleConfirm: this.handleSaveAllEntities.bind(this),
              errorMessage: this.state.errorMessage,
              intl: intl,
              serverTimeDiff: this.props.serverTimeDiff,
              currentValidBetween: stopPlace.validBetween,
              severalDataProducers: this.severalDataProducers(),
              canTerminateValidBetween: this.props.canEditParentStop
            }) : null,

            React.createElement(RequiredFieldsMissingDialog, {
              key: 'required-fields',
              open: this.state.requiredFieldsMissingOpen,
              handleClose: () => this.setState({ requiredFieldsMissingOpen: false }),
              requiredMissing: {
                name: !stopPlace.name || !stopPlace.name.trim().length,
                type: !stopPlace.stopPlaceType
              },
              formatMessage: formatMessage,
              isNewStop: stopPlace.isNewStop
            })
          ]),

          React.createElement('div', {
            key: 'buttons',
            style: {
              border: '1px solid #efeeef',
              textAlign: 'right',
              width: '100%',
              display: isCurrentVersionMax ? 'flex' : 'none',
              justifyContent: 'space-around'
            }
          }, [
            !stopPlace.permanentlyTerminated && !stopPlace.isChildOfParent &&
            isCurrentVersionMax && React.createElement(FlatButton, {
              key: 'terminate',
              disabled: disableTerminate,
              label: formatMessage({ id: 'terminate_stop_place' }),
              style: { margin: '8 5', zIndex: 999 },
              labelStyle: {
                fontSize: '0.7em',
                color: disableTerminate ? 'rgba(0, 0, 0, 0.3)' : 'initial'
              },
              onClick: () => {
                this.props.dispatch(
                    UserActions.requestTerminateStopPlace(stopPlace.id)
                );
              }
            }),

            React.createElement(FlatButton, {
              key: 'undo',
              icon: React.createElement(MdUndo, { style: { height: '1.3em', width: '1.3em' } }),
              disabled: !hasAnyModifications,
              label: formatMessage({ id: 'undo_changes' }),
              style: { margin: '8 5', zIndex: 999, minWidth: '120px' },
              labelStyle: { fontSize: '0.7em' },
              onClick: () => this.setState({ confirmUndoOpen: true })
            }),

            React.createElement(FlatButton, {
              key: 'save',
              icon: React.createElement(MdSave, { style: { height: '1.3em', width: '1.3em' } }),
              disabled: disabled || !hasAnyModifications,
              label: formatMessage({ id: 'save_new_version' }),
              style: { margin: '8 5', zIndex: 999 },
              labelStyle: { fontSize: '0.7em' },
              onClick: this.handleSave
            })
          ])
        ])
    );
  }
}

const mapStateToProps = state => ({
  stopPlace: state.stopPlace.current,
  mergeStopDialogOpen: state.stopPlace.mergeStopDialog
      ? state.stopPlace.mergeStopDialog.isOpen
      : false,
  mergeSource: state.stopPlace.mergeStopDialog,
  pathLink: state.stopPlace.pathLink,
  stopHasBeenModified: state.stopPlace.stopHasBeenModified,
  isMultiPolylinesEnabled: state.stopPlace.enablePolylines,
  activeElementTab: state.user.activeElementTab,
  showEditQuayAdditional: state.user.showEditQuayAdditional,
  showEditStopAdditional: state.user.showEditStopAdditional,
  mergingQuay: state.mapUtils.mergingQuay,
  mergingQuayDialogOpen: state.mapUtils.mergingQuayDialogOpen,
  deleteQuayDialogOpen: state.mapUtils.deleteQuayDialogOpen,
  deleteQuayImportedId: state.mapUtils.deleteQuayImportedId,
  deleteStopDialogOpen: state.mapUtils.deleteStopDialogOpen,
  deletingQuay: state.mapUtils.deletingQuay,
  versions: state.stopPlace.versions,
  originalPathLink: state.stopPlace.originalPathLink,
  moveQuayDialogOpen: state.mapUtils.moveQuayDialogOpen,
  moveQuayToNewStopDialogOpen: state.mapUtils.moveQuayToNewStopDialogOpen,
  movingQuay: state.mapUtils.movingQuay,
  movingQuayToNewStop: state.mapUtils.movingQuayToNewStop,
  activeMap: state.mapUtils.activeMap,
  canDeleteStop: getIn(state.roles, ['allowanceInfo', 'canDeleteStop'], false),
  canEditParentStop: getIn(state.roles, ['allowanceInfo', 'canEditParentStop'], false),
  originalStopPlace: state.stopPlace.originalCurrent,
  serverTimeDiff: state.user.serverTimeDiff,
  isFetchingMergeInfo: state.stopPlace.isFetchingMergeInfo,
  neighbourStopQuays: state.stopPlace.neighbourStopQuays,
  deleteStopDialogWarning: state.user.deleteStopDialogWarning,
  fetchOTPInfoMergeLoading: state.mapUtils.fetchOTPInfoMergeLoading,
  mergeQuayWarning: state.mapUtils.mergeQuayWarning,
  fetchOTPInfoDeleteLoading: state.mapUtils.fetchOTPInfoDeleteLoading,
  deleteQuayWarning: state.mapUtils.deleteQuayWarning
});

export default withApollo(
    injectIntl(connect(mapStateToProps)(EditStopGeneral))
);