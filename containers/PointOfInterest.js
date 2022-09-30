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
import {allEntitiesPointsOfInterest} from '../graphql/Tiamat/queries';
import {withApollo} from 'react-apollo';
import '../styles/main.css';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {UserActions} from '../actions/';
import NewElementsBox from '../components/EditStopPage/NewElementsBox';
import LoadingPage from './LoadingPage';
import EditPointOfInterestGeneral from '../components/EditPointOfInterestPage/EditPointOfInterestGeneral';
import NewParkingInfo from "../components/EditParkingPage/NewParkingInfo";
import EditMap from "../components/Map/EditMap";


class PointOfInterest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showErrorDialog: false,
            resourceNotFound: false,
        };
    }

    componentWillUpdate(nextProps) {
        const {pointOfInterest, intl, originalPointOfInterest} = nextProps;
        const {formatMessage} = intl;

        let title = '';

        if (pointOfInterest) {
            if (pointOfInterest.isNewPointOfInterest) {
                title = formatMessage({id: '_title_short'});
            } else {
                if (originalPointOfInterest.name) {
                    title = originalPointOfInterest.name;
                }
                if (pointOfInterest.topographicPlace) {
                    title += ', ' + pointOfInterest.topographicPlace;
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

        if (idFromPath === 'new' && !this.props.pointOfInterest) {
            dispatch(UserActions.navigateTo('/', ''));
        }

        if (idFromPath && idFromPath.length && idFromPath && idFromPath !== 'new') {
            client
                .query({
                    fetchPolicy: 'network-only',
                    query: allEntitiesPointsOfInterest,
                    variables: {
                        id: idFromPath,
                    },
                })
                .then(response => {
                    if (!response.data.pointOfInterest.length) {
                        this.setState({
                            showErrorDialog: true,
                            resourceNotFound: true,
                        });
                    }
                })
                .catch(err => {
                    console.error("error fetching point of interest", err);
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
        const {isCreatingPolylines, pointOfInterest, disabled, newPointOfInterestCreated} = this.props;
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
                        ? formatMessage({id: 'error_pointOfInterest_404'}) + idFromPath
                        : formatMessage({id: 'error_unable_to_load_poi'})}
                </Dialog>
                {shouldDisplayMessage &&
                <InformationBanner
                    title={Information[locale].path_links.title}
                    ingress={Information[locale].path_links.ingress}
                    body={Information[locale].path_links.body}
                    closeButtonTitle={Information[locale].path_links.closeButtonTitle}
                    handleOnClick={this.handleOnClickPathLinkInfo.bind(this)}
                />
                }
                {(!pointOfInterest && !showErrorDialog) && <LoadingPage/>}
                {pointOfInterest &&
                <div>
                    <EditPointOfInterestGeneral disabled={disabled}/>
                    <EditMap disabled={disabled}/>
                </div>
                }
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isCreatingPolylines: state.pointOfInterest.isCreatingPolylines,
    pointOfInterest: state.pointOfInterest.current || state.pointOfInterest.newPointOfInterest,
    //TODO gérer les rôles correctement
    disabled: false,
    newPointOfInterestCreated: state.user.newPointOfInterestCreated,
    originalPointOfInterest: state.pointOfInterest.originalCurrent
});

const EditPlaceIntl = injectIntl(
    connect(mapStateToProps)(PointOfInterest),
);

export default withApollo(EditPlaceIntl);
