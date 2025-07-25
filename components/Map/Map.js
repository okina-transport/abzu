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
            localMarkers: [],

            // ✅ SIMPLE : Positions locales des markers déplacés (pas de Redux !)
            localPositions: {}, // { markerId: { lat: x, lng: y } }
            hasLocalChanges: false
        };

        // Bind des méthodes
        this.handleMarkerDragEnd = this.handleMarkerDragEnd.bind(this);
        this.syncPositionsToRedux = this.syncPositionsToRedux.bind(this);
        this.resetLocalPositions = this.resetLocalPositions.bind(this);
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
            } else {
                this.loadMarkersFromAPI(client);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des données :", error);
            this.loadMarkersFromAPI(client);
        }

        // ✅ SIMPLE : Exposer les méthodes pour les composants parents
        if (this.props.onMapReady) {
            this.props.onMapReady({
                syncPositions: this.syncPositionsToRedux,
                resetPositions: this.resetLocalPositions,
                hasChanges: () => this.state.hasLocalChanges
            });
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

    // ✅ SIMPLE : Une seule fonction pour gérer tous les drags
    handleMarkerDragEnd(marker, event) {
        const latlng = event.target.getLatLng();
        const newPosition = { lat: latlng.lat, lng: latlng.lng };

        // Stocker la nouvelle position localement
        this.setState(prevState => ({
            localPositions: {
                ...prevState.localPositions,
                [marker.id]: newPosition
            },
            hasLocalChanges: true
        }));

        // Mettre à jour le sessionStorage pour les markers locaux
        this.updateLocalMarkerPosition(marker.id, newPosition);


        console.log('Marker déplacé:', marker.id, newPosition);
    }

    // ✅ SIMPLE : Synchroniser avec Redux seulement quand nécessaire (à la sauvegarde)
    syncPositionsToRedux() {
        const { localPositions } = this.state;
        const { stopPlace, parking, pointOfInterest, dispatch } = this.props;

        console.log('Synchronisation des positions vers Redux...', localPositions);

        // Synchroniser avec Redux selon le type d'entité en cours d'édition
        Object.keys(localPositions).forEach(markerId => {
            const newPosition = localPositions[markerId];

            // Pour le stopplace actif
            if (stopPlace && markerId === stopPlace.id) {
                dispatch(StopPlaceActions.changeCurrentStopPosition(newPosition));
            }
            // Pour les quays du stopplace actif
            else if (stopPlace && stopPlace.quays && Array.isArray(stopPlace.quays)) {
                const quay = stopPlace.quays.find(q => q.id === markerId);
                if (quay) {
                    // Mettre à jour la position du quay directement dans le state Redux
                    const updatedQuays = stopPlace.quays.map(q =>
                        q.id === markerId ? { ...q, location: newPosition, centroid: newPosition } : q
                    );
                    dispatch(StopPlaceActions.changeCurrentStopPosition({
                        ...stopPlace,
                        quays: updatedQuays
                    }));
                }
            }
            // Pour le parking actif
            else if (parking && markerId === parking.id) {
                dispatch(ParkingActions.changeCurrentParkingPosition(newPosition));
            }
            // Pour le POI actif
            else if (pointOfInterest && markerId === pointOfInterest.id) {
                // Utiliser l'action appropriée pour les POI
                dispatch(UserActions.changeCurrentPointOfInterestPosition(newPosition));
            }
        });

        // Nettoyer les positions locales après synchronisation
        this.setState({
            localPositions: {},
            hasLocalChanges: false
        });
    }

    // ✅ SIMPLE : Reset des positions locales
    resetLocalPositions() {
        this.setState({
            localPositions: {},
            hasLocalChanges: false
        });
        console.log('Positions locales réinitialisées');
    }

    updateLocalMarkerPosition(markerId, newPosition) {
        this.setState(prevState => {
            const updatedLocalMarkers = prevState.localMarkers.map(marker => {
                if (marker.id === markerId) {
                    return {
                        ...marker,
                        location: newPosition
                    };
                }
                return marker;
            });

            try {
                sessionStorage.setItem("markersStorage", LZString.compress(JSON.stringify(updatedLocalMarkers)));
            } catch (error) {
                console.warn("Erreur lors de la mise à jour du storage local:", error);
            }

            return { localMarkers: updatedLocalMarkers };
        });
    }

    handleClick(e, map) {
        const {isCreatingNewStop, isCreatingNewParking, isCreatingNewPointOfInterest} = this.props;

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

    // ✅ SIMPLE : Merger les markers avec les positions locales
    getMarkersWithLocalPositions() {
        let markers = [...this.props.markers];
        const { localPositions } = this.state;

        // Merger avec les markers locaux du sessionStorage
        if (Array.isArray(this.state.localMarkers) && this.state.localMarkers.length > 0) {
            for (const localMarker of this.state.localMarkers) {
                const existingIndex = markers.findIndex(m => m.id === localMarker.id);
                if (existingIndex === -1) {
                    markers.push(localMarker);
                } else {
                    markers[existingIndex] = { ...markers[existingIndex], ...localMarker };
                }
            }
        }

        // Appliquer les positions locales (déplacements en cours)
        markers = markers.map(marker => {
            const localPosition = localPositions[marker.id];
            if (localPosition) {
                return {
                    ...marker,
                    location: localPosition
                };
            }
            return marker;
        });

        // Enrichir avec les infos de drag
        return this.enrichMarkersWithDragInfo(markers);
    }

    // ✅ SIMPLE : Enrichir les markers avec les infos de déplacement
    enrichMarkersWithDragInfo(markers) {
        const { isEditing, stopPlace, parking, pointOfInterest } = this.props;

        return markers.map(marker => {
            let isDraggable = false;

            if (isEditing) {
                // Le marker actif est déplaçable
                if (stopPlace && marker.id === stopPlace.id) isDraggable = true;
                if (parking && marker.id === parking.id) isDraggable = true;
                if (pointOfInterest && marker.id === pointOfInterest.id) isDraggable = true;

                // Les quays du stopplace actif sont déplaçables
                if (stopPlace && stopPlace.quays && Array.isArray(stopPlace.quays)) {
                    const isQuayOfCurrentStop = stopPlace.quays.some(quay => quay.id === marker.id);
                    if (isQuayOfCurrentStop) isDraggable = true;
                }
            }

            return {
                ...marker,
                isDraggable: isDraggable,
                onDragEnd: this.handleMarkerDragEnd
            };
        });
    }

    render() {
        const {position, zoom, isEditing} = this.props;
        const {isLoading, progression} = this.state;

        const enrichedMarkers = this.getMarkersWithLocalPositions();

        if (isLoading) {
            return React.createElement(Modal, { open: isLoading },
                React.createElement(Box, {
                    style: {
                        marginTop: '20%',
                        marginLeft: '40%',
                        justifyContent: "center",
                        alignItems: "center",
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none'
                    }
                }, [
                    React.createElement(CircularProgress, {
                        key: 'progress',
                        size: 60,
                        thickness: 4.5,
                        style: {marginTop: 10, marginLeft: 80}
                    }),
                    React.createElement(Typography, {
                        key: 'text',
                        variant: "h6",
                        style: {marginTop: '2%', marginLeft: '1%'}
                    }, 'Chargement en cours... ' + progression + ' %')
                ])
            );
        }

        return React.createElement(LeafletMap, {
            position: position,
            markers: enrichedMarkers,
            zoom: zoom,
            handleZoomEnd: this.handleZoomEnd.bind(this),
            onDoubleClick: this.handleClick.bind(this),
            handleDragEnd: () => {},
            // ✅ SIMPLE : Activer le drag seulement en mode édition
            dragableMarkers: isEditing,
            activeBaselayer: this.props.activeBaselayer,
            handleBaselayerChanged: this.handleBaselayerChanged.bind(this),
            enablePolylines: false
        });
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

        // Entités en cours d'édition
        stopPlace: state.stopPlace.current,
        parking: state.parking.current,
        pointOfInterest: state.pointOfInterest.current,

        // Mode édition
        isEditing: !!(state.stopPlace.current || state.parking.current || state.pointOfInterest.current),

        ignoreStopId: getIn(state.stopPlace, ['activeSearchResult', 'id'], undefined),
        ignoreParkingId: getIn(state.parking, ['activeSearchResult', 'id'], undefined),
        ignorePointOfInterestId: getIn(state.pointOfInterest, ['activeSearchResult', 'id'], undefined)
    };
};

export default withApollo(injectIntl(connect(mapStateToProps)(Map)));