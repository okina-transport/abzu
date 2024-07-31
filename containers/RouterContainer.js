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
import { Router, Route, IndexRoute } from 'react-router';
import App from './App';
import Places from './Places';
import StopPlace from './StopPlace';
import ReportPage from './ReportPage';
import Routes from '../routes/';
import GroupOfStopPlaces from './GroupOfStopPlaces';
import ImportSalePointPage from './import_sales_points/ImportSalePointPage';
import Parking from "./Parking";
import PointOfInterest from "./PointOfInterest";
import ImportTADPage from "./ImportTADPage";
import ImportAccessibilityPage from "./ImportAccessibilityPage";
import ImportParkingGlobalPage from './import_parkings/ImportParkingGlobalPage';
import ImportPOIGlobalPage from './import_poi/ImportPOIGlobalPage';
import ImportStopPlacesNetexPage from './import_stop_places/ImportStopPlacesNetexPage';

class RouterContainer extends React.Component {
  render() {
    const { path, history } = this.props;

    const routes = (
      <Route path={path} component={App}>
        <IndexRoute component={Places} />
        <Route path={path + Routes.STOP_PLACE + '/:stopId'} component={StopPlace} />
        <Route path={path + Routes.GROUP_OF_STOP_PLACE + '/:groupId'} component={GroupOfStopPlaces} />
        <Route path={path + Routes.REPORTS} component={ReportPage} />
        <Route path={path + Routes.PARKING + '/:parkingId'} component={Parking} />
        <Route path={path + Routes.POINT_OF_INTEREST + '/:pointOfInterestId'} component={PointOfInterest} />
        <Route path={path + Routes.IMPORT_ACCESSIBILITY_CSV} component={ImportAccessibilityPage} />
        <Route path={path + Routes.IMPORT_PARKINGS} component={ImportParkingGlobalPage} />
        <Route path={path + Routes.IMPORT_SALE_POINT_CSV} component={ImportSalePointPage} />
        <Route path={path + Routes.IMPORT_POI} component={ImportPOIGlobalPage} />
        <Route path={path + Routes.IMPORT_TAD} component={ImportTADPage} />
        <Route path={path + Routes.IMPORT_STOP_PLACES} component={ImportStopPlacesNetexPage} />
      </Route>
    );

    return <Router history={history} routes={routes} />;
  }
}

export default RouterContainer;
