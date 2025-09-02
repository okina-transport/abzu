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
import LeafletMap from './LeafletMap';
import {ParkingActions, StopPlaceActions, UserActions} from '../../actions/';
import {withApollo} from 'react-apollo';
import {getIn} from '../../utils/';
import {injectIntl} from 'react-intl';
import {
    getParkingClusterMarkers,
    getPoiClusterMarkers,
    getStopPlaceClusterMarkers,

} from '../../graphql/Tiamat/actions';
import {getMarkersForMap} from '../../selectors/Map';


class Map extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    async componentDidMount() {
        const {formatMessage} = this.props.intl;
        document.title = formatMessage({id: '_title_short'});

        const {client} = this.props;

       await getStopPlaceClusterMarkers(client);
        getPoiClusterMarkers(client);
        getParkingClusterMarkers(client);
    }



    componentWillUpdate(nextProps) {
        if (this.props.intl.locale !== nextProps.intl.locale) {
            const {formatMessage} = nextProps.intl;
            document.title = formatMessage({id: '_title_short'});
        }
    }

    handleClick(e, map) {
        const {isCreatingNewStop, isCreatingNewParking} = this.props;

        if (isCreatingNewStop) {
            map.leafletElement.doubleClickZoom.disable();
            this.props.dispatch(StopPlaceActions.createNewStop(e.latlng));
        } else if (isCreatingNewParking) {
            map.leafletElement.doubleClickZoom.disable();
            this.props.dispatch(ParkingActions.createNewParking(e.latlng));
        } else {
            map.leafletElement.doubleClickZoom.enable();
        }
    }

    handleZoomEnd(event) {
        this.props.dispatch(UserActions.setZoomLevel(event.target.getZoom()));
    }

    handleMoveEnd(event) {
        this.props.dispatch(UserActions.mapMoveEnd(event.target.getZoom()));
    }

    handleBaselayerChanged(value) {
        this.props.dispatch(UserActions.changeActiveBaselayer(value));
    }

    handleMapReady(leafletElement) {
        const { dispatch, ignoreStopId, ignoreParkingId, ignorePointOfInterestId } = this.props;
        dispatch(StopPlaceActions.setActiveMap(leafletElement));
    }

    render() {
        const {position, zoom, clusterThreshold} = this.props;
        let modifiableMarkers = [...this.props.markers];
        return (
            <LeafletMap
                position={position}
                markers={modifiableMarkers}
                clusterThreshold={clusterThreshold}
                zoom={zoom}
                handleZoomEnd={this.handleZoomEnd.bind(this)}
                handleMoveEnd={this.handleMoveEnd.bind(this)}
                onDoubleClick={this.handleClick.bind(this)}
                handleDragEnd={() => {
                }}
                dragableMarkers={false}
                activeBaselayer={this.props.activeBaselayer}
                handleBaselayerChanged={this.handleBaselayerChanged.bind(this)}
                enablePolylines={false}
                onMapReady={this.handleMapReady.bind(this)}
            />
        );
    }


}

const mapStateToProps = state => {
    return {
        position: state.stopPlace.centerPosition,
        clusterThreshold: state.user.clusterThreshold,
        markers: getMarkersForMap(state),
        kc: state.roles.kc,
        zoom: state.stopPlace.zoom,
        isCreatingNewStop: state.user.isCreatingNewStop,
        isCreatingNewParking: state.user.isCreatingNewParking,
        isCreatingNewPointOfInterest: state.user.isCreatingNewPointOfInterest,
        activeBaselayer: state.user.activeBaselayer,
        activeMap: state.mapUtils.activeMap,
        ignoreStopId: getIn(
            state.stopPlace,
            ['activeSearchResult', 'id'],
            undefined,
        ),
        ignoreParkingId: getIn(
            state.parking,
            ['activeSearchResult', 'id'],
            undefined,
        ),
        ignorePointOfInterestId: getIn(
            state.pointOfInterest,
            ['activeSearchResult', 'id'],
            undefined,
        )
    };
};

export default withApollo(injectIntl(connect(mapStateToProps)(Map)));
