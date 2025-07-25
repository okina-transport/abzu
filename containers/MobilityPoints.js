import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {withApollo} from 'react-apollo';
import {injectIntl} from 'react-intl';
import Routes from '../routes/';
import {getIn} from '../utils';
import SearchBox from '../components/MainPage/SearchBox';
import Loader from '../components/Dialogs/Loader';
import EditStopGeneral from '../components/EditStopPage/EditStopGeneral';
import EditParentGeneral from '../components/EditParentStopPage/EditParentGeneral';
import EditParkingGeneral from '../components/EditParkingPage/EditParkingGeneral';
import EditPointOfInterestGeneral from '../components/EditPointOfInterestPage/EditPointOfInterestGeneral';
import NewElementsBox from '../components/EditStopPage/NewElementsBox';
import NewStopPlaceInfo from '../components/EditStopPage/NewStopPlaceInfo';
import NewParkingInfo from '../components/EditParkingPage/NewParkingInfo';
import InformationBanner from '../components/EditStopPage/InformationBanner';
import {UserActions} from '../actions/';
import {
    allEntities,
    allEntitiesParkings,
    allEntitiesPointsOfInterest
} from '../graphql/Tiamat/queries';
import StopPlaceActions from '../actions/StopPlaceActions';
import {ParkingActions, PointOfInterestActions} from '../actions';
import {
    getGroupOfStopPlacesIdFromURL
} from '../utils/URLhelpers';
import InformationManager from '../singletons/InformationManager';
import Information from '../config/information';
import LoadingPage from './LoadingPage';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Map from '../components/Map/Map';
import '../styles/main.css';

class MobilityPoints extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showErrorDialog: false,
            resourceNotFound: false,
            isLoadingEntity: false,
            isLoadingSearch: false,
            lastProcessedParams: null,
            lastProcessedPathname: null,

            // ✅ SIMPLE : Référence vers les méthodes de la Map
            mapMethods: null,

            entityCache: {
                stopPlace: {},
                parking: {},
                pointOfInterest: {}
            }
        };

        // Bind des méthodes
        this.handleCloseErrorDialog = this.handleCloseErrorDialog.bind(this);
        this.handleOnClickPathLinkInfo = this.handleOnClickPathLinkInfo.bind(this);
        this.handleInitialLoad = this.handleInitialLoad.bind(this);
        this.handleRouteChange = this.handleRouteChange.bind(this);
        this.handleMarkerSelection = this.handleMarkerSelection.bind(this);
        this.loadEntityForEdit = this.loadEntityForEdit.bind(this);
        this.updatePageTitle = this.updatePageTitle.bind(this);
        this.handleMapReady = this.handleMapReady.bind(this);

        // Références pour éviter les re-renders
        this.mapRef = React.createRef();
        this.editStopGeneralRef = React.createRef();
        this.editParkingGeneralRef = React.createRef();
        this.editPOIGeneralRef = React.createRef();
    }

    // ✅ SIMPLE : Callback quand la Map expose ses méthodes
    handleMapReady(mapMethods) {
        console.log('MobilityPoints: Map prête avec méthodes', mapMethods);
        this.setState({ mapMethods: mapMethods });

        // Passer les méthodes aux composants d'édition qui en ont besoin
        if (this.editStopGeneralRef.current && this.editStopGeneralRef.current.handleMapReady) {
            this.editStopGeneralRef.current.handleMapReady(mapMethods);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        // Props critiques à surveiller
        const criticalProps = [
            'pathname',
            'params',
            'stopPlace',
            'parking',
            'pointOfInterest',
            'activeSearchResult.id',
            'disabled',
            'newStopCreated.open',
            'newParkingCreated.open',
            'isCreatingPolylines'
        ];

        // États critiques à surveiller
        const criticalState = [
            'showErrorDialog',
            'isLoadingEntity',
            'isLoadingSearch',
            'resourceNotFound'
        ];

        // Vérifier les changements dans les props critiques
        for (const prop of criticalProps) {
            if (prop === 'stopPlace' || prop === 'parking' || prop === 'pointOfInterest') {
                const current = this.props[prop];
                const next = nextProps[prop];
                if (Boolean(current) !== Boolean(next) ||
                    (current && next && current.id !== next.id)) {
                    return true;
                }
            } else {
                if (this.getNestedValue(this.props, prop) !== this.getNestedValue(nextProps, prop)) {
                    return true;
                }
            }
        }

        // Vérifier les changements d'état critiques
        for (const stateKey of criticalState) {
            if (this.state[stateKey] !== nextState[stateKey]) {
                return true;
            }
        }

        return false;
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    componentDidMount() {
        this.handleInitialLoad();
        this.handleRouteChange();
    }

    componentDidUpdate(prevProps) {
        const {pathname, params} = this.props;
        const routeChanged = prevProps.pathname !== pathname ||
            JSON.stringify(prevProps.params) !== JSON.stringify(params);

        if (routeChanged) {
            this.handleRouteChange();
        }

        const {activeSearchResult} = this.props;
        const prevActiveSearchResult = prevProps.activeSearchResult;

        if (activeSearchResult &&
            (!prevActiveSearchResult || activeSearchResult.id !== prevActiveSearchResult.id)) {
            this.handleMarkerSelection(activeSearchResult);
        }

        const entityChanged =
            prevProps.stopPlace !== this.props.stopPlace ||
            prevProps.parking !== this.props.parking ||
            prevProps.pointOfInterest !== this.props.pointOfInterest;

        if (entityChanged) {
            this.updatePageTitle();

            // ✅ SIMPLE : Passer les méthodes de la Map aux nouveaux composants d'édition
            if (this.state.mapMethods && this.editStopGeneralRef.current &&
                this.editStopGeneralRef.current.handleMapReady) {
                this.editStopGeneralRef.current.handleMapReady(this.state.mapMethods);
            }
        }
    }

    get routeInfo() {
        const {pathname, params} = this.props;
        if (!pathname) {
            return {mode: 'browse', entityType: null, entityId: null, entity: null};
        }

        const extractIdFromPath = (routeBase) => {
            if (pathname.indexOf(routeBase) > -1) {
                const parts = pathname.split('/');
                const routeIndex = parts.indexOf(routeBase.replace('/', ''));
                if (routeIndex > -1 && parts[routeIndex + 1]) {
                    return parts[routeIndex + 1];
                }
            }
            return null;
        };

        if (pathname.indexOf(Routes.STOP_PLACE) > -1) {
            const entityId = (params && params.stopId) || extractIdFromPath(Routes.STOP_PLACE);
            const mode = entityId ? 'edit' : 'browse';
            const entity = this.props.stopPlace;

            return {
                mode: mode,
                entityType: 'stopPlace',
                entityId: entityId,
                entity: entity
            };
        }
        if (pathname.indexOf(Routes.PARKING) > -1) {
            const entityId = (params && params.parkingId) || extractIdFromPath(Routes.PARKING);
            const mode = entityId ? 'edit' : 'browse';
            const entity = this.props.parking;

            return {
                mode: mode,
                entityType: 'parking',
                entityId: entityId,
                entity: entity
            };
        }
        if (pathname.indexOf(Routes.POINT_OF_INTEREST) > -1) {
            const entityId = (params && params.pointOfInterestId) || extractIdFromPath(Routes.POINT_OF_INTEREST);
            const mode = entityId ? 'edit' : 'browse';
            const entity = this.props.pointOfInterest;

            return {
                mode: mode,
                entityType: 'pointOfInterest',
                entityId: entityId,
                entity: entity
            };
        }

        return {mode: 'browse', entityType: null, entityId: null, entity: null};
    }

    handleInitialLoad() {
        const {
            lastMutatedStopPlaceId,
            lastMutatedParkingId,
            lastMutatedPointOfInterestId,
            activeSearchResult,
            dispatch
        } = this.props;

        const searchResultId = activeSearchResult ? activeSearchResult.id : null;

        const shouldRefreshStopPlace = this.shouldRefreshEntity(lastMutatedStopPlaceId, searchResultId);
        const shouldRefreshParking = this.shouldRefreshEntity(lastMutatedParkingId, searchResultId);
        const shouldRefreshPointOfInterest = this.shouldRefreshEntity(lastMutatedPointOfInterestId, searchResultId);

        const groupOfStopPlacesFromURL = getGroupOfStopPlacesIdFromURL();

        if (shouldRefreshStopPlace) dispatch(StopPlaceActions.clearLastMutatedStopPlaceId());
        if (shouldRefreshParking) dispatch(ParkingActions.clearLastMutatedParkingId());
        if (shouldRefreshPointOfInterest) dispatch(PointOfInterestActions.clearLastMutatedPointOfInterestId());

        if (groupOfStopPlacesFromURL) {
            this.handleGroupOfStopPlace();
        } else if (shouldRefreshStopPlace) {
            this.handleLoadStopPlace();
        } else if (shouldRefreshParking) {
            this.handleLoadParking();
        } else if (shouldRefreshPointOfInterest) {
            this.handleLoadPointOfInterest();
        }
    }

    handleRouteChange() {
        const {mode, entityType, entityId, entity} = this.routeInfo;
        const {client, dispatch} = this.props;

        const currentRoute = mode + '-' + entityType + '-' + entityId;
        if (this.state.lastProcessedRoute === currentRoute) {
            return;
        }
        this.setState({lastProcessedRoute: currentRoute});

        if (mode === 'edit' && entityId && entityId !== 'new') {
            const entityCacheForType = this.state.entityCache[entityType];
            const cachedEntity = entityCacheForType && entityCacheForType[entityId];
            if (cachedEntity && entity && entity.id === entityId) {
                return;
            }

            this.loadEntityForEdit(entityType, entityId);
        } else if (mode === 'edit' && entityId === 'new') {
            if (!entity) {
                dispatch(UserActions.navigateTo('/', ''));
            }
        }
    }

    handleMarkerSelection(activeSearchResult) {
        const {dispatch} = this.props;

        if (!activeSearchResult || !activeSearchResult.id) {
            return;
        }

        let route = '';
        let entityType = activeSearchResult.entityType ||
            activeSearchResult.type ||
            activeSearchResult.subtype ||
            'STOP_PLACE';

        entityType = entityType.toUpperCase();

        switch (entityType) {
            case 'STOP_PLACE':
                route = '/' + Routes.STOP_PLACE + '/';
                break;
            case 'PARKING':
                route = '/' + Routes.PARKING + '/';
                break;
            case 'POINT_OF_INTEREST':
                route = '/' + Routes.POINT_OF_INTEREST + '/';
                break;
            default:
                if (activeSearchResult.stopPlaceType || activeSearchResult.quays) {
                    route = '/' + Routes.STOP_PLACE + '/';
                } else if (activeSearchResult.parkingType || activeSearchResult.parking) {
                    route = '/' + Routes.PARKING + '/';
                } else {
                    route = '/' + Routes.STOP_PLACE + '/';
                }
        }

        try {
            dispatch(UserActions.navigateTo(route, activeSearchResult.id));
        } catch (error) {
            console.error('Erreur lors de la navigation:', error);
        }
    }

    loadEntityForEdit(entityType, entityId) {
        const {client} = this.props;

        const entityCacheForType = this.state.entityCache[entityType];
        const cachedEntity = entityCacheForType && entityCacheForType[entityId];
        if (cachedEntity && Date.now() - cachedEntity.timestamp < 300000) {
            return Promise.resolve();
        }

        this.setState({isLoadingEntity: true});

        const queryConfig = {
            stopPlace: {query: allEntities, dataKey: 'stopPlace'},
            parking: {query: allEntitiesParkings, dataKey: 'parking'},
            pointOfInterest: {query: allEntitiesPointsOfInterest, dataKey: 'pointOfInterest'}
        };

        const config = queryConfig[entityType];
        if (!config) {
            console.error('Config non trouvée pour:', entityType);
            return Promise.reject();
        }

        return client
            .query({
                fetchPolicy: 'network-only',
                query: config.query,
                variables: {id: entityId}
            })
            .then(response => {
                this.setState({isLoadingEntity: false});

                if (!response.data[config.dataKey] || !response.data[config.dataKey].length) {
                    this.setState({
                        showErrorDialog: true,
                        resourceNotFound: true
                    });
                } else {
                    this.setState(prevState => ({
                        entityCache: Object.assign({}, prevState.entityCache, {
                            [entityType]: Object.assign({}, prevState.entityCache[entityType], {
                                [entityId]: {
                                    data: response.data[config.dataKey][0],
                                    timestamp: Date.now()
                                }
                            })
                        })
                    }));
                }
            })
            .catch(() => {
                this.setState({
                    showErrorDialog: true,
                    resourceNotFound: false,
                    isLoadingEntity: false
                });
            });
    }

    shouldRefreshEntity(lastMutatedIds, searchResultId) {
        return Array.isArray(lastMutatedIds) && lastMutatedIds.length && searchResultId && lastMutatedIds.indexOf(searchResultId) > -1;
    }

    handleGroupOfStopPlace() {
        this.setState({isLoadingSearch: true});
        setTimeout(() => this.setState({isLoadingSearch: false}), 500);
    }

    handleLoadStopPlace() {
        this.setState({isLoadingSearch: true});
        setTimeout(() => this.setState({isLoadingSearch: false}), 500);
    }

    handleLoadParking() {
        this.setState({isLoadingSearch: true});
        setTimeout(() => this.setState({isLoadingSearch: false}), 500);
    }

    handleLoadPointOfInterest() {
        this.setState({isLoadingSearch: true});
        setTimeout(() => this.setState({isLoadingSearch: false}), 500);
    }

    updatePageTitle() {
        const {intl} = this.props;
        const {formatMessage} = intl;
        const {entity} = this.routeInfo;

        let title = formatMessage({id: '_title_short'});

        if (entity) {
            const isNew = entity.isNewStop || entity.isNewParking || entity.isNewPointOfInterest;

            if (!isNew && entity.name) {
                title = entity.name;
                if (entity.topographicPlace) {
                    title += ', ' + entity.topographicPlace;
                }
            }
        }

        if (document.title !== title) {
            document.title = title;
        }
    }

    handleCloseErrorDialog() {
        this.props.dispatch(UserActions.navigateTo('/', ''));
        this.setState({
            showErrorDialog: false,
            resourceNotFound: false
        });
    }

    handleOnClickPathLinkInfo() {
        new InformationManager().setShouldPathLinkBeDisplayed(false);
    }

    renderDialogsAndNotifications = () => {
        const {
            newStopCreated,
            newParkingCreated,
            isCreatingPolylines,
            intl
        } = this.props;

        const {showErrorDialog, resourceNotFound} = this.state;
        const {entityId, entityType} = this.routeInfo;
        const {locale, formatMessage} = intl;

        const errorActions = [
            React.createElement(FlatButton, {
                key: "cancel-dialog",
                label: formatMessage({id: 'cancel'}),
                onClick: this.handleCloseErrorDialog
            })
        ];

        const getErrorMessage = () => {
            if (resourceNotFound) {
                const errorKeys = {
                    stopPlace: 'error_stopPlace_404',
                    parking: 'error_parking_404',
                    pointOfInterest: 'error_pointOfInterest_404'
                };
                return formatMessage({id: errorKeys[entityType] || 'error_stopPlace_404'}) + entityId;
            } else {
                const errorKeys = {
                    stopPlace: 'error_unable_to_load_stop',
                    parking: 'error_unable_to_load_parking',
                    pointOfInterest: 'error_unable_to_load_poi'
                };
                return formatMessage({id: errorKeys[entityType] || 'error_unable_to_load_stop'});
            }
        };

        const shouldDisplayMessage = isCreatingPolylines &&
            new InformationManager().getShouldPathLinkBeDisplayed();

        return React.createElement(React.Fragment, null, [
            React.createElement(Dialog, {
                key: 'error-dialog',
                modal: false,
                actions: errorActions,
                open: showErrorDialog,
                onRequestClose: () => this.setState({showErrorDialog: false})
            }, getErrorMessage()),

            newStopCreated && React.createElement(NewStopPlaceInfo, {
                key: 'new-stop-info',
                open: newStopCreated.open,
                stopPlaceId: newStopCreated.stopPlaceId
            }),

            newParkingCreated && React.createElement(NewParkingInfo, {
                key: 'new-parking-info',
                open: newParkingCreated.open,
                parentId: newParkingCreated.parkingId
            }),

            shouldDisplayMessage && React.createElement(InformationBanner, {
                key: 'info-banner',
                title: Information[locale].path_links.title,
                ingress: Information[locale].path_links.ingress,
                body: Information[locale].path_links.body,
                closeButtonTitle: Information[locale].path_links.closeButtonTitle,
                handleOnClick: this.handleOnClickPathLinkInfo
            })
        ]);
    }

    renderEditPanels() {
        const {disabled, stopPlace, parking, pointOfInterest} = this.props;
        const {showErrorDialog} = this.state;

        const shouldShowStopPanel = Boolean(stopPlace) && !showErrorDialog;
        const shouldShowParkingPanel = Boolean(parking) && !showErrorDialog;
        const shouldShowPOIPanel = Boolean(pointOfInterest) && !showErrorDialog;

        return React.createElement(React.Fragment, null, [
            shouldShowStopPanel && React.createElement('div', { key: 'stop-panel' }, [
                !stopPlace.isParent && React.createElement('div', { key: 'stop-content' }, [
                    React.createElement(NewElementsBox, {
                        key: 'new-elements',
                        disabled: disabled
                    }),
                    React.createElement(EditStopGeneral, {
                        key: 'edit-stop',
                        ref: this.editStopGeneralRef,
                        disabled: disabled
                    })
                ]),
                stopPlace.isParent && React.createElement('div', { key: 'parent-content' },
                    React.createElement(EditParentGeneral, {
                        disabled: disabled
                    })
                )
            ]),

            shouldShowParkingPanel && React.createElement('div', { key: 'parking-panel' }, [
                React.createElement(NewElementsBox, {
                    key: 'new-elements-parking',
                    disabled: disabled
                }),
                React.createElement(EditParkingGeneral, {
                    key: 'edit-parking',
                    ref: this.editParkingGeneralRef,
                    disabled: disabled
                })
            ]),

            shouldShowPOIPanel && React.createElement('div', { key: 'poi-panel' },
                React.createElement(EditPointOfInterestGeneral, {
                    ref: this.editPOIGeneralRef,
                    disabled: disabled
                })
            )
        ]);
    }

    render() {
        const {disabled, stopPlace, parking, pointOfInterest} = this.props;
        const {isLoadingEntity, showErrorDialog} = this.state;

        const shouldShowStopPanel = Boolean(stopPlace) && !showErrorDialog;
        const shouldShowParkingPanel = Boolean(parking) && !showErrorDialog;
        const shouldShowPOIPanel = Boolean(pointOfInterest) && !showErrorDialog;
        const shouldShowSearchBox = !shouldShowStopPanel && !shouldShowParkingPanel && !shouldShowPOIPanel;

        return React.createElement('div', {
            style: {position: 'relative', width: '100%', height: '100vh'}
        }, [
            // Dialogs et notifications
            this.renderDialogsAndNotifications(),

            // Panels d'édition
            this.renderEditPanels(),

            // SearchBox
            shouldShowSearchBox && React.createElement('div', {
                key: 'search-container',
                style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 1000,
                    backgroundColor: 'white',
                    padding: '5px',
                    borderRadius: '5px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }
            }, [
                this.state.isLoadingSearch && React.createElement(Loader, { key: 'loader' }),
                React.createElement(SearchBox, { key: 'search-box' })
            ]),

            // Loading indicator
            isLoadingEntity && React.createElement('div', {
                key: 'loading-container',
                style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 1000,
                    backgroundColor: 'white',
                    padding: '10px',
                    borderRadius: '5px'
                }
            }, React.createElement(LoadingPage)),

            // Map
            React.createElement('div', {
                key: 'map-container',
                style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1
                }
            }, React.createElement(Map, {
                ref: this.mapRef,
                key: "main-map",
                disabled: disabled,
                stopPlace: this.props.stopPlace,
                parking: this.props.parking,
                pointOfInterest: this.props.pointOfInterest,
                isEditing: Boolean(this.props.stopPlace || this.props.parking || this.props.pointOfInterest),
                // ✅ SIMPLE : Passer le callback pour recevoir les méthodes de la Map
                onMapReady: this.handleMapReady
            }))
        ]);
    }
}

const mapStateToProps = (state) => {
    const pathname = state.routing && state.routing.locationBeforeTransitions
        ? state.routing.locationBeforeTransitions.pathname
        : '';

    const params = state.routing && state.routing.locationBeforeTransitions
        ? state.routing.locationBeforeTransitions.params
        : {};

    return {
        pathname: pathname,
        params: params,

        stopPlace: state.stopPlace.current || state.stopPlace.newStop,
        parking: state.parking.current || state.parking.newParking,
        pointOfInterest: state.pointOfInterest.current || state.pointOfInterest.newPointOfInterest,

        activeSearchResult: state.stopPlace.activeSearchResult,
        lastMutatedStopPlaceId: state.stopPlace.lastMutatedStopPlaceId || [],
        lastMutatedParkingId: state.parking.lastMutatedParkingId || [],
        lastMutatedPointOfInterestId: state.pointOfInterest.lastMutatedPointOfInterestId || [],

        isCreatingPolylines: state.stopPlace.isCreatingPolylines ||
            state.parking.isCreatingPolylines ||
            state.pointOfInterest.isCreatingPolylines,

        newStopCreated: state.user.newStopCreated || {open: false, stopPlaceId: null},
        newParkingCreated: state.user.newParkingCreated || {open: false, parkingId: null},
        newPointOfInterestCreated: state.user.newPointOfInterestCreated || {open: false, pointOfInterestId: null},

        disabled: !getIn(state.roles, ['allowanceInfo', 'canEdit'], false),

        currentPath: state.user.path
    };
};

export default withApollo(injectIntl(connect(mapStateToProps)(MobilityPoints)));