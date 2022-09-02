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
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import {injectIntl} from 'react-intl';
import {parkingPaymentProcesses} from '../../models/parkingPaymentProcess';
import {parkingLayouts} from '../../models/parkingLayout';
import {Subheader, TextField} from 'material-ui';
import RechargingAvailablePopover from './RechargingAvailablePopover';
import LocalParking from 'material-ui/svg-icons/maps/local-parking';
import {ActionAccessible} from 'material-ui/svg-icons';
import Payment from 'material-ui/svg-icons/action/payment';
import Box from '@material-ui/core/Box';
import {Button, Grid} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {Tab, Tabs} from "material-ui/Tabs";
import FacilitiesParkingTab from "../EditParkingPage/FacilitiesParkingTab";
import ToolTippable from "./ToolTippable";
import {Popover, PopoverAnimationVertical} from "material-ui/Popover";
import ParkingCoveredMenuItems from "../EditParkingPage/ParkingCoveredMenuItems";
import parkingTypesCovered from "../../models/parkingTypesCovered";
import ParkingTypeOfParkingRefMenuItems from "../EditParkingPage/ParkingTypeOfParkingRefMenuItems";
import parkingTypesOfParkingRef from "../../models/parkingTypesOfParkingRef";

const useStyles = makeStyles(() => ({
    mainGrid: {
        marginTop: '.5rem'
    },
    gridItemMargin: {
        marginLeft: '55px'
    },
    boxFullWidth: {
        width: '100%'
    },
    textField: {
        marginTop: -10
    },
    selectInput: {
        width: '100%'
    },
    info: {
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: '12px',
        paddingLeft: '16px',
        width: '100%',
        marginBlockStart: 0
    }
}));

const Info = ({children}) => {
    const classes = useStyles();
    return <p className={classes.info}>{children}</p>;
}

const parkingIconStyles = (topMargin = 15) => ({
    margin: `${topMargin}px 22px 18px 10px`
});

const hasElements = list => list && list.length > 0;

const hasValue = value => value !== null && value !== undefined;

const getRechargingAvailableValue = value => hasValue(value) ? value : null;

const parkingPaymentProcessSelectFieldValue = (parkingPaymentProcess) => {
    return hasElements(parkingPaymentProcess) ? parkingPaymentProcess.map(value => `${value}`) : [];
}

const parkingPaymentProcessChecked = (parkingPaymentProcess, key) => {
    const parkingPaymentProcessHasElements = hasElements(parkingPaymentProcess);
    if (!parkingPaymentProcessHasElements) {
        return false;
    }
    return parkingPaymentProcess.indexOf(key) > -1;
}


const ParkingItemPayAndRideExpandedFields = (props) => {
    const {
        intl: {formatMessage},
        disabled,
        hasExpired,
        parkingLayout,
        parkingPaymentProcess,
        rechargingAvailable,
        carpoolingAvailable,
        carsharingAvailable,
        totalCapacity,
        numberOfSpaces,
        numberOfSpacesWithRechargePoint,
        numberOfCarsharingSpaces,
        numberOfCarpoolingSpaces,
        numberOfSpacesForRegisteredDisabledUserType,
        handleSetParkingLayout,
        handleSetParkingPaymentProcess,
        handleSetRechargingAvailable,
        handleSetCarpoolingAvailable,
        handleSetCarsharingAvailable,
        handleSetNumberOfSpaces,
        handleSetNumberOfSpacesWithRechargePoint,
        handleSetNumberOfCarsharingSpaces,
        handleSetNumberOfCarpoolingSpaces,
        handleSetNumberOfSpacesForRegisteredDisabledUserType,
        handleTabOnChange,
        style,
        tabStyle,
        activeTabIndex,
        parking,
        index,
        intl1,
        parkingCoveredHint,
        parkingTypeOfParkingRefHint,
        handleOpenParkingCoveredPopover,
        handleCloseParkingCoveredPopover,
        handleCloseParkingTypeOfParkingRefPopover,
        handleSetSecureAvailable,
        handleParkingTypeOfParkingRefChange,
        parkingCoveredOpen,
        handleParkingCoveredChange,
        parkingCoveredAnchorEl,
        parkingTypeOfParkingRefOpen,
        parkingTypeOfParkingRefAnchorEl,
        locale,
        handleOpenParkingTypeOfParkingRefPopover
    } = props;

    const classes = useStyles();

    var isBikeParkingType = isBikeParking(parking);


    return (
        <div style={style} id="additional">
            <Tabs
                onChange={(_e, value) => {
                    handleTabOnChange(value);
                }}
                value={activeTabIndex}
                tabItemContainerStyle={{backgroundColor: '#fff', marginTop: -5}}
            >
                <Tab
                    style={tabStyle}
                    label={formatMessage({id: 'capacity'})}
                    value={0}
                >
                    <Grid container alignItems="stretch" direction="column" spacing={2} className={classes.mainGrid}>
                        <Grid item>
                            <Subheader>{formatMessage({id: 'parking_parkAndRide_capacity_sub_header'})} ({`${totalCapacity}`})</Subheader>
                            <Box display="flex" flexDirection="row" className={classes.boxFullWidth}>
                                <LocalParking style={parkingIconStyles()}/>
                                <TextField
                                    disabled={disabled || hasExpired}
                                    floatingLabelText={formatMessage({id: 'parking_number_of_spaces'})}
                                    onChange={(_e, value) => {
                                        handleSetNumberOfSpaces(value);
                                    }}
                                    value={numberOfSpaces || ''}
                                    type="number"
                                    fullWidth
                                    className={classes.textField}
                                    floatingLabelStyle={{color: 'rgb(30,100,163)'}}
                                />
                            </Box>
                            {!isBikeParkingType && <Box display="flex" flexDirection="row" className={classes.boxFullWidth}>
                                <ActionAccessible style={parkingIconStyles()}/>
                                <TextField
                                    disabled={disabled || hasExpired}
                                    floatingLabelText={formatMessage({id: 'parking_number_of_spaces_for_registered_disabled_user_type'})}
                                    onChange={(e, value) => {
                                        handleSetNumberOfSpacesForRegisteredDisabledUserType(value);
                                    }}
                                    value={numberOfSpacesForRegisteredDisabledUserType || ''}
                                    type="number"
                                    fullWidth
                                    className={classes.textField}
                                    floatingLabelStyle={{color: 'rgb(30,100,163)', fontSize: '0.8em'}}
                                />
                            </Box>
                            }
                        </Grid>
                        {!isBikeParkingType && <Grid item>
                                <Subheader>{formatMessage({id: 'parking_recharging_sub_header'})}</Subheader>
                                <Info>
                                    {formatMessage({id: 'parking_recharging_available_info'})}
                                </Info>
                                <Box display="flex" flexDirection="row" className={classes.boxFullWidth}>
                                    <RechargingAvailablePopover
                                        disabled={disabled}
                                        hasExpired={hasExpired}
                                        handleSetRechargingAvailable={handleSetRechargingAvailable}
                                        handleSetNumberOfSpacesWithRechargePoint={handleSetNumberOfSpacesWithRechargePoint}
                                        rechargingAvailableValue={getRechargingAvailableValue(rechargingAvailable)}/>
                                    <TextField
                                        disabled={!rechargingAvailable || disabled || hasExpired}
                                        floatingLabelText={formatMessage({id: 'parking_number_of_spaces_with_recharge_point'})}
                                        onChange={(_e, value) => {
                                            handleSetNumberOfSpacesWithRechargePoint(value);
                                        }}
                                        value={numberOfSpacesWithRechargePoint || ''}
                                        type="number"
                                        fullWidth
                                        className={classes.textField}
                                        floatingLabelStyle={{color: rechargingAvailable ? 'rgb(30,100,163)' : 'rgba(0, 0, 0, 0.3)'}}
                                    />
                                </Box>
                                </Grid>
                        }

                        {!isBikeParkingType && <Grid item>
                            <Box display="flex" flexDirection="row" className={classes.boxFullWidth}>
                                <FormControlLabel
                                    label={formatMessage({id: 'carpooling_available'})}
                                    style={{marginTop: 10}}
                                    control={
                                        <Checkbox
                                            checked={carpoolingAvailable}
                                            label={formatMessage({id: 'carpooling_available'})}
                                            onChange={(event, checked) => {
                                                handleSetCarpoolingAvailable(checked);
                                            }}
                                        />
                                    }
                                />
                            </Box>
                        </Grid>
                        }

                        {!isBikeParkingType && <Grid item>
                            <Box display="flex" flexDirection="row" className={classes.boxFullWidth}>
                                <TextField
                                    disabled={!carpoolingAvailable}
                                    floatingLabelText={formatMessage({id: 'number_of_carpooling_places'})}
                                    onChange={(e, value) => {
                                        handleSetNumberOfCarpoolingSpaces(value);
                                    }}
                                    value={numberOfCarpoolingSpaces || ''}
                                    type="number"
                                    style={{width: '95%', marginTop: -10}}
                                    floatingLabelStyle={{color: carpoolingAvailable ? 'rgb(30,100,163)' : 'rgba(0, 0, 0, 0.3)'}}
                                />
                            </Box>
                        </Grid>

                        }

                        {!isBikeParkingType && <Grid item>
                            <Box display="flex" flexDirection="row" className={classes.boxFullWidth}>
                                <FormControlLabel
                                    label={formatMessage({id: 'carsharing_available'})}
                                    style={{marginTop: 10}}
                                    control={
                                        <Checkbox
                                            checked={carsharingAvailable}
                                            label={formatMessage({id: 'carsharing_available'})}
                                            onChange={(event, checked) => {
                                                handleSetCarsharingAvailable(checked);
                                            }}
                                        />
                                    }
                                />
                            </Box>
                        </Grid>
                        }

                        {!isBikeParkingType &&   <Grid item>
                            <Box display="flex" flexDirection="row" className={classes.boxFullWidth}>
                            <TextField
                            disabled={!carsharingAvailable}
                            floatingLabelText={formatMessage({id: 'number_of_carsharing_places'})}
                            onChange={(e, value) => {
                            handleSetNumberOfCarsharingSpaces(value);
                        }}
                            value={numberOfCarsharingSpaces || ''}
                            type="number"
                            style={{width: '95%', marginTop: -10}}
                            floatingLabelStyle={{color: carsharingAvailable ? 'rgb(30,100,163)' : 'rgba(0, 0, 0, 0.3)'}}
                            />
                            </Box>
                            </Grid>


                        }
                    </Grid>

                </Tab>
                <Tab
                    style={tabStyle}
                    label={formatMessage({id: 'facilities'})}
                    value={1}
                >
                    {/*<FacilitiesParkingTab*/}
                    {/*    intl={intl1}*/}
                    {/*    parking={parking}*/}
                    {/*    index={index}*/}
                    {/*    disabled={disabled}*/}
                    {/*/>*/}
                    <Grid container alignItems="stretch" direction="column" spacing={2} className={classes.mainGrid}>
                        <Grid item className={classes.gridItemMargin}>
                            <InputLabel htmlFor="select-parking-layout">
                                {formatMessage({id: 'parking_layout'})}
                            </InputLabel>
                            <Select
                                displayEmpty
                                disabled={disabled || hasExpired}
                                value={parkingLayout}
                                input={<Input className={classes.selectInput} id="select-parking-layout"/>}
                                renderValue={selected => selected ? formatMessage({id: `parking_layout_${selected}`}) :
                                    <em>{formatMessage({id: 'parking_layout_undefined'})}</em>}
                                onChange={(event) => {
                                    const {value} = event.target;
                                    if (value === parkingLayout) {
                                        handleSetParkingLayout(null);
                                    } else {
                                        handleSetParkingLayout(value);
                                    }
                                }}>
                                {parkingLayouts.map(key => (
                                    <MenuItem key={key} value={key}>
                                        <Checkbox checked={key === parkingLayout}/>
                                        <ListItemText
                                            primary={formatMessage({id: `parking_layout_${key}`})}/>
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item>
                            <Box display="flex" flexDirection="row" className={classes.boxFullWidth}>
                                <Box>
                                    <Payment style={parkingIconStyles(6)}/>
                                </Box>
                                <Box className={classes.boxFullWidth}>
                                    <InputLabel htmlFor="select-multiple-parking-payment-process">
                                        {formatMessage({id: 'parking_payment_process'})}
                                    </InputLabel>
                                    <Select
                                        multiple
                                        displayEmpty
                                        disabled={disabled || hasExpired}
                                        value={parkingPaymentProcessSelectFieldValue(parkingPaymentProcess)}
                                        renderValue={selected => {
                                            if (selected.length === 0) {
                                                return <em>{formatMessage({id: 'parking_payment_process_undefined'})}</em>;
                                            }

                                            return selected.map(key => {
                                                return formatMessage({id: `parking_payment_process_${key}`});
                                            }).join(', ');
                                        }}
                                        input={
                                            <Input className={classes.selectInput}
                                                   id="select-multiple-parking-payment-process"/>}
                                        onChange={(event) => {
                                            const {value} = event.target;
                                            handleSetParkingPaymentProcess(value);
                                        }}>
                                        {parkingPaymentProcesses.map(key => (
                                            <MenuItem key={key} value={key}>
                                                <Checkbox
                                                    checked={parkingPaymentProcessChecked(parkingPaymentProcess, key)}/>
                                                <ListItemText
                                                    primary={formatMessage({id: `parking_payment_process_${key}`})}
                                                    secondary={key === `payByPrepaidToken` ? formatMessage({id: `parking_payment_process_${key}_hover`}) : null}/>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Tab>
                <Tab
                    style={tabStyle}
                    label={formatMessage({id: 'other'})}
                    value={2}
                >
                    <div style={{display: 'block', justifyContent: 'space-around'}}>
                        <ToolTippable toolTipText={parkingTypeOfParkingRefHint}>
                            <Button onClick={handleOpenParkingTypeOfParkingRefPopover}>
                                Autres types de parking
                            </Button>
                        </ToolTippable>
                        <Popover
                            open={parkingTypeOfParkingRefOpen}
                            anchorEl={parkingTypeOfParkingRefAnchorEl}
                            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                            targetOrigin={{horizontal: 'left', vertical: 'top'}}
                            onRequestClose={handleCloseParkingTypeOfParkingRefPopover}
                            animation={PopoverAnimationVertical}
                            style={{overflowY: 'none'}}
                            animated={true}
                        >
                            <ParkingTypeOfParkingRefMenuItems
                                handleParkingTypeOfParkingRefChange={handleParkingTypeOfParkingRefChange}
                                parkingTypeOfParkingRefChosen={parking.typeOfParkingRef}
                                parkingTypesOfParkingRef={parkingTypesOfParkingRef[locale]}
                            />
                        </Popover>
                        <ToolTippable toolTipText={parkingCoveredHint}>
                            <Button onClick={handleOpenParkingCoveredPopover}>
                                Infrastructure
                            </Button>
                        </ToolTippable>
                        <Popover
                            open={parkingCoveredOpen}
                            anchorEl={parkingCoveredAnchorEl}
                            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                            targetOrigin={{horizontal: 'left', vertical: 'top'}}
                            onRequestClose={handleCloseParkingCoveredPopover}
                            animation={PopoverAnimationVertical}
                            style={{overflowY: 'none'}}
                            animated={true}
                        >
                            <ParkingCoveredMenuItems
                                handleParkingCoveredChange={handleParkingCoveredChange}
                                parkingCoveredChosen={parking.covered}
                                parkingTypesCovered={parkingTypesCovered[locale]}
                            />
                        </Popover>
                        <FormControlLabel
                            label={formatMessage({id: 'secure_available'})}
                            control={
                                <Checkbox
                                    checked={parking.secure}
                                    label={formatMessage({id: 'secure_available'})}
                                    onChange={(event, checked) => {
                                        handleSetSecureAvailable(checked);
                                    }}
                                />
                            }
                        />
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}


export default injectIntl(ParkingItemPayAndRideExpandedFields);

export const isBikeParking = (parking) => {
    var parkingVehicleTypes = parking.parkingVehicleTypes;
    return parkingVehicleTypes.includes("pedalCycle");
    ;
}
