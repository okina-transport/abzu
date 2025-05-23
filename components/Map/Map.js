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
import {getParkingsLight, getPOILight, getStopsLight} from '../../graphql/Tiamat/actions';
import {getMarkersForMap} from '../../selectors/Map';
import {CircularProgress} from "material-ui";
import Box from "@material-ui/core/Box";
import {Modal, Typography} from "@material-ui/core";
import LZString from 'lz-string';

class Map extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            progression: 0,
            localMarkers: []
        };
    }

    async componentDidMount() {
        const {formatMessage} = this.props.intl;
        document.title = formatMessage({id: '_title_short'});

        const {client} = this.props;

        try {
            const compressed = sessionStorage.getItem("markersStorage");
            if (compressed !== null) {
                const markersDecompressed = JSON.parse(LZString.decompress(compressed));
                this.setState({ localMarkers: markersDecompressed }, () => {
                    if (Array.isArray(this.state.localMarkers) && this.state.localMarkers.length > 0) {
                        this.setState({ isLoading: false });
                    } else {
                        this.loadMarkersFromAPI(client);
                    }
                });
            }else{
                this.loadMarkersFromAPI(client);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des données :", error);
            {
            }
        }
    }

    loadMarkersFromAPI = async (client) => {
        await getParkingsLight(client);
        this.setState((prevState) => ({
            progression: prevState.progression + 30
        }));

        await getPOILight(client);
        this.setState((prevState) => ({
            progression: prevState.progression + 30
        }));

        await getStopsLight(client);
        this.setState((prevState) => ({
            progression: prevState.progression + 40
        }));

        sessionStorage.setItem("markersStorage", LZString.compress(JSON.stringify(this.props.markers)));
        this.setState({isLoading: false});
    };

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

    handleBaselayerChanged(value) {
        this.props.dispatch(UserActions.changeActiveBaselayer(value));
    }

    render() {
        const {position, zoom} = this.props;
        const {isLoading} = this.state;
        const {progression} = this.state;
        let modifiableMarkers = [...this.props.markers];


        if (Array.isArray(this.state.localMarkers) && this.state.localMarkers.length > 0) {
            modifiableMarkers = this.mergeMarkers(modifiableMarkers, this.state.localMarkers);
        }

        if (isLoading) {
            return <Modal open={isLoading}>

                <Box style={{
                    marginTop: '20%', marginLeft: '40%', justifyContent: "center", alignItems: "center", border: 'none',
                    outline: 'none',
                    boxShadow: 'none'
                }}
                >
                    <CircularProgress size={60} thickness={4.5} style={{marginTop: 10, marginLeft: 80}}/>
                    <Typography variant="h6" style={{marginTop: '2%', marginLeft: '1%'}}>
                        Chargement en cours... {progression} %
                    </Typography>
                </Box>
            </Modal>
        }

        return (
            <LeafletMap
                position={position}
                markers={modifiableMarkers}
                zoom={zoom}
                handleZoomEnd={this.handleZoomEnd.bind(this)}
                onDoubleClick={this.handleClick.bind(this)}
                handleDragEnd={() => {
                }}
                dragableMarkers={false}
                activeBaselayer={this.props.activeBaselayer}
                handleBaselayerChanged={this.handleBaselayerChanged.bind(this)}
                enablePolylines={false}
            />
        );
    }

    mergeMarkers(modifiableMarkers, localMarkers) {
        for (const localMarker of localMarkers) {
            const exists = modifiableMarkers.some(modMarker => modMarker.id === localMarker.id);
            if (!exists) {
                modifiableMarkers.push(localMarker);
            }
        }
        return modifiableMarkers;
    }
}

const mapStateToProps = state => {
    return {
        position: state.stopPlace.centerPosition,
        markers: getMarkersForMap(state),
        kc: state.roles.kc,
        zoom: state.stopPlace.zoom,
        isCreatingNewStop: state.user.isCreatingNewStop,
        isCreatingNewParking: state.user.isCreatingNewParking,
        isCreatingNewPointOfInterest: state.user.isCreatingNewPointOfInterest,
        activeBaselayer: state.user.activeBaselayer,
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
