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
import InformationBanner from '../components/EditStopPage/InformationBanner';
import Information from '../config/information';
import {injectIntl} from 'react-intl';
import InformationManager from '../singletons/InformationManager';
import {allEntitiesParkings} from '../graphql/Tiamat/queries';
import {withApollo} from 'react-apollo';
import '../styles/main.css';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {UserActions} from '../actions/';
import NewElementsBox from '../components/EditStopPage/NewElementsBox';
import LoadingPage from './LoadingPage';
import EditParkingGeneral from '../components/EditParkingPage/EditParkingGeneral';
import NewParkingInfo from "../components/EditParkingPage/NewParkingInfo";
import EditMap from "../components/Map/EditMap";


class Parking extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showErrorDialog: false,
            resourceNotFound: false,
        };
    }

    componentWillUpdate(nextProps) {
        const {parking, intl, originalParking} = nextProps;
        const {formatMessage} = intl;

        let title = '';

        if (parking) {
            if (parking.isNewParking) {
                title = formatMessage({id: '_title_short'});
            } else {
                if (originalParking.name) {
                    title = originalParking.name;
                }
                if (parking.topographicPlace) {
                    title += ', ' + parking.topographicPlace;
                }
            }
        }
        document.title = title;
    }

    handleOnClickPathLinkInfo() {
        new InformationManager().setShouldPathLinkBeDisplayed(false);
    }

    componentDidMount() {
        const {client, dispatch} = this.props;
        const idFromPath = window.location.pathname
            .substring(window.location.pathname.lastIndexOf('/'))
            .replace('/', '');

        if (idFromPath === 'new' && !this.props.parking) {
            dispatch(UserActions.navigateTo('/', ''));
        }

        if (idFromPath && idFromPath.length && idFromPath && idFromPath !== 'new') {
            client
                .query({
                    fetchPolicy: 'network-only',
                    query: allEntitiesParkings,
                    variables: {
                        id: idFromPath,
                    },
                })
                .then(response => {
                    if (!response.data.parking.length) {
                        this.setState({
                            showErrorDialog: true,
                            resourceNotFound: true,
                        });
                    }
                })
                .catch(err => {
                    console.error("error fetching parking", err);
                    this.setState({
                        showErrorDialog: true,
                        resourceNotFound: false,
                    });
                });
        }
    }

    handleCloseErrorDialog() {
        this.props.dispatch(UserActions.navigateTo('/', ''));
        this.setState({showErrorDialog: false});
    }

    render() {
        const {isCreatingPolylines, parking, disabled, newParkingCreated} = this.props;
        const {resourceNotFound, showErrorDialog} = this.state;
        const {locale, formatMessage} = this.props.intl;

        const idFromPath = window.location.pathname
            .substring(window.location.pathname.lastIndexOf('/'))
            .replace('/', '');

        const actions = [
            <FlatButton
                label={formatMessage({id: 'cancel'})}
                onClick={this.handleCloseErrorDialog.bind(this)}
            />,
        ];

        const shouldDisplayMessage =
            isCreatingPolylines &&
            new InformationManager().getShouldPathLinkBeDisplayed();

        return (
            <div>
                <Dialog
                    modal={false}
                    actions={actions}
                    open={showErrorDialog}
                    onRequestClose={() => {
                        this.setState({showErrorDialog: false});
                    }}
                >
                    {resourceNotFound
                        ? formatMessage({id: 'error_parking_404'}) + idFromPath
                        : formatMessage({id: 'error_unable_to_load_parking'})}
                </Dialog>
                <NewParkingInfo open={newParkingCreated.open} parentId={newParkingCreated.parkingId}/>
                {shouldDisplayMessage &&
                <InformationBanner
                    title={Information[locale].path_links.title}
                    ingress={Information[locale].path_links.ingress}
                    body={Information[locale].path_links.body}
                    closeButtonTitle={Information[locale].path_links.closeButtonTitle}
                    handleOnClick={this.handleOnClickPathLinkInfo.bind(this)}
                />
                }
                {(!parking && !showErrorDialog) && <LoadingPage/>}
                {parking &&
                <div>
                    <NewElementsBox disabled={disabled}/>
                    <EditParkingGeneral disabled={disabled}/>
                    <EditMap disabled={disabled}/>
                </div>
                }
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isCreatingPolylines: state.parking.isCreatingPolylines,
    parking: state.parking.current || state.parking.newParking,
    //TODO gérer les rôles correctement
    disabled: false,
    newParkingCreated: state.user.newParkingCreated,
    originalParking: state.parking.originalCurrent
});

const EditPlaceIntl = injectIntl(
    connect(mapStateToProps)(Parking),
);

export default withApollo(EditPlaceIntl);
