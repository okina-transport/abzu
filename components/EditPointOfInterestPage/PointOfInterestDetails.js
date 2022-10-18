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


import React, {useState} from 'react';
import ModalityIconSvg from '../MainPage/ModalityIconSvg';
import IconButton from 'material-ui/IconButton';
import {AssessmentActions, PointOfInterestActions, UserActions} from '../../actions/';
import {connect} from 'react-redux';
import debounce from 'lodash.debounce';
import ToolTippable from '../EditStopPage/ToolTippable';
import {deleteParking, deletePointOfInterest, getName} from "../../graphql/Tiamat/actions";
import Item from "../EditStopPage/Item";
import TextField from "material-ui/TextField";
import ConfirmDialog from "../Dialogs/ConfirmDialog";
import * as types from "../../actions/Types";
import AutoComplete from "material-ui/AutoComplete";
import MenuItem from "material-ui/MenuItem";
import MdSpinner from "../../static/icons/spinner";
import {getPrimaryDarkerColor} from "../../config/themeConfig";
import MdKey from "material-ui/svg-icons/communication/vpn-key";
import KeyValuesDialog from "../Dialogs/KeyValuesDialog";
import pointOfInterestTypes from "../../models/pointOfInterestTypes";
import {unknownPointOfInterestType} from "../../models/pointOfInterestType";
import ticketFacility, {ticketFacilities} from "../../models/ticketFacility";
import ticketFacilityService, {ticketFacilityServices} from "../../models/ticketFacilityService";
import PointOfInterestItemExpandedFields from "./PointOfInterestItemExpandedFields";
import accessibilityAssessments from "../../models/accessibilityAssessments";
import WheelChairPopover from '../EditStopPage/WheelChairPopover';
import {getIn} from "../../utils";


class PointOfInterestDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.pointOfInterest.name || '',
            description: props.pointOfInterest.description || '',
            tagsOpen: false,
            loading: false,
            currentPointOfInterestName: props.pointOfInterest.name || '',
            confirmDeleteDialogOpen: false,
            activeTabIndex: 0
        };

        this.updatePointOfInterestName = debounce(value => {
            this.setState({loading: true});
            this.props.dispatch(PointOfInterestActions.changePointOfInterestNameTitle(value));
        }, 5);

        const searchPointOfInterestName = (searchText) => {
            getName(this.props.client, searchText).then(result => {
                this.setState({
                    dataSource: result.data.nameRecommendations,
                    loading: false
                });
            });
        };

        this.debouncedSearchPointOfInterestName = debounce(searchPointOfInterestName, 1000);

        this.updatePointOfInterestDescription = debounce(value => {
            this.props.dispatch(PointOfInterestActions.changePointOfInterestDescription(value));
        }, 200);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            name: nextProps.pointOfInterest.name || '',
            description: nextProps.pointOfInterest.description || ''
        });
        if (
            nextProps.keyValuesDialogOpen &&
            this.props.keyValuesDialogOpen !== nextProps.keyValuesDialogOpen
        ) {
            this.setState({
                altNamesDialogOpen: false,
            });
        }
    }

    handleTabOnChange = value => {
        this.setState({
            activeTabIndex: value,
        });
    };

    handleHandleWheelChair(value) {
        if (!this.props.disabled)
            this.props.dispatch(AssessmentActions.setPoiWheelchairAccess(value));
    }

    handleUpdatePointOfInterestName(searchText, dataSource) {
        this.updatePointOfInterestName(searchText);
        this.debouncedSearchPointOfInterestName(searchText, dataSource);
    }

    handlePointOfInterestNameSelected(event) {
        const name = event.value.props.primaryText.props.children;
        this.setState({
            name: name
        });
        this.updatePointOfInterestName(name);
    }

    handleConfirmPointOfInterest() {
        const {pointOfInterest, index, dispatch, client} = this.props;

        if (pointOfInterest.id) {
            deletePointOfInterest(client, pointOfInterest.id).then(() => {
                dispatch(PointOfInterestActions.removeElementByType(index, 'pointOfInterest'));
                dispatch(UserActions.openSnackbar(types.SUCCESS));
            });
        } else {
            dispatch(PointOfInterestActions.removeElementByType(index, 'pointOfInterest'));
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
            UserActions.openKeyValuesDialog(this.props.pointOfInterest.keyValues, 'pointOfInterest', null)
        );
    }

    handlePointOfInterestDescriptionChange(event) {
        const description = event.target.value;
        this.setState({
            description: description
        });
        this.updatePointOfInterestDescription(description);
    }

    getMenuItems(dataSource, nextProps, currentPointOfInterestName) {
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
        } else if (nextProps.pointOfInterest.name !== currentPointOfInterestName) {
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

    getPointOfInterestTypeTranslation(locale, poi) {

        let isTicketMachines = poi.ticketFacility === ticketFacility.ticketMachines;
        let isPurchase = poi.ticketServiceFacility === ticketFacilityService.purchase;

        let shopClassification = poi.classifications.filter(
            classification => classification.name === "shop" || (classification.parent && classification.parent.name === "shop")
        );

        if (shopClassification && isTicketMachines && isPurchase) {
            let translations = pointOfInterestTypes[locale].filter(
                type => type.value === 'storepoint'
            );

            if (translations && translations.length) {
                return translations[0];
            }
        } else {
            let translations = pointOfInterestTypes[locale].filter(
                type => type.value === 'undefined'
            );

            if (translations && translations.length) {
                return translations[0];
            }
        }

        return undefined;
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

        const {pointOfInterest, intl, disabled, translations, index, activeTabIndex} = this.props;
        const {formatMessage, locale} = intl;

        const {
            name,
            description,
            loading,
            dataSource,
            currentPointOfInterestName,
        } = this.state;

        const menuItems = this.getMenuItems(dataSource, this.props, currentPointOfInterestName);

        const keyValuesHint = formatMessage({id: 'key_values_hint'});
        const primaryDarker = getPrimaryDarkerColor();

        const pointOfInterestType = this.getPointOfInterestTypeTranslation(
            locale,
            pointOfInterest
        );

        const fullAddress = (pointOfInterest.address ? pointOfInterest.address + " " : "") +
            (pointOfInterest.postalCode ? pointOfInterest.postalCode + " " : "") +
            (pointOfInterest.city ? pointOfInterest.city : "");

        const pointOfInterestTypeHint = pointOfInterestType.name ? pointOfInterestType.name : unknownPointOfInterestType[locale];

        const wheelchairAccess = getIn(
            pointOfInterest,
            ['accessibilityAssessment', 'limitations', 'wheelchairAccess'],
            'UNKNOWN'
        );


        const wheelChairHint = accessibilityAssessments.wheelchairAccess.values[locale][wheelchairAccess];



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
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <AutoComplete
                                    textFieldStyle={{width: 340}}
                                    animated={false}
                                    openOnFocus
                                    hintText={formatMessage({id: 'name'})}
                                    dataSource={
                                        loading ? Loading : menuItems || []
                                    }
                                    filter={(searchText, key) => searchText !== ''}
                                    onUpdateInput={this.handleUpdatePointOfInterestName.bind(this)}
                                    searchText={this.props.searchText || name}
                                    ref="searchText"
                                    onNewRequest={this.handlePointOfInterestNameSelected.bind(this)}
                                    listStyle={{width: 'auto'}}
                                    errorText={(name && name.trim().length) ? '' : formatMessage({id: 'name_is_required'})}
                                    style={{
                                        width: 340,
                                        marginTop:10
                                    }}
                                />
                                <ToolTippable toolTipText={pointOfInterestTypeHint}>
                                    <IconButton
                                        disabled={true}
                                        style={{
                                            borderBottom: 'none',
                                        }}
                                    >
                                        <ModalityIconSvg
                                            type={pointOfInterestType.value ? pointOfInterestType.value : 'no-information'}/>
                                    </IconButton>
                                </ToolTippable>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <TextField
                        hintText={formatMessage({id: 'description'})}
                        floatingLabelText={formatMessage({id: 'description'})}
                        style={{width: 340, marginTop: -10}}
                        value={description}
                        onChange={this.handlePointOfInterestDescriptionChange.bind(this)}
                    />
                    <ToolTippable toolTipText={keyValuesHint}>
                        <IconButton
                            style={{borderBottom: disabled ? 'none' : '1px dotted grey'}}
                            onClick={this.handleOpenKeyValues.bind(this)}
                        >
                            <MdKey
                                color={
                                    (pointOfInterest.keyValues || []).length
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
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <TextField
                        hintText={formatMessage({id: 'address'})}
                        floatingLabelText={formatMessage({id: 'address'})}
                        style={{width: 340, marginTop: -10}}
                        value={fullAddress}
                        disabled={true}
                    />
                </div>

                <div
                    style={{
                        marginTop: 10,
                        marginBottom: 15,
                        height: 35,
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

                </div>


                <div>

                    <Item>
                        <div className="pr-item-expanded">
                            <PointOfInterestItemExpandedFields
                                pointOfInterest={pointOfInterest}
                                handleTabOnChange={this.handleTabOnChange.bind(this)}
                                style={style}
                                tabStyle={tabStyle}
                                activeTabIndex={activeTabIndex}
                                intl1={intl}
                                locale={locale}/>
                        </div>
                        <ConfirmDialog
                            open={this.state.confirmDeleteDialogOpen}
                            handleClose={() => {
                                this.setState({confirmDeleteDialogOpen: false});
                            }}
                            handleConfirm={this.handleConfirmPointOfInterest.bind(this)}
                            intl={intl}
                            messagesById={{
                                title: 'delete_poi',
                                body: 'delete_poi_are_you_sure',
                                confirm: 'delete_group_confirm',
                                cancel: 'delete_group_cancel'
                            }}
                        />
                    </Item>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    pointOfInterest: state.pointOfInterest.current,
    keyValuesDialogOpen: state.user.keyValuesDialogOpen,
    client: state.user.client
});

export default connect(mapStateToProps)(PointOfInterestDetails);
