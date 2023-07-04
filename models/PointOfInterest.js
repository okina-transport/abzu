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


import {getIn, setDecimalPrecision} from '../utils/';
import { hasExpired } from '../modelUtils/validBetween';
import {Entities} from "./Entities";
import {getImportedId, simplifyPlaceEquipment} from "./stopPlaceUtils";
import PointOfInterestClassification from "./PointOfInterestClassification";

class PointOfInterest {
  constructor(pointOfInterest, isActive, userDefinedCoordinates) {
    this.pointOfInterest = pointOfInterest;
    this.isActive = isActive;
    this.userDefinedCoordinates = userDefinedCoordinates;
  }


  toClient() {
    const { pointOfInterest, isActive, userDefinedCoordinates } = this;

    let clientPointOfInterest = {
      id: pointOfInterest.id,
      name: getIn(pointOfInterest, ['name', 'value'], ''),
      zipCode : pointOfInterest.zipCode,
      address : pointOfInterest.address,
      city : pointOfInterest.city,
      postalCode : pointOfInterest.postalCode,
      ticketFacility : getIn(pointOfInterest, ['pointOfInterestFacilitySet', 'ticketingFacility'], null),
      ticketServiceFacility : getIn(pointOfInterest, ['pointOfInterestFacilitySet', 'ticketingServiceFacility'], null),
      hasExpired: hasExpired(pointOfInterest.validBetween),
      validBetween: pointOfInterest.validBetween,
      isActive: isActive,
      entityType: Entities.POINT_OF_INTEREST,
      parentSiteRef: pointOfInterest.parentSiteRef,
      accessibilityAssessment: pointOfInterest.accessibilityAssessment,
      pointOfInterestOpeningHours: pointOfInterest.pointOfInterestOpeningHours
    };
    let coordinates = getIn(pointOfInterest, ['geometry', 'coordinates'], null);

    if (coordinates && coordinates.length) {
      clientPointOfInterest.location = [coordinates[0][1], coordinates[0][0]];
    }

    if (pointOfInterest.geometry && pointOfInterest.geometry.coordinates) {
      let coordinates = pointOfInterest.geometry.coordinates[0].slice();
      // Leaflet uses latLng, GeoJSON [long,lat]
      clientPointOfInterest.location = [
        setDecimalPrecision(coordinates[1], 6),
        setDecimalPrecision(coordinates[0], 6),
      ];
    } else {
      if (userDefinedCoordinates && pointOfInterest.id === userDefinedCoordinates.pointOfInterestId && userDefinedCoordinates.position) {
        clientPointOfInterest.location = userDefinedCoordinates.position.slice();
      }
    }

    if (pointOfInterest.description) {
      clientPointOfInterest.description = pointOfInterest.description.value;
    }

    if (pointOfInterest.keyValues) {
      clientPointOfInterest.importedId = getImportedId(pointOfInterest.keyValues);
      clientPointOfInterest.keyValues = pointOfInterest.keyValues;
    }

    if (pointOfInterest.placeEquipments) {
      clientPointOfInterest.placeEquipments = simplifyPlaceEquipment(pointOfInterest.placeEquipments);
    }

    if (pointOfInterest.classifications) {
      clientPointOfInterest.classifications = pointOfInterest.classifications
          .map(item => new PointOfInterestClassification(item).toClient());
    }

    return clientPointOfInterest;
  }
}

export default PointOfInterest;
