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
import LeafletMap from './LeafletMap';
import {ParkingActions, PointOfInterestActions, StopPlaceActions, UserActions} from '../../actions/';
import { injectIntl } from 'react-intl';
import { setDecimalPrecision } from '../../utils';
import CoordinatesDialog from '../Dialogs/CoordinatesDialog';
import CompassBearingDialog from '../Dialogs/CompassBearingDialog';
import { withApollo } from 'react-apollo';
import {getNeighbourParkings, getNeighbourPointsOfInterest, getNeighbourStops} from '../../graphql/Tiamat/actions';
import Settings from '../../singletons/SettingsManager';

class EditMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      coordinatesDialogOpen: false,
      compassBearingDialogOpen: false,
    };
    this.leafletMap = React.createRef();
  }

  handleMapOnClick(event, map) {
    const { isCreatingPolylines, dispatch } = this.props;

    if (isCreatingPolylines) {
      const coords = [event.latlng.lat, event.latlng.lng];
      dispatch(UserActions.addCoordinatesToPolylines(coords));
    }
  }

  handleCoordinatesDialogClose() {
    this.setState({
      coordinatesDialogOpen: false,
    });
  }

  handleCompassBearingDialogClose() {
    this.setState({
      compassBearingDialogOpen: false,
    });
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.isCreatingPolylines) {
      document.querySelector('.leaflet-container').style.cursor = 'crosshair';
    } else {
      document.querySelector('.leaflet-container').style.cursor = '';
    }

    return true;
  }

  handleMapDragEnd(isQuay, index, event, isParking, isPointOfInterest) {
    const { dispatch } = this.props;
    const position = event.target.getLatLng();

    let formattedPosition = [
      setDecimalPrecision(position.lat, 6),
      setDecimalPrecision(position.lng, 6),
    ];

    if (isQuay) {
      dispatch(
          StopPlaceActions.changeElementPosition(
              index,
              'quay',
              formattedPosition,
          ),
      );
    } else if (isParking) {
      dispatch(ParkingActions.changeCurrentParkingPosition(formattedPosition));
    } else if (isPointOfInterest) {
      dispatch(PointOfInterestActions.changeCurrentPointOfInterestPosition(formattedPosition));
    }
    else {
      dispatch(StopPlaceActions.changeCurrentStopPosition(formattedPosition));
    }
  }

  handleSetCompassBearing(compassBearing, index) {
    this.setState({
      compassBearingDialogOpen: true,
      compassBearing: compassBearing,
      compassBearingOwner: index,
    });
  }

  handleZoomEnd(event) {
    this.props.dispatch(UserActions.setZoomLevel(event.target.getZoom()));
  }

  handleBaselayerChanged(value) {
    this.props.dispatch(UserActions.changeActiveBaselayer(value));
  }

  handleChangeCoordinates(isQuay, markerIndex, position) {
    this.setState({
      coordinatesDialogOpen: true,
      coordinates: position.join(','),
      coordinatesOwner: {
        isQuay: isQuay,
        markerIndex: markerIndex,
      },
    });
  }

  handleSubmitChangeCoordinates(position) {
    const { coordinatesOwner } = this.state;
    const { dispatch, currentStopPlace, currentParking, currentPointOfInterest } = this.props;

    if(currentStopPlace){
      if (coordinatesOwner.isQuay) {
        dispatch(
            StopPlaceActions.changeElementPosition(
                coordinatesOwner.markerIndex,
                'quay',
                position,
            ),
        );
      } else {
        dispatch(StopPlaceActions.changeCurrentStopPosition(position));
      }

      dispatch(StopPlaceActions.changeMapCenter(position, 14));
    }
    else if (currentParking){
      dispatch(ParkingActions.changeCurrentParkingPosition(position));
      dispatch(ParkingActions.changeMapCenter(position, 14));
    }
    else if (currentPointOfInterest){
      dispatch(PointOfInterestActions.changeCurrentPointOfInterestPosition(position));
      dispatch(PointOfInterestActions.changeMapCenter(position, 14));
    }


    this.setState({
      coordinatesDialogOpen: false,
    });
  }

  handleSubmitChangeCompassBearing(compassBearing) {
    const { compassBearingOwner } = this.state;
    this.props.dispatch(
        StopPlaceActions.changeQuayCompassBearing(
            compassBearingOwner,
            compassBearing,
        ),
    );
    this.setState({
      compassBearingDialogOpen: false,
    });
  }



  handleMapReady(leafletElement) {
    const { dispatch, ignoreStopId, ignoreParkingId, ignorePointOfInterestId } = this.props;
    dispatch(StopPlaceActions.setActiveMap(leafletElement));
    this.reloadNeighbours(leafletElement);

  }

  reloadNeighbours(leafletElement) {
    const { client, ignoreStopId, ignoreParkingId, ignorePointOfInterestId } = this.props;
    const bounds = leafletElement.getBounds();
    let includeExpired = new Settings().getShowExpiredStops();
    getNeighbourStops(client, ignoreStopId, bounds, includeExpired);
    getNeighbourParkings(client, ignoreParkingId, bounds, includeExpired);
    getNeighbourPointsOfInterest(client, ignorePointOfInterestId, bounds, includeExpired);
  }


  checkNeighboursAndReload(leafletElement) {
    const {   ignoreStopId,  ignoreParkingId,isNeighbourRefreshNeeded, ignorePointOfInterestId } = this.props;
    if (isNeighbourRefreshNeeded){
      this.reloadNeighbours(leafletElement);
    }
  }

  render() {
    const { position, markers, ignoreStopId, zoom, ignoreParkingId, minZoom, disabled,  ignorePointOfInterestId } = this.props;
    const { coordinatesDialogOpen, compassBearingDialogOpen } = this.state;

    return (

        <div>
          <LeafletMap
              position={position}
              markers={markers}
              zoom={zoom}
              boundsOptions={{ padding: [50, 50] }}
              ref={this.leafletMap}
              key="leafletmap-edit"
              handleOnClick={this.handleMapOnClick.bind(this)}
              handleDragEnd={this.handleMapDragEnd.bind(this)}
              handleChangeCoordinates={this.handleChangeCoordinates.bind(this)}
              dragableMarkers={!disabled}
              activeBaselayer={this.props.activeBaselayer}
              handleBaselayerChanged={this.handleBaselayerChanged.bind(this)}
              enablePolylines={this.props.enablePolylines}
              minZoom={minZoom}
              handleZoomEnd={this.handleZoomEnd.bind(this)}
              handleSetCompassBearing={this.handleSetCompassBearing.bind(this)}
              checkNeighboursAndReload={this.checkNeighboursAndReload.bind(this)}
              onMapReady={this.handleMapReady.bind(this)}
          />
          <CoordinatesDialog
              intl={this.props.intl}
              open={coordinatesDialogOpen}
              coordinates={this.state.coordinates}
              handleClose={this.handleCoordinatesDialogClose.bind(this)}
              handleConfirm={this.handleSubmitChangeCoordinates.bind(this)}
          />
          <CompassBearingDialog
              open={compassBearingDialogOpen}
              intl={this.props.intl}
              compassBearing={this.state.compassBearing}
              handleClose={this.handleCompassBearingDialogClose.bind(this)}
              handleConfirm={this.handleSubmitChangeCompassBearing.bind(this)}
          />
        </div>
    );
  }
}



const mapStateToProps = state => {
  const currentStopPlace = state.stopPlace.current;
  const showStops =  state.user.showStops;
  const neighbourStops = state.stopPlace.neighbourStops;

  const currentParking = state.parking.current;
  const neighbourParkings = state.parking.neighbourParkings;
  const showParkings = state.user.showParkings;

  const currentPointOfInterest = state.pointOfInterest.current;
  const neighbourPointsOfInterest = state.pointOfInterest.neighbourPointsOfInterest;
  const showPointsOfInterest = state.user.showPointsOfInterest;

  let markers = [];
  let position;
  let zoom;
  let minZoom;
  let isNeighbourRefreshNeeded = false;

  if (currentStopPlace) {
    markers = markers.concat(currentStopPlace);
    position = state.stopPlace.centerPosition;
    zoom = state.stopPlace.zoom;
    minZoom = state.stopPlace.minZoom;
  }

  if (neighbourStops && neighbourStops.length && showStops) {
    markers = markers.concat(neighbourStops);
  }

  if (currentParking) {
    markers = markers.concat(currentParking);
    position = state.parking.centerPosition;
    zoom = state.parking.zoom;
    minZoom = state.parking.minZoom;
  }

  if (neighbourParkings && neighbourParkings.length && showParkings) {
    markers = markers.concat(neighbourParkings);
  }

  if (currentPointOfInterest) {
    markers = markers.concat(currentPointOfInterest);
    position = state.pointOfInterest.centerPosition;
    zoom = state.pointOfInterest.zoom;
    minZoom = state.pointOfInterest.minZoom;
  }

  if (neighbourPointsOfInterest && neighbourPointsOfInterest.length && showPointsOfInterest) {
    markers = markers.concat(neighbourPointsOfInterest);
  }

  if (Array.isArray(neighbourStops) && neighbourStops.length > 0 && currentStopPlace !== undefined && currentStopPlace !== null){
    isNeighbourRefreshNeeded = neighbourStops.some(neighbourStop => neighbourStop.id === currentStopPlace.id);
  }

  return {
    position: position,
    zoom: zoom,
    minZoom: minZoom,
    activeBaselayer: state.user.activeBaselayer,
    enablePolylines: state.stopPlace.enablePolylines,
    isCreatingPolylines: state.stopPlace.isCreatingPolylines,
    missingCoordsMap: state.user.missingCoordsMap,
    markers,
    ignoreStopId: state.stopPlace.current ? state.stopPlace.current.id : -1,
    ignoreParkingId: state.parking.current ? state.parking.current.id : -1,
    ignorePointOfInterestId: state.pointOfInterest.current ? state.pointOfInterest.current.id : -1,
    currentParking: state.parking.current,
    currentStopPlace: state.stopPlace.current,
    currentPointOfInterest: state.pointOfInterest.current,
    isNeighbourRefreshNeeded: isNeighbourRefreshNeeded
  };
};

export default withApollo(injectIntl(connect(mapStateToProps)(EditMap)));
