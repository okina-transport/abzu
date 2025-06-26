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
import PropTypes from 'prop-types';
import StopPlaceMarker from './StopPlaceMarker';
import NewStopMarker from './NewStopMarker';
import {ParkingActions, StopPlaceActions, StopPlacesGroupActions, UserActions} from '../../actions/';
import {connect} from 'react-redux';
import {injectIntl} from 'react-intl';
import stopTypes from '../../models/stopTypes';
import JunctionMarker from './JunctionMarker';
import NeighbourMarker from './NeighbourMarker';
import ParkAndRideMarker from './ParkAndRideMarker';
import CycleParkingMarker from './CycleParkingMarker';
import {getIn, setDecimalPrecision} from '../../utils';
import QuayMarker from './QuayMarker';
import {withApollo} from 'react-apollo';
import {
    allEntities,
    allEntitiesParkings,
    allEntitiesPointsOfInterest,
    neighbourStopPlaceQuays
} from '../../graphql/Tiamat/queries';
import CoordinateMarker from './CoordinateMarker';
import Routes from '../../routes/';
import * as MarkerStrings from './markerText';
import {Entities} from '../../models/Entities';
import NewParkingMarker from "./NewParkingMarker";
import NeighbourMarkerParking from "./NeighbourMarkerParking";
import ParkingMarker from "./ParkingMarker";
import PointOfInterestMarker from "./PointOfInterestMarker";
import NeighbourMarkerPointOfInterest from "./NeighbourMarkerPointOfInterest";

class MarkerList extends React.Component {
    static propTypes = {
        handleDragEnd: PropTypes.func.isRequired
    };

    componentWillMount() {
        this.createMarkerList(this.props);
    }

    componentWillUpdate(nextProps) {
        this.createMarkerList(nextProps);
    }

    handleAdjustCentroid() {
        this.props.dispatch(StopPlaceActions.adjustCentroid());
    }

    handleAddToGroup(stopPlaceId) {
        const {client} = this.props;
        this.props.dispatch(
            StopPlacesGroupActions.addMemberToGroup(client, stopPlaceId)
        );
    }

    handleStopOnClick(id) {
        const {dispatch, client, path} = this.props;
        const isAlreadyActive = id === path;

        if (!isAlreadyActive) {
            client
                .query({
                    fetchPolicy: 'network-only',
                    query: allEntities,
                    variables: {
                        id: id
                    }
                })
                .then(result => {
                    dispatch(UserActions.navigateTo(`/${Routes.STOP_PLACE}/`, id));
                });
        }
    }

    handleParkingOnClick(id) {
        const {dispatch, client, path} = this.props;

        const isAlreadyActive = id === path;

        if (!isAlreadyActive) {
            client
                .query({
                    fetchPolicy: 'network-only',
                    query: allEntitiesParkings,
                    variables: {
                        id: id
                    }
                })
                .then(result => {
                    dispatch(UserActions.navigateTo(`/${Routes.PARKING}/`, id));
                });
        }
    }

    handlePointOfInterestOnClick(id) {
        const {dispatch, client, path} = this.props;

        const isAlreadyActive = id === path;

        if (!isAlreadyActive) {
            client
                .query({
                    fetchPolicy: 'network-only',
                    query: allEntitiesPointsOfInterest,
                    variables: {
                        id: id
                    }
                })
                .then(result => {
                    dispatch(UserActions.navigateTo(`/${Routes.POINT_OF_INTEREST}/`, id));
                });
        }
    }

    handleNewStopClick() {
        const {dispatch, intl} = this.props;
        dispatch(StopPlaceActions.useNewStopAsCurrent());
        dispatch(UserActions.navigateTo(`/${Routes.STOP_PLACE}/`, 'new'));
        document.title = intl.formatMessage({id: '_title_short'});
    }

    handleNewParkingClick() {
        const {dispatch, intl} = this.props;
        dispatch(ParkingActions.useNewParkingAsCurrent());
        dispatch(UserActions.navigateTo(`/${Routes.PARKING}/`, 'new'));
        document.title = intl.formatMessage({id: '_title_short'});
    }

    handleRemoveFromGroup(stopPlaceId) {
        this.props.dispatch(
            StopPlacesGroupActions.removeMemberFromGroup(stopPlaceId)
        );
    }

    createNewMultimodalStopFrom(stopPlaceId) {
        const {dispatch, client, isEditingStop} = this.props;
        dispatch(
            UserActions.createMultimodalWith(client, stopPlaceId, !isEditingStop)
        );
    }

    handleDragEndNewStop(event) {
        this.props.dispatch(
            StopPlaceActions.changeLocationNewStop(event.target.getLatLng())
        );
    }

    handleDragEndNewParking(event) {
        this.props.dispatch(
            ParkingActions.changeLocationNewParking(event.target.getLatLng())
        );
    }

    connectToAdjacentStop(stopPlaceId) {
        this.props.dispatch(
            UserActions.showAddAdjacentStopDialog(stopPlaceId)
        );
    }

    handleShowQuays(id) {
        this.props.client.query({
            fetchPolicy: 'network-only',
            query: neighbourStopPlaceQuays,
            variables: {
                id: id
            }
        });
    }

    handleMergeStopPlace(id, name) {
        this.props.dispatch(UserActions.showMergeStopDialog(id, name));
    }

    handleHideQuays(id) {
        this.props.dispatch(UserActions.hideQuaysForNeighbourStop(id));
    }

    handleUpdatePathLink(coords, id, type) {
        const {isCreatingPolylines, activeMap, pathLink} = this.props;

        if (activeMap) activeMap.closePopup();

        if (pathLink && pathLink.length) {
            let lastPathLink = pathLink[pathLink.length - 1];

            const lastPathLinkFromId = getIn(
                lastPathLink,
                ['from', 'placeRef', 'addressablePlace', 'id'],
                null
            );

            if (lastPathLinkFromId === id && !lastPathLink.to) {
                this.props.dispatch(UserActions.removeLastPolyline());
                return;
            }
        }

        if (isCreatingPolylines) {
            this.props.dispatch(
                UserActions.addFinalCoordinesToPolylines(coords, id, type)
            );
        } else {
            this.props.dispatch(UserActions.startCreatingPolyline(coords, id, type));
        }
    }

    handleElementDragEnd(index, type, event) {
        const {dispatch} = this.props;
        const position = event.target.getLatLng();

        dispatch(
            StopPlaceActions.changeElementPosition(index, type, [
                setDecimalPrecision(position.lat, 6),
                setDecimalPrecision(position.lng, 6)
            ])
        );
    }

    handleCreateGroup(stopPlaceId) {
        const {client, dispatch} = this.props;
        dispatch(
            StopPlacesGroupActions.useStopPlaceIdForNewGroup(client, stopPlaceId)
        );
    }

    createMarkerList(props) {

        const {
            markers,
            handleDragEnd,
            changeCoordinates,
            dragableMarkers,
            neighbourStopQuays,
            missingCoordinatesMap,
            handleSetCompassBearing,
            disabled,
            disabledForSearch,
            intl,
            showExpiredStops,
            isEditingStop,
            isEditingParking,
            isEditingPointOfInterest,
            currentIsNewStop,
            currentStopIsMultiModal,
            tokenParsed
        } = props;
        const {formatMessage} = intl;

        let popupMarkers = [];


        const CustomPopupMarkerText = MarkerStrings.popupMarkerText(formatMessage);
        const newStopMarkerText = MarkerStrings.newStopPlaceMarkerText(formatMessage);
        const newParkingMarkerText = MarkerStrings.newParkingMarkerText(formatMessage);


        let stopPlaceMarkers = this.createStopPlaceMarkers(markers, isEditingStop, newStopMarkerText, intl, neighbourStopQuays, showExpiredStops,currentStopIsMultiModal,disabled,tokenParsed,disabledForSearch,
                        handleDragEnd,changeCoordinates,missingCoordinatesMap,dragableMarkers, handleSetCompassBearing,currentIsNewStop, CustomPopupMarkerText);
        if (stopPlaceMarkers != null && stopPlaceMarkers.length > 0) {
            popupMarkers.push(...stopPlaceMarkers);
        }


        let parkingMarkers = this.createParkingMarkers(markers, isEditingParking, newParkingMarkerText, showExpiredStops, handleDragEnd, dragableMarkers,changeCoordinates,tokenParsed, CustomPopupMarkerText);
        if (parkingMarkers != null && parkingMarkers.length > 0) {
            popupMarkers.push(...parkingMarkers);
        }

        let poiMarkers = this.createPoiMarkers(markers, showExpiredStops,isEditingPointOfInterest, CustomPopupMarkerText, handleDragEnd, dragableMarkers, changeCoordinates, missingCoordinatesMap);
        if (poiMarkers != null && poiMarkers.length > 0) {
            popupMarkers.push(...poiMarkers);
        }

        let coordinatePinMarkers = this.createCoordinatePinMarkers(markers);
        if (coordinatePinMarkers != null && coordinatePinMarkers.length > 0) {
            popupMarkers.push(...coordinatePinMarkers);
        }

        this._popupMarkers = popupMarkers;
    }

    render() {
        return this._popupMarkers;
    }

    createStopPlaceMarkers(markers, isEditingStop, newStopMarkerText, intl, neighbourStopQuays, showExpiredStops,currentStopIsMultiModal,disabled,tokenParsed,disabledForSearch,
                           handleDragEnd,changeCoordinates,missingCoordinatesMap,dragableMarkers,handleSetCompassBearing,currentIsNewStop, CustomPopupMarkerText) {
        let alreadyProcessedStops = [];
        let stopPlaceMarkers = [];
        if (!Array.isArray(markers) || markers.length === 0) {
            return stopPlaceMarkers;
        }

        let stopPlaces = markers.filter(marker => marker.entityType === Entities.STOP_PLACE);
        if (stopPlaces == null || stopPlaces.length === 0) {
            return stopPlaceMarkers;
        }

        stopPlaces.forEach((marker, parentIndex) => {

            const localeStopType = getLocaleStopTypeName(marker.stopPlaceType, intl);

            if (marker.isNewStop && !isEditingStop) {
                stopPlaceMarkers.push(
                    <NewStopMarker
                        key={'newstop-parent- ' + parentIndex}
                        position={marker.location}
                        newStopIsMultiModal={this.props.newStopIsMultiModal}
                        handleDragEnd={this.handleDragEndNewStop.bind(this)}
                        text={newStopMarkerText}
                        handleOnClick={() => {
                            this.handleNewStopClick(marker.location);
                        }}
                    />
                );
            } else {

                if (marker.isActive) {
                    if (marker.isParent && marker.children) {
                        marker.children.forEach((child, i) => {
                            stopPlaceMarkers.push(
                                <StopPlaceMarker
                                    key={'stopPlace-child-' + marker.id + '-' + i}
                                    id={child.id}
                                    index={parentIndex}
                                    position={child.location}
                                    name={child.name || marker.name}
                                    isShowingQuays={!!neighbourStopQuays[child.id]}
                                    handleShowQuays={this.handleShowQuays.bind(this)}
                                    handleHideQuays={this.handleHideQuays.bind(this)}
                                    submode={child.submode}
                                    formattedStopType={localeStopType}
                                    isMultimodal={false}
                                    isMultimodalChild={true}
                                    disabled={disabled}
                                    disabledForSearch={disabledForSearch}
                                    handleDragEnd={handleDragEnd}
                                    active={false}
                                    stopType={child.stopPlaceType}
                                    handleAdjustCentroid={this.handleAdjustCentroid.bind(this)}
                                    hasExpired={marker.hasExpired}
                                    draggable={false}
                                    handleChangeCoordinates={changeCoordinates}
                                    translations={CustomPopupMarkerText}
                                    handleOnClick={() => {
                                        this.handleStopOnClick(child.id);
                                    }}
                                    isEditingStop={isEditingStop}
                                    missingCoordinatesMap={missingCoordinatesMap}
                                    createNewMultimodalStopFrom={this.createNewMultimodalStopFrom.bind(
                                        this
                                    )}
                                    connectToAdjacentStop={this.connectToAdjacentStop.bind(this)}
                                />
                            );

                            alreadyProcessedStops.push(child.id);

                            if (neighbourStopQuays[child.id]) {
                                neighbourStopQuays[child.id].forEach((quayOfChild, index) => {
                                    stopPlaceMarkers.push(
                                        <QuayMarker
                                            index={index}
                                            id={quayOfChild.id}
                                            position={quayOfChild.location}
                                            key={'quay-neighbour-child' + quayOfChild.id}
                                            handleQuayDragEnd={() => {
                                            }}
                                            translations={Object.assign(
                                                {},
                                                newStopMarkerText,
                                                CustomPopupMarkerText
                                            )}
                                            compassBearing={quayOfChild.compassBearing}
                                            publicCode={quayOfChild.publicCode || ''}
                                            privateCode={quayOfChild.privateCode || ''}
                                            stopPlaceName={marker.name}
                                            stopPlaceId={child.id}
                                            formattedStopType={localeStopType}
                                            handleUpdatePathLink={this.handleUpdatePathLink.bind(
                                                this
                                            )}
                                            handleChangeCoordinates={() => {
                                            }}
                                            draggable={false}
                                            belongsToNeighbourStop={true}
                                            handleSetCompassBearing={() => {
                                            }}
                                            showPathLink={!disabled}
                                            isEditingStop={isEditingStop}
                                            disabled={disabled}
                                            currentIsNewStop={currentIsNewStop}
                                        />
                                    );
                                });
                            }
                        });
                    }


                    stopPlaceMarkers.push(
                        <StopPlaceMarker
                            key={'stopPlace-' + marker.id}
                            id={marker.id}
                            index={parentIndex}
                            position={marker.location}
                            name={marker.name}
                            submode={marker.submode}
                            formattedStopType={localeStopType}
                            isMultimodal={marker.isParent}
                            disabled={disabled}
                            handleDragEnd={handleDragEnd}
                            active={!!marker.isActive}
                            stopType={marker.stopPlaceType}
                            handleAdjustCentroid={this.handleAdjustCentroid.bind(this)}
                            draggable={dragableMarkers}
                            handleChangeCoordinates={changeCoordinates}
                            createNewMultimodalStopFrom={this.createNewMultimodalStopFrom.bind(this)}
                            translations={CustomPopupMarkerText}
                            handleOnClick={() => {
                                this.handleStopOnClick(marker.id);
                            }}
                            isEditingStop={isEditingStop}
                            removeFromGroup={this.handleRemoveFromGroup.bind(this)}
                            isEditingGroup={this.props.isEditingGroup}
                            missingCoordinatesMap={missingCoordinatesMap}
                            isMultimodalChild={marker.isChildOfParent}
                            hasExpired={marker.hasExpired}
                            isGroupMember={marker.isMemberOfGroup}
                            handleCreateGroup={this.handleCreateGroup.bind(this)}
                            disabledForSearch={disabledForSearch}
                        />
                    );

                    if (marker.quays) {
                        marker.quays.forEach((quay, index) => {
                            stopPlaceMarkers.push(
                                <QuayMarker
                                    index={index}
                                    id={quay.id}
                                    position={quay.location}
                                    key={'quay-' + (quay.id || index)}
                                    handleQuayDragEnd={this.handleElementDragEnd.bind(this)}
                                    translations={Object.assign(
                                        {},
                                        newStopMarkerText,
                                        CustomPopupMarkerText
                                    )}
                                    compassBearing={quay.compassBearing}
                                    publicCode={quay.publicCode || ''}
                                    privateCode={quay.privateCode || ''}
                                    stopPlaceName={marker.name}
                                    stopPlaceId={marker.id}
                                    disabled={disabled}
                                    formattedStopType={localeStopType}
                                    handleUpdatePathLink={this.handleUpdatePathLink.bind(this)}
                                    handleChangeCoordinates={changeCoordinates}
                                    draggable={!disabled}
                                    belongsToNeighbourStop={!marker.isActive}
                                    handleSetCompassBearing={handleSetCompassBearing}
                                    showPathLink={!disabled}
                                    isEditingStop={isEditingStop}
                                    currentIsNewStop={currentIsNewStop}
                                />
                            );
                        });
                    }


                } else if ((showExpiredStops && marker.hasExpired) || !marker.hasExpired) {
                    if (!alreadyProcessedStops.includes(marker.id)) {
                        stopPlaceMarkers.push(
                            <NeighbourMarker
                                key={'neighbourStop-' + marker.belongsToGroup + '-' + marker.id}
                                id={marker.id}
                                position={marker.location}
                                name={marker.name}
                                handleOnClick={() => {
                                    this.handleStopOnClick(marker.id);
                                }}
                                index={parentIndex}
                                isChildOfParent={marker.isChildOfParent}
                                handleAddToGroup={() => {
                                    this.handleAddToGroup(marker.id);
                                }}
                                submode={marker.submode}
                                translations={CustomPopupMarkerText}
                                isEditingStop={isEditingStop}
                                isMultimodal={marker.isParent}
                                currentStopIsMultiModal={currentStopIsMultiModal}
                                disabled={disabled}
                                stopType={marker.stopPlaceType}
                                handleMergeStopPlace={this.handleMergeStopPlace.bind(this)}
                                isShowingQuays={!!neighbourStopQuays[marker.id]}
                                handleShowQuays={this.handleShowQuays.bind(this)}
                                handleHideQuays={this.handleHideQuays.bind(this)}
                                hasExpired={marker.hasExpired}
                                createNewMultimodalStopFrom={this.createNewMultimodalStopFrom.bind(
                                    this
                                )}
                                stopPlace={marker}
                                tokenParsed={tokenParsed}
                                isEditingGroup={this.props.isEditingGroup}
                                handleCreateGroup={this.handleCreateGroup.bind(this)}
                            />
                        );
                        alreadyProcessedStops.push(marker.id);
                    }

                    if (neighbourStopQuays && neighbourStopQuays[marker.id]) {
                        neighbourStopQuays[marker.id].forEach((quay, index) => {
                            stopPlaceMarkers.push(
                                <QuayMarker
                                    index={index}
                                    parentId={parentIndex}
                                    id={quay.id}
                                    position={quay.location}
                                    key={'quay-neighbour' + quay.id}
                                    handleQuayDragEnd={() => {
                                    }}
                                    translations={Object.assign(
                                        {},
                                        newStopMarkerText,
                                        CustomPopupMarkerText
                                    )}
                                    compassBearing={quay.compassBearing}
                                    publicCode={quay.publicCode || ''}
                                    privateCode={quay.privateCode || ''}
                                    stopPlaceName={marker.name}
                                    stopPlaceId={marker.id}
                                    formattedStopType={localeStopType}
                                    handleUpdatePathLink={this.handleUpdatePathLink.bind(this)}
                                    handleChangeCoordinates={() => {
                                    }}
                                    draggable={false}
                                    belongsToNeighbourStop={true}
                                    handleSetCompassBearing={() => {
                                    }}
                                    showPathLink={!disabled}
                                    isEditingStop={isEditingStop}
                                    disabled={disabled}
                                    currentIsNewStop={currentIsNewStop}
                                />
                            );
                        });
                    }
                }
            }
        });
        return stopPlaceMarkers;
    }

    createParkingMarkers(markers, isEditingParking, newParkingMarkerText, showExpiredStops,handleDragEnd, dragableMarkers,changeCoordinates,tokenParsed, CustomPopupMarkerText) {
        let parkingMarkers = [];
        if (!Array.isArray(markers) || markers.length === 0) {
            return parkingMarkers;
        }

        let parkings = markers.filter(marker => marker.entityType === Entities.PARKING);
        if (parkings == null || parkings.length === 0) {
            return parkingMarkers;
        }

        parkings.forEach((marker, parentIndex) => {
            if (marker.isNewParking && !isEditingParking) {
                parkingMarkers.push(
                    <NewParkingMarker
                        key={'newparking-parent- ' + parentIndex}
                        position={marker.location}
                        handleDragEnd={this.handleDragEndNewParking.bind(this)}
                        text={newParkingMarkerText}
                        handleOnClick={() => {
                            this.handleNewParkingClick(marker.location);
                        }}
                    />
                );
            } else {
                if (marker.isActive) {
                    if (marker.parentSiteRef === undefined || marker.parentSiteRef === null) {
                        parkingMarkers.push(
                            <ParkingMarker
                                key={'parking-' + marker.id}
                                id={marker.id}
                                index={parentIndex}
                                position={marker.location}
                                name={marker.name}
                                handleDragEnd={handleDragEnd}
                                active={!!marker.isActive}
                                parkingType={marker.parkingType}
                                draggable={dragableMarkers}
                                secure={marker.secure}
                                typeOfParkingRef={marker.typeOfParkingRef}
                                handleChangeCoordinates={changeCoordinates}
                                translations={CustomPopupMarkerText}
                                handleOnClick={() => {
                                    this.handleParkingOnClick(marker.id);
                                }}
                                isEditingParking={isEditingParking}
                            />
                        );
                    }

                    if (marker.parking) {
                        marker.parking.forEach((parking, index) => {
                            let isParkAndRide =
                                parking.parkingVehicleTypes &&
                                parking.parkingVehicleTypes.indexOf('car') > -1;
                            let isCycleParking =
                                parking.parkingVehicleTypes &&
                                parking.parkingVehicleTypes.indexOf('pedalCycle') > -1;

                            if (isParkAndRide) {
                                parkingMarkers.push(
                                    <ParkAndRideMarker
                                        position={parking.location}
                                        index={index}
                                        name={parking.name || ''}
                                        hasExpired={parking.hasExpired}
                                        draggable={!disabled}
                                        type="parking"
                                        key={'parking-' + index}
                                        totalCapacity={parking.totalCapacity}
                                        translations={{
                                            title: formatMessage({id: 'parking_item_title_parkAndRide'}),
                                            totalCapacity: formatMessage({id: 'total_capacity'}),
                                            parkingExpired: formatMessage({id: 'parking_expired'}),
                                            totalCapacityUnknown: formatMessage({
                                                id: 'total_capacity_unknown'
                                            })
                                        }}
                                        handleDragEnd={this.handleElementDragEnd.bind(this)}
                                    />
                                );
                            } else if (isCycleParking) {
                                parkingMarkers.push(
                                    <CycleParkingMarker
                                        position={parking.location}
                                        index={index}
                                        name={parking.name || ''}
                                        totalCapacity={parking.totalCapacity}
                                        hasExpired={parking.hasExpired}
                                        key={'parking-' + index}
                                        draggable={!disabled}
                                        type="parking"
                                        translations={{
                                            title: formatMessage({id: 'parking_item_title_bikeParking'}),
                                            totalCapacity: formatMessage({id: 'total_capacity'}),
                                            parkingExpired: formatMessage({id: 'parking_expired'}),
                                            totalCapacityUnknown: formatMessage({
                                                id: 'total_capacity_unknown'
                                            })
                                        }}
                                        handleDragEnd={this.handleElementDragEnd.bind(this)}
                                    />
                                );
                            }
                        });
                    }
                } else if ((showExpiredStops && marker.hasExpired) || !marker.hasExpired) {
                    parkingMarkers.push(
                        <NeighbourMarkerParking
                            key={'neighbourParking-' + marker.id}
                            id={marker.id}
                            position={marker.location}
                            name={marker.name}
                            handleOnClick={() => {
                                this.handleParkingOnClick(marker.id);
                            }}
                            index={parentIndex}
                            translations={CustomPopupMarkerText}
                            type={marker.parkingType}
                            parking={marker}
                            tokenParsed={tokenParsed}
                            isEditingParking={isEditingParking}
                        />
                    );
                }
            }
        });

        return parkingMarkers;
    }

    createPoiMarkers(markers, showExpiredStops,isEditingPointOfInterest, CustomPopupMarkerText, handleDragEnd, dragableMarkers, changeCoordinates, missingCoordinatesMap) {
        let poiMarkers = [];
        if (!Array.isArray(markers) || markers.length === 0) {
            return poiMarkers;
        }

        let pois = markers.filter(marker => marker.entityType === Entities.POINT_OF_INTEREST);
        if (pois == null || pois.length === 0) {
            return poiMarkers;
        }

        pois.forEach((marker, parentIndex) => {
            if (marker.isActive) {
                poiMarkers.push(
                    <PointOfInterestMarker
                        key={'pointOfInterest-' + marker.id}
                        id={marker.id}
                        index={parentIndex}
                        position={marker.location}
                        name={marker.name}
                        handleDragEnd={handleDragEnd}
                        handleChangeCoordinates={changeCoordinates}
                        draggable={dragableMarkers}
                        translations={CustomPopupMarkerText}
                        active={!!marker.isActive}
                        missingCoordinatesMap={missingCoordinatesMap}
                        handleOnClick={() => {
                            this.handlePointOfInterestOnClick(marker.id);
                        }}
                        isEditingPointOfInterest={isEditingPointOfInterest}
                    />
                );
            } else if ((showExpiredStops && marker.hasExpired) || !marker.hasExpired) {
                poiMarkers.push(
                    <NeighbourMarkerPointOfInterest
                        key={'neighbourPointOfInterest' + marker.id}
                        id={marker.id}
                        position={marker.location}
                        name={marker.name}
                        handleOnClick={() => {
                            this.handlePointOfInterestOnClick(marker.id);
                        }}
                        index={parentIndex}
                        translations={CustomPopupMarkerText}
                        type='storePoint'
                        isEditingPointOfInterest={isEditingPointOfInterest}
                    />
                );
            }
        });
        return poiMarkers;
    }

    createCoordinatePinMarkers(markers) {
        let coordinatePinMarkers = [];
        if (!Array.isArray(markers) || markers.length == 0) {
            return coordinatePinMarkers;
        }

        let coordinatePins = markers.filter(marker => marker.coordinatePin);
        if (coordinatePins == null || coordinatePins.length == 0) {
            return coordinatePinMarkers;
        }

        coordinatePins.forEach((marker) => {
            coordinatePinMarkers.push(
                <CoordinateMarker position={marker.position} key={'coordinatePin'}/>
            );
        });

        return coordinatePinMarkers;
    }
}

const mapStateToProps = state => ({
    path: state.user.path,
    isCreatingPolylines: state.stopPlace.isCreatingPolylines,
    currentIsNewStop: getIn(state.stopPlace, ['current', 'isNewStop'], false),
    currentIsNewParking: getIn(state.parking, ['current', 'isNewParking'], false),
    currentIsNewPointOfInterest: getIn(state.parking, ['current', 'isNewPointOfInterest'], false),
    neighbourStopQuays: state.stopPlace.neighbourStopQuays || {},
    isEditingStop:
        state.routing.locationBeforeTransitions.pathname.indexOf(
            Routes.STOP_PLACE
        ) > -1,
    isEditingGroup:
        state.routing.locationBeforeTransitions.pathname.indexOf(
            Routes.GROUP_OF_STOP_PLACE
        ) > -1,
    isEditingParking:
        state.routing.locationBeforeTransitions.pathname.indexOf(
            Routes.PARKING
        ) > -1,
    isEditingPointOfInterest:
        state.routing.locationBeforeTransitions.pathname.indexOf(
            Routes.POINT_OF_INTEREST
        ) > -1,
    missingCoordinatesMap: state.user.missingCoordsMap,
    activeMap: state.mapUtils.activeMap,
    pathLink: state.stopPlace.pathLink,
    showExpiredStops: state.stopPlace.showExpiredStops,
    disabled: (state.stopPlace.current && state.stopPlace.current.permanentlyTerminated) || !getIn(state.roles, ['allowanceInfo', 'canEdit'], false),
    disabledForSearch: !getIn(
        state.roles,
        ['allowanceInfoSearchResult', 'canEdit'],
        false
    ),
    newStopIsMultiModal: state.user.newStopIsMultiModal,
    currentStopIsMultiModal: getIn(
        state.stopPlace,
        ['current', 'isParent'],
        false
    ),
    tokenParsed: getIn(state.roles, ['kc', 'tokenParsed'], null),
});

const getLocaleStopTypeName = (stopPlaceType, intl) => {
    const {formatMessage, locale} = intl;
    let formattedStopTypeId = null;
    stopTypes[locale].forEach(stopType => {
        if (stopType.value === stopPlaceType) {
            formattedStopTypeId = stopType.quayItemName;
        }
    });
    return formattedStopTypeId
        ? formatMessage({id: formattedStopTypeId || 'name'})
        : '';
};

export default withApollo(injectIntl(connect(mapStateToProps)(MarkerList)));
