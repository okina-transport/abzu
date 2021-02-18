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


import React from 'react';
import ModalityIconSvg from '../MainPage/ModalityIconSvg';
import {Popover, PopoverAnimationVertical} from 'material-ui/Popover';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import ImportedId from './ImportedId';
import {
    StopPlaceActions,
    AssessmentActions,
    EquipmentActions,
    UserActions
} from '../../actions/';
import {connect} from 'react-redux';
import TicketMachine from '../../static/icons/facilities/TicketMachine';
import BusShelter from '../../static/icons/facilities/BusShelter';
import debounce from 'lodash.debounce';
import Checkbox from 'material-ui/Checkbox';
import stopTypes, {unknownStopPlaceType} from '../../models/stopTypes';
import MdWC from 'material-ui/svg-icons/notification/wc';
import WaitingRoom from '../../static/icons/facilities/WaitingRoom';
import WheelChairPopover from './WheelChairPopover';
import {getIn} from '../../utils';
import equipmentHelpers from '../../modelUtils/equipmentHelpers';
import MdLanguage from 'material-ui/svg-icons/action/language';
import {getPrimaryDarkerColor} from '../../config/themeConfig';
import AltNamesDialog from '../Dialogs/AltNamesDialog';
import TariffZonesDialog from '../Dialogs/TariffZonesDialog';
import MdTransfer from 'material-ui/svg-icons/maps/transfer-within-a-station';
import WeightingPopover from './WeightingPopover';
import weightTypes, {weightColors, noValue} from '../../models/weightTypes';
import Sign512 from '../../static/icons/TransportSign';
import MdWarning from 'material-ui/svg-icons/alert/warning';
import ToolTippable from './ToolTippable';
import accessibilityAssessments from '../../models/accessibilityAssessments';
import MdKey from 'material-ui/svg-icons/communication/vpn-key';
import KeyValuesDialog from '../Dialogs/KeyValuesDialog';
import ModalitiesMenuItems from './ModalitiesMenuItems';
import {createStopPlaceHref} from '../../utils/';
import FlatButton from 'material-ui/FlatButton';
import TagsDialog from './TagsDialog';
import TagTray from '../MainPage/TagTray';
import BelongsToGroup from './../MainPage/BelongsToGroup';
import AutoComplete from 'material-ui/AutoComplete';
import {getStopPlaceName} from '../../graphql/Tiamat/actions';
import MenuItem from 'material-ui/MenuItem';
import MdSpinner from '../../static/icons/spinner';

class StopPlaceDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stopTypeOpen: false,
      weightingOpen: false,
      name: props.stopPlace.name || '',
      publicCode: props.stopPlace.publicCode || '',
      privateCode: props.stopPlace.privateCode || '',
      description: props.stopPlace.description || '',
      altNamesDialogOpen: false,
      tariffZoneOpen: false,
      tagsOpen: false,
      loading: false,
      currentStopPlaceName: props.stopPlace.name || ''
    };

    this.updateStopName = debounce(value => {
        this.setState({loading: true});
        this.props.dispatch(StopPlaceActions.changeStopName(value));
    }, 5);

    this.updateStopPublicCode = debounce(value => {
      this.props.dispatch(StopPlaceActions.changeStopPublicCode(value));
    }, 200);

    this.updateStopPrivateCode = debounce(value => {
      this.props.dispatch(StopPlaceActions.changeStopPrivateCode(value));
    }, 200);

    this.updateStopDescription = debounce(value => {
      this.props.dispatch(StopPlaceActions.changeStopDescription(value));
    }, 200);
      const searchStopName = (searchText) => {
          getStopPlaceName(this.props.client, searchText).then(result => {
              this.setState({
                  dataSource: result.data.stopPlaceNameRecommendations,
                  loading: false
              });
          });

      };

      this.debouncedSearchStopName = debounce(searchStopName, 1000);
  }

    handleOpenTags() {
        this.setState({
            stopTypeOpen: false,
            weightingOpen: false,
            altNamesDialogOpen: false,
            tariffZoneOpen: false,
            tagsOpen: true
        });
        if (this.props.keyValuesDialogOpen) {
            this.props.dispatch(UserActions.closeKeyValuesDialog());
        }
    }

  componentWillReceiveProps(nextProps) {
    this.setState({
      name: nextProps.stopPlace.name || '',
      publicCode: nextProps.stopPlace.publicCode || '',
      privateCode: nextProps.stopPlace.privateCode || '',
      description: nextProps.stopPlace.description || ''
    });
    if (
      nextProps.keyValuesDialogOpen &&
      this.props.keyValuesDialogOpen !== nextProps.keyValuesDialogOpen
    ) {
      this.setState({
        stopTypes: false,
        wheelChairOpen: false,
        altNamesDialogOpen: false,
        weightingOpen: false,
        tariffZoneOpen: false,
        tagsOpen: false
      });
    }
  }

    handleCloseStopPlaceTypePopover() {
        this.setState({
            stopTypeOpen: false
        });
    }

    handleOpenKeyValues() {
        this.setState({
            tariffZoneOpen: false,
            altNamesDialogOpen: false,
            tagsOpen: false,
        });
        this.props.dispatch(
            UserActions.openKeyValuesDialog(this.props.stopPlace.keyValues, 'stopPlace', null)
        );
    }

    handleOpenAltNames() {
        this.setState({
            stopTypes: false,
            wheelChairOpen: false,
            altNamesDialogOpen: true,
            weightingOpen: false,
            tariffZoneOpen: false,
            tagsOpen: false
        });
        if (this.props.keyValuesDialogOpen) {
            this.props.dispatch(UserActions.closeKeyValuesDialog());
        }
    }

    handleOpenTZDialog() {
        this.setState({
            stopTypes: false,
            wheelChairOpen: false,
            altNamesDialogOpen: false,
            weightingOpen: false,
            tariffZoneOpen: true,
            tagsOpen: false
        });
        if (this.props.keyValuesDialogOpen) {
            this.props.dispatch(UserActions.closeKeyValuesDialog());
        }
    }

    handleOpenStopPlaceTypePopover(event) {
        this.setState({
            stopTypeOpen: true,
            wheelChairOpen: false,
            stopTypeAnchorEl: event.currentTarget,
            altNamesDialogOpen: false,
            weightingOpen: false,
            tagsOpen: false
        });
    }

    getWeightingStateColor(stopPlace) {
        const weightingValue = stopPlace.weighting;
        return weightColors[weightingValue] || 'grey';
    }

    getNameForWeightingState(stopPlace, locale) {
        const weightingValue = stopPlace.weighting;
        const types = weightTypes[locale];

        for (let i = 0; i < types.length; i++) {
            if (types[i].value === weightingValue) {
                return types[i].name;
            }
        }
        return noValue[locale];
    }

    handleOpenWeightPopover(event) {
        this.setState({
            weightingOpen: true,
            weightingAnchorEl: event.currentTarget,
            wheelChairOpen: false,
            stopTypeOpen: false,
            altNamesDialogOpen: false
        });
    }

    handleUpdateStopName(searchText, dataSource) {
        this.updateStopName(searchText);
        this.debouncedSearchStopName(searchText, dataSource);
    }

    handleStopNameSelected(event) {
        const name = event.value.props.primaryText.props.children;
        this.setState({
            name: name
        });
        this.updateStopName(name);
    }

  handleStopPublicCodeChange(event) {
    const publicCode = event.target.value;
    this.setState({
      publicCode
    });

    this.updateStopPublicCode(publicCode);
  }

  handleStopPrivateCodeChange(event) {
    const privateCode = event.target.value;
    this.setState({
      privateCode
    });

    this.updateStopPrivateCode(privateCode);
  }

  handleStopDescriptionChange(event) {
    const description = event.target.value;
    this.setState({
      description: description
    });

        this.updateStopDescription(description);
    }

    handleHandleWheelChair(value) {
        if (!this.props.disabled)
            this.props.dispatch(AssessmentActions.setStopWheelchairAccess(value));
    }

    handleStopTypeChange(stopType) {
        this.handleCloseStopPlaceTypePopover();
        this.props.dispatch(StopPlaceActions.changeStopType(stopType));
    }

    handleSubModeTypeChange(stopType, transportMode, submode) {
        this.handleCloseStopPlaceTypePopover();
        this.props.dispatch(StopPlaceActions.changeSubmode(stopType, transportMode, submode));
    }

    handleTicketMachineChange(value) {
        if (!this.props.disabled) {
            this.props.dispatch(
                EquipmentActions.updateTicketMachineState(
                    value,
                    'stopPlace',
                    this.props.stopPlace.id
                )
            );
        }
    }

    handleBusShelterChange(value) {
        if (!this.props.disabled) {
            this.props.dispatch(
                EquipmentActions.updateShelterEquipmentState(
                    value,
                    'stopPlace',
                    this.props.stopPlace.id
                )
            );
        }
    }

    handleWCChange(value) {
        if (!this.props.disabled) {
            this.props.dispatch(
                EquipmentActions.updateSanitaryState(
                    value,
                    'stopPlace',
                    this.props.stopPlace.id
                )
            );
        }
    }

    handleWaitingRoomChange(value) {
        if (!this.props.disabled) {
            this.props.dispatch(
                EquipmentActions.updateWaitingRoomState(
                    value,
                    'stopPlace',
                    this.props.stopPlace.id
                )
            );
        }
    }

    handleWeightChange(value) {
        const {dispatch} = this.props;
        dispatch(StopPlaceActions.changeWeightingForStop(value));
        this.setState({
            weightingOpen: false,
        });
    }

    handleChangeSign512(value) {
        if (!this.props.disabled) {
            this.props.dispatch(
                EquipmentActions.update512SignState(
                    value,
                    'stopPlace',
                    this.props.stopPlace.id
                )
            );
        }
    }

    getStopTypeTranslation(locale, stopPlaceType, submode) {
        let translations = stopTypes[locale].filter(
            type => type.value === stopPlaceType
        );

        if (translations && translations.length) {

            let submodes = translations[0].submodes;

            if (submode && submodes) {
                for (let i = 0; i < submodes.length; i++) {
                    if (submodes[i].value === submode) {
                        return submodes[i].name;
                    }
                }
            }

            return translations[0].name;
        }

        return unknownStopPlaceType[locale];
    }

    getMenuItems(dataSource, nextProps, currentStopPlaceName) {
        const {formatMessage} = nextProps.intl;
        let menuItems = [];

        if (dataSource && dataSource.length) {
            menuItems = [
                {
                    text: '',
                    value: (
                        <MenuItem
                            style={{paddingLeft: 10, paddingRight: 10, width: 'auto'}}
                            primaryText={
                                <div style={{fontWeight: 600, fontSize: '0.8em'}}>
                                    {dataSource}
                                </div>
                            }
                        />
                    )
                }
            ];
        } else if (nextProps.stopPlace.name != currentStopPlaceName) {
            menuItems = [
                {
                    text: '',
                    value: (
                        <MenuItem
                            style={{paddingLeft: 10, paddingRight: 10, width: 'auto', pointerEvents: 'none'}}
                            primaryText={
                                <div style={{fontWeight: 600, fontSize: '0.8em'}}>
                                    {formatMessage({id: 'conforming_name'})}
                                    <IconButton
                                        iconClassName="material-icons"
                                        style={{verticalAlign: 'middle'}}
                                        iconStyle={{color: '#24a027'}}
                                    >
                                        done
                                    </IconButton>
                                </div>
                            }
                        />
                    )
                }
            ];
        }

        return menuItems;
    }

    render() {

        const fixedHeader = {
            position: 'relative',
            display: 'block'
        };

    const { stopPlace, intl, expanded, disabled, isPublicCodePrivateCodeEnabled } = this.props;
    const { formatMessage, locale } = intl;

        const isChildOfParent = stopPlace.isChildOfParent;

    const {
      name,
      publicCode,
      privateCode,
      description,
      altNamesDialogOpen,
      weightingOpen,
      weightingAnchorEl,
      tariffZoneOpen,
      loading,
      dataSource,
      currentStopPlaceName
    } = this.state;

        const wheelchairAccess = getIn(
            stopPlace,
            ['accessibilityAssessment', 'limitations', 'wheelchairAccess'],
            'UNKNOWN'
        );

        const ticketMachine = equipmentHelpers.getTicketMachineState(stopPlace);
        const busShelter = equipmentHelpers.getShelterEquipmentState(stopPlace);
        const waitingRoom = equipmentHelpers.getWaitingRoomState(stopPlace);
        const WC = equipmentHelpers.getSanitaryEquipmentState(stopPlace);
        const sign512 = equipmentHelpers.get512SignEquipment(stopPlace);

        const hasAltNames = !!(
            stopPlace.alternativeNames && stopPlace.alternativeNames.length
        );

    const stopTypeHint = this.getStopTypeTranslation(
      locale,
      stopPlace.stopPlaceType,
      stopPlace.submode
    );
    const weightingStateHint = this.getNameForWeightingState(stopPlace, locale);
    const expirationText = formatMessage({ id: 'stop_has_expired' });
    const permanentlyTerminatedText = formatMessage({ id: 'stop_has_been_permanently_terminated' });
    const versionLabel = formatMessage({ id: 'version' });
    const keyValuesHint = formatMessage({ id: 'key_values_hint' });

        const wheelChairHint =
            accessibilityAssessments.wheelchairAccess.values[locale][
                wheelchairAccess
                ];
        const ticketMachineHint = ticketMachine
            ? formatMessage({id: 'ticketMachine'})
            : formatMessage({id: 'ticketMachine_no'});
        const busShelterHint = busShelter
            ? formatMessage({id: 'busShelter'})
            : formatMessage({id: 'busShelter_no'});
        const WCHint = WC
            ? formatMessage({id: 'wc'})
            : formatMessage({id: 'wc_no'});
        const waitingRoomHint = waitingRoom
            ? formatMessage({id: 'waiting_room'})
            : formatMessage({id: 'waiting_room_no'});
        const transportSignHint = sign512
            ? formatMessage({id: 'transport_sign'})
            : formatMessage({id: 'transport_sign_no'});
        const tariffZonesHint = formatMessage({id: 'tariffZones'});
        const altNamesHint = formatMessage({id: 'alternative_names'});
        const belongsToParent = formatMessage({id: 'belongs_to_parent'});

        const parentStopHref = belongsToParent ? createStopPlaceHref(getIn(stopPlace, ['parentStop', 'id'], null)) : '';
        const primaryDarker = getPrimaryDarkerColor();

        const menuItems = this.getMenuItems(dataSource, this.props, currentStopPlaceName);
        const Loading = loading && [
            {
                text: '',
                value: (
                    <MenuItem
                        style={{paddingRight: 10, width: 'auto'}}
                        primaryText={
                            <div
                                style={{
                                    fontWeight: 600,
                                    fontSize: '0.8em',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <MdSpinner/>
                                <div style={{marginLeft: 5}}>
                                    {formatMessage({id: 'loading'})}
                                </div>
                            </div>
                        }
                    />
                )
            }
        ];

        return (
            <div style={fixedHeader}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <div style={{flex: 1}}>
                        {isChildOfParent &&
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <span style={{fontWeight: 600, fontSize: '0.9em'}}>{belongsToParent}</span>
                            <a target="_blank" style={{fontSize: '0.8em'}} href={parentStopHref}>{stopPlace.parentStop.id}</a>
                        </div>
                        }
                        {!stopPlace.isNewStop &&
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <span style={{fontWeight: 600}}>
                  {versionLabel} {stopPlace.version}
                </span>
                {stopPlace.hasExpired &&
                  <div style={{ display: 'flex', alignItems: 'center', flex: 2 }}>
                    <MdWarning
                      color="orange"
                      style={{ marginTop: -5, marginLeft: 10 }}
                    />
                    <span style={{ color: '#bb271c', marginLeft: 5, fontSize: '0.8em' }}>
                      {stopPlace.permanentlyTerminated ? permanentlyTerminatedText: expirationText}
                    </span>
                  </div>}
                <FlatButton onClick={this.handleOpenTags.bind(this)} style={{marginTop: -8}} label={formatMessage({id: 'tags'})}/>
              </div>}
              <div style={{padding: 5}}>
                <TagTray
                  tags={stopPlace.tags}
                  textSize={'0.7em'}
                  style={{display: 'flex', flexWrap: 'wrap'}}
                />
              </div>
            <div style={{ display: 'flex'}}>
              <ImportedId
                id={stopPlace.importedId}
                text={formatMessage({ id: 'local_reference' })}
              />
              <div style={{display: 'flex', marginLeft: 'auto'}}>
                <ToolTippable toolTipText={keyValuesHint}>
                  <IconButton
                    style={{
                      borderBottom: disabled ? 'none' : '1px dotted grey'
                    }}
                    onClick={this.handleOpenKeyValues.bind(this)}
                  >
                    <MdKey
                      color={
                        (stopPlace.keyValues || []).length
                          ? primaryDarker
                          : '#000'
                      }
                    />
                  </IconButton>
                </ToolTippable>
                <ToolTippable toolTipText={stopTypeHint}>
                  <IconButton
                    style={{
                      borderBottom: disabled ? 'none' : '1px dotted grey',
                      marginLeft: 5
                    }}
                    onClick={e => {
                      this.handleOpenStopPlaceTypePopover(e);
                    }}
                  >
                    <ModalityIconSvg type={stopPlace.stopPlaceType} submode={stopPlace.submode}/>
                  </IconButton>
                </ToolTippable>
                <Popover
                  open={this.state.stopTypeOpen}
                  anchorEl={this.state.stopTypeAnchorEl}
                  anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                  targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                  onRequestClose={this.handleCloseStopPlaceTypePopover.bind(
                    this
                  )}
                  animation={PopoverAnimationVertical}
                  style={{ overflowY: 'none' }}
                  animated={true}
                >
                  <ModalitiesMenuItems
                    handleSubModeTypeChange={this.handleSubModeTypeChange.bind(this)}
                    handleStopTypeChange={this.handleStopTypeChange.bind(this)}
                    stopPlaceTypeChosen={stopPlace.stopPlaceType}
                    submodeChosen={stopPlace.submode}
                    stopTypes={stopTypes[locale]}
                  />
                </Popover>
              </div>
            </div>
          </div>
        </div>
        {stopPlace.belongsToGroup && (
          <BelongsToGroup
            formatMessage={formatMessage}
            groups={stopPlace.groups}
            style={{marginTop: 5}}
            />
        )}
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <AutoComplete
                textFieldStyle={{width: 300}}
                animated={false}
                openOnFocus
                hintText={formatMessage({id: 'name'})}
                dataSource={
                    loading ? Loading : menuItems || []
                }
                filter={(searchText, key) => searchText !== ''}
                onUpdateInput={this.handleUpdateStopName.bind(this)}
                searchText={this.props.searchText || name}
                ref="searchText"
                onNewRequest={this.handleStopNameSelected.bind(this)}
                listStyle={{width: 'auto'}}
                errorText={(name && name.trim().length) ? '' : formatMessage({id: 'name_is_required'})}
                style={{marginTop: -10, width: 300}}
            />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ToolTippable toolTipText={tariffZonesHint}>
              <div
                onClick={this.handleOpenTZDialog.bind(this)}
                style={{
                  borderBottom: '1px dotted',
                  marginTop: 13,
                  paddingBottom: 4,
                  marginLeft: 8,
                  cursor: 'pointer'
                }}
              >
                <span
                    style={{
                        fontSize: 18,
                        color: (stopPlace.tariffZones || []).length
                            ? primaryDarker
                            : '#000'
                    }}
                >
                  Tz
                </span>
              </div>
            </ToolTippable>
            <div
              style={{
                borderBottom: '1px dotted',
                marginLeft: 19,
                marginTop: -3
              }}
            >
              <ToolTippable toolTipText={altNamesHint}>
                <IconButton onClick={this.handleOpenAltNames.bind(this)}>
                  <MdLanguage
                    color={hasAltNames ? primaryDarker : '#000'}
                  />
                </IconButton>
              </ToolTippable>
            </div>
          </div>
        </div>
                {isPublicCodePrivateCodeEnabled && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                            hintText={formatMessage({ id: 'publicCode' })}
                            floatingLabelText={formatMessage({ id: 'publicCode' })}
                            style={{ width: 170, marginTop: -10, marginRight: 25 }}
                            disabled={disabled}
                            value={publicCode}
                            onChange={this.handleStopPublicCodeChange.bind(this)} />
                        <TextField
                            hintText={formatMessage({ id: 'privateCode' })}
                            floatingLabelText={formatMessage({ id: 'privateCode' })}
                            style={{ width: 170, marginTop: -10, marginRight: 25 }}
                            disabled={disabled}
                            value={privateCode}
                            onChange={this.handleStopPrivateCodeChange.bind(this)} />
                    </div>
                )}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            hintText={formatMessage({ id: 'description' })}
            floatingLabelText={formatMessage({ id: 'description' })}
            style={{ width: 340, marginTop: -10 }}
            disabled={disabled}
            value={description}
            onChange={this.handleStopDescriptionChange.bind(this)}
          />
          <ToolTippable
            toolTipText={weightingStateHint}
            style={{ marginLeft: 6, borderBottom: '1px dotted', marginTop: -3 }}
          >
            <IconButton
              onClick={e => {
                this.handleOpenWeightPopover(e);
              }}
            >
              <MdTransfer color={this.getWeightingStateColor(stopPlace)} />
            </IconButton>
            <WeightingPopover
              open={!disabled && weightingOpen}
              anchorEl={this.state.weightingAnchorEl}
              handleChange={v => this.handleWeightChange(v)}
              locale={locale}
              handleClose={() => {
                this.setState({ weightingOpen: false });
              }}
            />
          </ToolTippable>
        </div>
        {expanded
          ? null
          : <div
              style={{
                marginTop: 10,
                marginBottom: 10,
                height: 15,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center'
              }}
            >
              <ToolTippable toolTipText={wheelChairHint}>
                <WheelChairPopover
                  intl={intl}
                  handleChange={this.handleHandleWheelChair.bind(this)}
                  wheelchairAccess={wheelchairAccess}
                />
              </ToolTippable>
              <ToolTippable toolTipText={ticketMachineHint}>
                <Checkbox
                  checkedIcon={<TicketMachine />}
                  uncheckedIcon={
                    <TicketMachine
                      style={{ fill: '#8c8c8c', opacity: '0.8' }}
                    />
                  }
                  style={{ width: 'auto' }}
                  checked={ticketMachine}
                  onCheck={(e, v) => {
                    this.handleTicketMachineChange(v);
                  }}
                />
              </ToolTippable>
              <ToolTippable toolTipText={busShelterHint}>
                <Checkbox
                  checkedIcon={<BusShelter />}
                  uncheckedIcon={
                    <BusShelter style={{ fill: '#8c8c8c', opacity: '0.8' }} />
                  }
                  style={{ width: 'auto' }}
                  checked={busShelter}
                  onCheck={(e, v) => {
                    this.handleBusShelterChange(v);
                  }}
                />
              </ToolTippable>
              <ToolTippable toolTipText={WCHint}>
                <Checkbox
                  checkedIcon={<MdWC />}
                  uncheckedIcon={
                    <MdWC style={{ fill: '#8c8c8c', opacity: '0.8' }} />
                  }
                  style={{ width: 'auto' }}
                  checked={WC}
                  onCheck={(e, v) => {
                    this.handleWCChange(v);
                  }}
                />
              </ToolTippable>
              <ToolTippable toolTipText={waitingRoomHint}>
                <Checkbox
                  checkedIcon={<WaitingRoom />}
                  uncheckedIcon={
                    <WaitingRoom style={{ fill: '#8c8c8c', opacity: '0.8' }} />
                  }
                  style={{ width: 'auto' }}
                  checked={waitingRoom}
                  onCheck={(e, v) => {
                    this.handleWaitingRoomChange(v);
                  }}
                />
              </ToolTippable>
              <ToolTippable toolTipText={transportSignHint}>
                <Checkbox
                  checkedIcon={
                    <Sign512
                      style={{
                        transform:
                          'scale(1) translateY(-12px) translateX(-12px)'
                      }}
                    />
                  }
                  uncheckedIcon={
                    <Sign512
                      style={{
                        transform:
                          'scale(1) translateY(-12px) translateX(-12px)',
                        fill: '#8c8c8c',
                        opacity: '0.8'
                      }}
                    />
                  }
                  style={{ width: 'auto' }}
                  checked={sign512}
                  onCheck={(e, v) => {
                    this.handleChangeSign512(v);
                  }}
                />
              </ToolTippable>
            </div>}
        <AltNamesDialog
          open={altNamesDialogOpen}
          altNames={stopPlace.alternativeNames}
          intl={intl}
          disabled={disabled}
          handleClose={() => {
            this.setState({ altNamesDialogOpen: false });
          }}
        />
        <TagsDialog
          open={this.state.tagsOpen}
          tags={stopPlace.tags}
          intl={intl}
          disabled={disabled}
          handleClose={() => {
            this.setState({ tagsOpen: false });
          }}
        />
        <TariffZonesDialog
          open={tariffZoneOpen}
          tariffZones={stopPlace.tariffZones}
          intl={intl}
          disabled={disabled}
          handleClose={() => {
            this.setState({ tariffZoneOpen: false });
          }}
        />
        <KeyValuesDialog
          intl={intl}
          disabled={disabled}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  stopPlace: state.stopPlace.current,
  isPublicCodePrivateCodeEnabled: state.stopPlace.enablePublicCodePrivateCodeOnStopPlaces,
  keyValuesDialogOpen: state.user.keyValuesDialogOpen,
  client: state.user.client

});

export default connect(mapStateToProps)(StopPlaceDetails);
