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
import { connect } from 'react-redux';
import SearchBox from '../components/MainPage/SearchBox';
import Map from '../components/Map/Map';
import {
  getStopPlaceById,
  getGroupOfStopPlacesById,
  getParkingById,
  getPointOfInterestById
} from '../graphql/Tiamat/actions';
import { withApollo } from 'react-apollo';
import formatHelpers from '../modelUtils/mapToClient';
import StopPlaceActions from '../actions/StopPlaceActions';
import {
  removeIdParamFromURL,
  updateURLWithId,
  getStopPlaceIdFromURL,
  getGroupOfStopPlacesIdFromURL,
  getParkingIdFromURL, getPointofInterestIdFromURL
} from '../utils/URLhelpers';
import '../styles/main.css';
import Loader from '../components/Dialogs/Loader';
import {ParkingActions, PointOfInterestActions} from "../actions";

class Places extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  handleGroupOfStopPlace(groupOfStopPlaceId) {
    this.setState({ isLoading: true });
    const { client, dispatch } = this.props;
    getGroupOfStopPlacesById(client, groupOfStopPlaceId).then(({data}) => {
      if (data.groupOfStopPlaces && data.groupOfStopPlaces.length) {
        const groupOfStopPlace = formatHelpers.mapSearchResultatGroup(data.groupOfStopPlaces);
        dispatch(StopPlaceActions.setMarkerOnMap(groupOfStopPlace[0]));
      } else {
        removeIdParamFromURL('groupOfStopPlacesId');
      }
      this.setState({ isLoading: false });
    }).catch(err => {
      this.setState({ isLoading: false });
    });
  }


  handleLoadStopPlace(props, stopPlaceId, forceLoad) {
    const { activeSearchResult, client, dispatch } = props;

    if (forceLoad || (!activeSearchResult && stopPlaceId)) {
      this.setState({ isLoading: true });

      getStopPlaceById(client, stopPlaceId)
        .then(({ data }) => {
          this.setState({ isLoading: false });
          if (data.stopPlace && data.stopPlace.length) {
            const stopPlaces = formatHelpers.mapSearchResultToStopPlaces(
              data.stopPlace
            );
            if (stopPlaces.length) {
              dispatch(StopPlaceActions.setMarkerOnMap(stopPlaces[0]));
            } else {
              removeIdParamFromURL('stopPlaceId');
            }
          } else {
            removeIdParamFromURL('stopPlaceId');
          }
        })
        .catch(err => {
          removeIdParamFromURL('stopPlaceId');
          this.setState({ isLoading: false });
        });
    } else if (!stopPlaceId && activeSearchResult && activeSearchResult.id) {
      updateURLWithId('stopPlaceId', activeSearchResult.id);
    }
  }

  handleLoadParking(props, parkingId, forceLoad) {
    const { activeSearchResult, client, dispatch } = props;

    if (forceLoad || (!activeSearchResult && parkingId)) {
      this.setState({ isLoading: true });

      getParkingById(client, parkingId)
          .then(({ data }) => {
            this.setState({ isLoading: false });
            if (data.parking && data.parking.length) {
              const parkings = formatHelpers.mapSearchResultToParkings(
                  data.parking
              );
              if (parkings.length) {
                dispatch(StopPlaceActions.setMarkerOnMap(parkings[0]));
              } else {
                removeIdParamFromURL('parkingId');
              }
            } else {
              removeIdParamFromURL('parkingId');
            }
          })
          .catch(err => {
            removeIdParamFromURL('parkingId');
            this.setState({ isLoading: false });
          });
    } else if (!parkingId && activeSearchResult && activeSearchResult.id) {
      updateURLWithId('parkingId', activeSearchResult.id);
    }
  }

  handleLoadPointOfInterest(props, pointOfInterestId, forceLoad) {
    const { activeSearchResult, client, dispatch } = props;

    if (forceLoad || (!activeSearchResult && pointOfInterestId)) {
      this.setState({ isLoading: true });

      getPointOfInterestById(client, pointOfInterestId)
          .then(({ data }) => {
            this.setState({ isLoading: false });
            if (data.pointOfInterest && data.pointOfInterest.length) {
              const pointsOfInterest = formatHelpers.mapSearchResultToPointsOfInterest(
                  data.pointOfInterest
              );
              if (pointsOfInterest.length) {
                dispatch(StopPlaceActions.setMarkerOnMap(pointsOfInterest[0]));
              } else {
                removeIdParamFromURL('pointOfInterestId');
              }
            } else {
              removeIdParamFromURL('pointOfInterestId');
            }
          })
          .catch(err => {
            removeIdParamFromURL('pointOfInterestId');
            this.setState({ isLoading: false });
          });
    } else if (!pointOfInterestId && activeSearchResult && activeSearchResult.id) {
      updateURLWithId('pointOfInterestId', activeSearchResult.id);
    }
  }

  componentDidMount() {
    const { lastMutatedStopPlaceId, activeSearchResult, dispatch, lastMutatedParkingId, lastMutatedPointOfInterestId } = this.props;
    const searchResultId = activeSearchResult ? activeSearchResult.id : null;
    const shouldRefreshStopPlace =
      (lastMutatedStopPlaceId.length && searchResultId !== null) &&
      (lastMutatedStopPlaceId.indexOf(searchResultId) > -1);

    const shouldRefreshParking =
        (lastMutatedParkingId.length && searchResultId !== null) &&
        (lastMutatedParkingId.indexOf(searchResultId) > -1);

    const shouldRefreshPointOfInterest =
        (lastMutatedPointOfInterestId.length && searchResultId !== null) &&
        (lastMutatedPointOfInterestId.indexOf(searchResultId) > -1);

    const stopPlaceIdFromURL = getStopPlaceIdFromURL();
    const parkingIdFromURL = getParkingIdFromURL();
    const pointOfInterestIdFromURL = getPointofInterestIdFromURL();
    const groupOfStopPlacesFromURL = getGroupOfStopPlacesIdFromURL();

    const stopPlaceId = shouldRefreshStopPlace
      ? searchResultId
      : stopPlaceIdFromURL;

    const parkingId = shouldRefreshParking
        ? searchResultId
        : parkingIdFromURL;

    const pointOfInterestId = shouldRefreshPointOfInterest
        ? searchResultId
        : pointOfInterestIdFromURL;

    if (shouldRefreshStopPlace) {
      dispatch(StopPlaceActions.clearLastMutatedStopPlaceId());
    }

    if (shouldRefreshParking) {
      dispatch(ParkingActions.clearLastMutatedParkingId());
    }

    if (shouldRefreshPointOfInterest) {
      dispatch(PointOfInterestActions.clearLastMutatedPointOfInterestId());
    }

    if (groupOfStopPlacesFromURL) {
      this.handleGroupOfStopPlace(groupOfStopPlacesFromURL);
    } else if (shouldRefreshStopPlace) {
      this.handleLoadStopPlace(
        this.props,
        stopPlaceId,
        shouldRefreshStopPlace
      );
    }
    else if (shouldRefreshParking) {
      this.handleLoadParking(
          this.props,
          parkingId,
          shouldRefreshParking
      );
    }
    else if (shouldRefreshPointOfInterest) {
      this.handleLoadPointOfInterest(
          this.props,
          pointOfInterestId,
          shouldRefreshPointOfInterest
      );
    }
  }

  render() {
    const { isLoading } = this.state;
    return (
      <div>
        {isLoading && <Loader />}
        <SearchBox />
        <Map />
      </div>
    );
  }
}

const mapStateToProps = ({ stopPlace, user, parking, pointOfInterest }) => ({
  activeSearchResult: stopPlace.activeSearchResult,
  lastMutatedStopPlaceId: stopPlace.lastMutatedStopPlaceId,
  lastMutatedParkingId: parking.lastMutatedParkingId,
  lastMutatedPointOfInterestId: pointOfInterest.lastMutatedPointOfInterestId,
  currentPath: user.path
});

export default withApollo(connect(mapStateToProps)(Places));
