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
import {ParkingActions, UserActions} from '../../actions/';
import {connect} from 'react-redux';
import debounce from 'lodash.debounce';
import ToolTippable from '../EditStopPage/ToolTippable';
import {unknownParkingType} from "../../models/parkingType";
import {deleteParking, getName} from "../../graphql/Tiamat/actions";
import ModalitiesParkingMenuItems from "./ModalitiesParkingMenuItems";
import parkingTypes from "../../models/parkingTypes";
import Item from "../EditStopPage/Item";
import TextField from "material-ui/TextField";
import ParkingItemPayAndRideExpandedFields from "../EditStopPage/ParkingItemPayAndRideExpandedFields";
import ConfirmDialog from "../Dialogs/ConfirmDialog";
import * as types from "../../actions/Types";
import AutoComplete from "material-ui/AutoComplete";
import MenuItem from "material-ui/MenuItem";
import MdSpinner from "../../static/icons/spinner";
import {getPrimaryDarkerColor} from "../../config/themeConfig";
import MdKey from "material-ui/svg-icons/communication/vpn-key";
import KeyValuesDialog from "../Dialogs/KeyValuesDialog";
import parkingTypesOfParkingRef from "../../models/parkingTypesOfParkingRef";
import parkingTypesCovered from "../../models/parkingTypesCovered";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import ParkingTypeOfParkingRefMenuItems from "./ParkingTypeOfParkingRefMenuItems";
import ParkingCoveredMenuItems from "./ParkingCoveredMenuItems";
import {Button} from "@material-ui/core";

class ParkingDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            parkingTypeOpen: false,
            weightingOpen: false,
            name: props.parking.name || '',
            description: props.parking.description || '',
            tagsOpen: false,
            loading: false,
            currentParkingName: props.parking.name || '',
            confirmDeleteDialogOpen: false,
            activeTabIndex: 0
        };

        this.updateParkingName = debounce(value => {
            this.setState({loading: true});
            this.props.dispatch(ParkingActions.changeParkingNameTitle(value));
        }, 5);

        const searchParkingName = (searchText) => {
            getName(this.props.client, searchText).then(result => {
                this.setState({
                    dataSource: result.data.nameRecommendations,
                    loading: false
                });
            });
        };

        this.debouncedSearchParkingName = debounce(searchParkingName, 1000);

        this.updateParkingDescription = debounce(value => {
            this.props.dispatch(ParkingActions.changeParkingDescription(value));
        }, 200);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            name: nextProps.parking.name || '',
            description: nextProps.parking.description || ''
        });
        if (
            nextProps.keyValuesDialogOpen &&
            this.props.keyValuesDialogOpen !== nextProps.keyValuesDialogOpen
        ) {
            this.setState({
                parkingTypes: false,
                wheelChairOpen: false,
                altNamesDialogOpen: false,
                weightingOpen: false,
                tariffZoneOpen: false,
                tagsOpen: false
            });
        }
    }

    handleTabOnChange = value => {
        this.setState({
            activeTabIndex: value,
        });
    };


    handleCloseParkingTypePopover() {
        this.setState({
            parkingTypeOpen: false
        });
    }

    handleOpenParkingTypePopover(event) {
        this.setState({
            parkingTypeOpen: true,
            wheelChairOpen: false,
            parkingTypeAnchorEl: event.currentTarget,
            weightingOpen: false,
        });
    }

    handleCloseParkingCoveredPopover() {
        this.setState({
            parkingCoveredOpen: false
        });
    }

    handleOpenParkingCoveredPopover(event) {
        this.setState({
            parkingTypeOpen: false,
            wheelChairOpen: false,
            parkingCoveredAnchorEl: event.currentTarget,
            weightingOpen: false,
            parkingTypeOfParkingRefOpen: false,
            parkingSecureOpen: false,
            parkingCoveredOpen: true
        });
    }

    handleCloseParkingTypeOfParkingRefPopover() {
        this.setState({
            parkingTypeOfParkingRefOpen: false
        });
    }

    handleOpenParkingTypeOfParkingRefPopover(event) {
        this.setState({
            parkingTypeOpen: false,
            wheelChairOpen: false,
            parkingTypeOfParkingRefAnchorEl: event.currentTarget,
            weightingOpen: false,
            parkingSecureOpen: false,
            parkingCoveredOpen: false,
            parkingTypeOfParkingRefOpen: true
        });
    }


    handleParkingTypeChange(parkingType) {
        this.handleCloseParkingTypePopover();
        this.props.dispatch(ParkingActions.changeParkingType(parkingType));
    }

    handleParkingCoveredChange(parkingCovered) {
        this.handleCloseParkingCoveredPopover();
        this.props.dispatch(ParkingActions.changeParkingCovered(parkingCovered));
    }

    handleParkingTypeOfParkingRefChange(parkingTypeOfParkingRef) {
        this.handleCloseParkingTypeOfParkingRefPopover();
        this.props.dispatch(ParkingActions.changeParkingTypeOfParkingRef(parkingTypeOfParkingRef));
    }

    handleSetSecureAvailable(value) {
        this.props.dispatch(ParkingActions.changeParkingSecureAvailable(value));
    }


    getParkingTypeTranslation(locale, parkingType) {
        let translations = parkingTypes[locale].filter(
            type => type.value === parkingType
        );

        if (translations && translations.length) {
            return translations[0].name;
        }

        return unknownParkingType[locale];
    }

    getParkingCoveredTranslation(locale, parkingTypeCovered) {
        let translations = parkingTypesCovered[locale].filter(
            type => type.value === parkingTypeCovered
        );

        if (translations && translations.length) {
            return translations[0].name;
        }
    }

    getParkingTypeOfParkingRefTranslation(locale, parkingTypeOfParkingRef) {
        let translations = parkingTypesOfParkingRef[locale].filter(
            type => type.value === parkingTypeOfParkingRef
        );

        if (translations && translations.length) {
            return translations[0].name;
        }
    }


    handleSetTotalCapacity(value) {
        const {dispatch, index} = this.props;
        dispatch(ParkingActions.changeParkingTotalCapacity(index, value));
    }

    handleUpdateParkingName(searchText, dataSource) {
        this.updateParkingName(searchText);
        this.debouncedSearchParkingName(searchText, dataSource);
    }

    handleParkingNameSelected(event) {
        const name = event.value.props.primaryText.props.children;
        this.setState({
            name: name
        });
        this.updateParkingName(name);
    }

    handleSetParkingLayout(value) {
        const {dispatch, index} = this.props;
        dispatch(ParkingActions.changeParkingLayout(index, value));
    }

    handleSetParkingPaymentProcess(value) {
        const {dispatch, index} = this.props;
        dispatch(ParkingActions.changeParkingPaymentProcess(index, value));
    }

    handleSetRechargingAvailable(value) {
        const {dispatch, index} = this.props;
        dispatch(ParkingActions.changeParkingRechargingAvailable(index, value));
    }

    handleSetCarpoolingAvailable(value) {
        const {dispatch, index} = this.props;
        dispatch(ParkingActions.changeParkingCarpoolingAvailable(index, value));
    }

    handleSetCarsharingAvailable(value) {
        const {dispatch, index} = this.props;
        if (!value) {
            this.handleSetNumberOfCarsharingSpaces(0);
        }
        dispatch(ParkingActions.changeParkingCarsharingAvailable(index, value));
    }

    handleSetNumberOfSpaces(value) {
        const {dispatch, index} = this.props;
        dispatch(ParkingActions.changeParkingNumberOfSpaces(index, value));
    }

    handleSetNumberOfSpacesWithRechargePoint(value) {
        const {dispatch, index} = this.props;
        dispatch(ParkingActions.changeParkingNumberOfSpacesWithRechargePoint(index, value));
    }

    handleSetNumberOfCarsharingSpaces(value) {
        const {dispatch, index} = this.props;
        dispatch(ParkingActions.changeParkingNumberOfCarsharingSpaces(index, value));
    }

    handleSetNumberOfCarpoolingSpaces(value) {
        const {dispatch, index} = this.props;
        dispatch(ParkingActions.changeParkingNumberOfCarpoolingSpaces(index, value));
    }

    handleSetNumberOfSpacesForRegisteredDisabledUserType(value) {
        const {dispatch, index} = this.props;
        dispatch(ParkingActions.changeParkingNumberOfSpacesForRegisteredDisabledUserType(index, value));
    }

    handleConfirmParking() {
        const {parking, index, dispatch, client} = this.props;

        if (parking.id) {
            deleteParking(client, parking.id).then(() => {
                dispatch(ParkingActions.removeElementByType(index, 'parking'));
                dispatch(UserActions.openSnackbar(types.SUCCESS));
            });
        } else {
            dispatch(ParkingActions.removeElementByType(index, 'parking'));
        }

        this.setState({
            confirmDeleteDialogOpen: false
        });
    }

    handleOpenKeyValues() {
        this.setState({
            tariffZoneOpen: false,
            altNamesDialogOpen: false,
            tagsOpen: false,
        });
        this.props.dispatch(
            UserActions.openKeyValuesDialog(this.props.parking.keyValues, 'parking', null)
        );
    }

    handleParkingDescriptionChange(event) {
        const description = event.target.value;
        this.setState({
            description: description
        });
        this.updateParkingDescription(description);
    }

    getMenuItems(dataSource, nextProps, currentParkingName) {
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
        } else if (nextProps.parking.name !== currentParkingName) {
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

        const style = {
            background: '#fff'
        };

        const tabStyle = {
            color: '#000',
            fontSize: '0.7em',
            fontWeight: 600,
            marginTop: -10,
        };

        const {parking, intl, disabled, translations, index, activeTabIndex} = this.props;
        const {formatMessage, locale} = intl;

        const parkingTypeHint = this.getParkingTypeTranslation(
            locale,
            parking.parkingType
        );

        const parkingCoveredHint = this.getParkingCoveredTranslation(
            locale,
            parking.covered
        );

        const parkingTypeOfParkingRefHint = this.getParkingTypeOfParkingRefTranslation(
            locale,
            parking.typeOfParkingRef
        );

        let totalCapacity = parking.totalCapacity || 0;

        const {
            name,
            description,
            loading,
            dataSource,
            currentParkingName,
            parkingCoveredOpen,
            parkingCoveredAnchorEl,
            parkingTypeOfParkingRefOpen,
            parkingTypeOfParkingRefAnchorEl
        } = this.state;

        const menuItems = this.getMenuItems(dataSource, this.props, currentParkingName);

        const keyValuesHint = formatMessage({id: 'key_values_hint'});
        const primaryDarker = getPrimaryDarkerColor();


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
                        <div style={{display: 'flex'}}>
                            <div style={{display: 'flex'}}>
                                <AutoComplete
                                    textFieldStyle={{width: 300}}
                                    animated={false}
                                    openOnFocus
                                    hintText={formatMessage({id: 'name'})}
                                    dataSource={
                                        loading ? Loading : menuItems || []
                                    }
                                    filter={(searchText, key) => searchText !== ''}
                                    onUpdateInput={this.handleUpdateParkingName.bind(this)}
                                    searchText={this.props.searchText || name}
                                    ref="searchText"
                                    onNewRequest={this.handleParkingNameSelected.bind(this)}
                                    listStyle={{width: 'auto'}}
                                    errorText={(name && name.trim().length) ? '' : formatMessage({id: 'name_is_required'})}
                                    style={{
                                        width: 300,
                                        marginTop:10
                                    }}
                                />
                                <ToolTippable toolTipText={parkingTypeHint}>
                                    <IconButton
                                        style={{
                                            borderBottom: disabled ? 'none' : '1px dotted grey',
                                            position: 'absolute',
                                            right: 0
                                        }}
                                        onClick={e => {this.handleOpenParkingTypePopover(e);}}
                                    >
                                        <ModalityIconSvg type={parking.parkingType} secure={parking.secure} typeOfParkingRef={parking.typeOfParkingRef}/>
                                    </IconButton>
                                </ToolTippable>
                                <Popover
                                    open={this.state.parkingTypeOpen}
                                    anchorEl={this.state.parkingTypeAnchorEl}
                                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                                    onRequestClose={this.handleCloseParkingTypePopover.bind(this)}
                                    animation={PopoverAnimationVertical}
                                    style={{overflowY: 'none'}}
                                    animated={true}
                                >
                                    <ModalitiesParkingMenuItems
                                        handleParkingTypeChange={this.handleParkingTypeChange.bind(this)}
                                        parkingTypeChosen={parking.parkingType}
                                        parkingTypes={parkingTypes[locale]}
                                    />
                                </Popover>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <TextField
                        hintText={formatMessage({id: 'description'})}
                        floatingLabelText={formatMessage({id: 'description'})}
                        style={{width: 340, marginTop: -10}}
                        disabled={true}
                        value={description}
                        onChange={this.handleParkingDescriptionChange.bind(this)}
                    />
                    <ToolTippable toolTipText={keyValuesHint}>
                        <IconButton
                            style={{borderBottom: disabled ? 'none' : '1px dotted grey'}}
                            onClick={this.handleOpenKeyValues.bind(this)}
                        >
                            <MdKey
                                color={
                                    (parking.keyValues || []).length
                                        ? primaryDarker
                                        : '#000'
                                }
                            />
                        </IconButton>
                    </ToolTippable>
                    <KeyValuesDialog
                        intl={intl}
                        disabled={disabled}
                    />
                </div>
                <Item>
                    <div className="pr-item-expanded">
                        {(parking.parkingType !== 'undefined'  ) ? (
                            <ParkingItemPayAndRideExpandedFields
                                disabled={disabled}
                                hasExpired={parking.hasExpired}
                                parkingLayout={parking.parkingLayout}
                                parkingPaymentProcess={parking.parkingPaymentProcess}
                                rechargingAvailable={parking.rechargingAvailable}
                                carpoolingAvailable={parking.carpoolingAvailable}
                                carsharingAvailable={parking.carsharingAvailable}
                                totalCapacity={totalCapacity}
                                numberOfSpaces={parking.numberOfSpaces}
                                numberOfSpacesWithRechargePoint={parking.numberOfSpacesWithRechargePoint}
                                numberOfCarsharingSpaces={parking.numberOfCarsharingSpaces}
                                numberOfCarpoolingSpaces={parking.numberOfCarpoolingSpaces}
                                numberOfSpacesForRegisteredDisabledUserType={parking.numberOfSpacesForRegisteredDisabledUserType}
                                handleSetParkingLayout={this.handleSetParkingLayout.bind(this)}
                                handleSetParkingPaymentProcess={this.handleSetParkingPaymentProcess.bind(this)}
                                handleSetRechargingAvailable={this.handleSetRechargingAvailable.bind(this)}
                                handleSetCarpoolingAvailable={this.handleSetCarpoolingAvailable.bind(this)}
                                handleSetCarsharingAvailable={this.handleSetCarsharingAvailable.bind(this)}
                                handleSetNumberOfSpaces={this.handleSetNumberOfSpaces.bind(this)}
                                handleSetNumberOfSpacesWithRechargePoint={this.handleSetNumberOfSpacesWithRechargePoint.bind(this)}
                                handleSetNumberOfCarsharingSpaces={this.handleSetNumberOfCarsharingSpaces.bind(this)}
                                handleSetNumberOfCarpoolingSpaces={this.handleSetNumberOfCarpoolingSpaces.bind(this)}
                                handleSetNumberOfSpacesForRegisteredDisabledUserType={this.handleSetNumberOfSpacesForRegisteredDisabledUserType.bind(this)}
                                handleTabOnChange={this.handleTabOnChange.bind(this)}
                                style={style}
                                tabStyle={tabStyle}
                                activeTabIndex={activeTabIndex}
                                parking={parking}
                                index={index}
                                intl1={intl}
                                parkingCoveredHint={parkingCoveredHint}
                                parkingTypeOfParkingRefHint={parkingTypeOfParkingRefHint}
                                handleOpenParkingCoveredPopover={this.handleOpenParkingCoveredPopover.bind(this)}
                                handleOpenParkingTypeOfParkingRefPopover={this.handleOpenParkingTypeOfParkingRefPopover.bind(this)}
                                handleCloseParkingCoveredPopover={this.handleCloseParkingCoveredPopover.bind(this)}
                                handleCloseParkingTypeOfParkingRefPopover={this.handleCloseParkingTypeOfParkingRefPopover.bind(this)}
                                handleSetSecureAvailable={this.handleSetSecureAvailable.bind(this)}
                                handleParkingTypeOfParkingRefChange={this.handleParkingTypeOfParkingRefChange.bind(this)}
                                parkingCoveredOpen={parkingCoveredOpen}
                                handleParkingCoveredChange={this.handleParkingCoveredChange.bind(this)}
                                parkingCoveredAnchorEl={parkingCoveredAnchorEl}
                                parkingTypeOfParkingRefOpen={parkingTypeOfParkingRefOpen}
                                parkingTypeOfParkingRefAnchorEl={parkingTypeOfParkingRefAnchorEl}
                                locale={locale}/>
                        ) : (
                            <TextField
                                hintText={translations.capacity}
                                disabled={disabled || parking.hasExpired}
                                floatingLabelText={translations.capacity}
                                onChange={(e, v) => {
                                    this.handleSetTotalCapacity(v);
                                }}
                                value={parking.totalCapacity}
                                type="number"
                                style={{width: '95%', marginTop: -10}}/>
                        )}
                    </div>
                    <ConfirmDialog
                        open={this.state.confirmDeleteDialogOpen}
                        handleClose={() => {
                            this.setState({confirmDeleteDialogOpen: false});
                        }}
                        handleConfirm={this.handleConfirmParking.bind(this)}
                        intl={intl}
                        messagesById={{
                            title: 'delete_parking',
                            body: 'delete_parking_are_you_sure',
                            confirm: 'delete_group_confirm',
                            cancel: 'delete_group_cancel'
                        }}
                    />
                </Item>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    parking: state.parking.current,
    keyValuesDialogOpen: state.user.keyValuesDialogOpen,
    client: state.user.client
});

export default connect(mapStateToProps)(ParkingDetails);
