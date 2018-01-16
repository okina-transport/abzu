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


const stopTypes = {
  nb: [
    {
      name: 'Busstopp',
      value: 'onstreetBus',
      quayItemName: 'platform',
      transportMode: 'bus',
      submodes: [
        {
          name: 'Ikke spesifisert',
          value: null
        },
        {
          name: "Ekspressbuss",
          value: "expressBus"
        },
        {
          name: "Erstatningsbuss",
          value: "railReplacementBus"
        },
        {
          name: "Flybuss",
          value: "airportLinkBus"
        },
        {
          name: "Lokalbuss",
          value: "localBus"
        },
        {
          name: "Nattbuss",
          value: "nightBus"
        },
        {
          name: "Regional bussrute",
          value: "regionalBus"
        },
        {
          name: "Shuttlebuss",
          value: "shuttleBus"
        },
        {
          name: "Skolerute",
          value: "schoolBus"
        },
        {
          name: "Turistbuss",
          value: "sightseeingBus"
        }
      ]
    },
    {
      name: 'Bussterminal',
      value: 'busStation',
      quayItemName: 'platform'
    },
    {
      name: 'Bilferjekai',
      value: 'harbourPort',
      quayItemName: 'port',
      transportMode: 'water',
      submodes: [
        {
          name: 'Ikke spesifisert',
          value: null
        },
        {
          value: "highSpeedPassengerService",
          name: "Hurtigbåt"
        },
        {
          value: "nationalCarFerry",
          name: "Hurtigruten"
        },
        {
          value: "localCarFerry",
          name: "Innenriks bilferje"
        },
        {
          value: "internationalCarFerry",
          name: "Internasjonal bilferje"
        },
        {
          value: "highSpeedVehicleService",
          name: "Hurtiggående bilferje"
        }
      ]
    },
    {
      name: 'Passasjerbåtkai',
      value: 'ferryStop',
      quayItemName: 'port',
      transportMode: 'water',
      submodes: [
        {
          name: 'Ikke spesifisert',
          value: null
        },
        {
          value: "highSpeedPassengerService",
          name: "Hurtigbåt"
        },
        {
          value: "localPassengerFerry",
          name: "Innenriks passasjerbåt"
        },
        {
          value: "internationalPassengerFerry",
          name: "Internasjonal passasjerbåt"
        },
        {
          value: "sightseeingService",
          name: "Turistbåtrute"
        }
      ]
    },
    {
      name: 'Togstopp',
      value: 'railStation',
      quayItemName: 'track',
      transportMode: 'rail',
      submodes: [
        {
          name: 'Ikke spesifisert',
          value: null
        },
        {
          value: "longDistance",
          name: "Intercity (IC)"
        },
        {
          value: "internationalRail",
          name: "Internasjonal jernbane"
        },
        {
          value: "local",
          name: "Lokaltog"
        },
        {
          value: "touristRailway",
          name: "Museumtog"
        },
        {
          value: "nightRail",
          name: "Nattog"
        },
        {
          value: "interregionalRail",
          name: "Regiontog (DT)"
        },
        {
          value: "regionalRail",
          name: "Regiontog (RT)"
        }
      ]
    },
    {
      name: 'Trikkestopp',
      value: 'onstreetTram',
      quayItemName: 'platform',
      transportMode: 'tram',
      submodes: [
        {
          name: 'Ikke spesifisert',
          value: null
        },
        {
          value: 'localTram',
          name: 'Sporvogn'
        }
      ]
    },
    {
      name: 'T-banestopp',
      value: 'metroStation',
      quayItemName: 'track',
      transportMode: 'metro',
      submodes: [
        {
          name: 'Ikke spesifisert',
          value: null
        },
        {
          name: 'T-bane',
          value: 'metro'
        }
      ]
    },
    {
      name: 'Flyplass',
      value: 'airport',
      transportMode: 'air',
      quayItemName: 'gate',
      submodes: [
        {
          name: 'Ikke spesifisert',
          value: null
        },
        {
          value: 'domesticFlight',
          name: 'Innenriksterminal'
        },
        {
          value: 'internationalFlight',
          name: 'Utenlandsterminal'
        },
        {
          value: 'helicopterService',
          name: 'Helikopterterminal'
        }
      ]
    },
    {
      name: 'Kabelbanestopp',
      value: 'liftStation',
      quayItemName: 'platform',
      transportMode: 'cableway',
      submodes: [
        {
          name: 'Ikke spesifisert',
          value: null
        },
        {
          name: 'Taubane',
          value: 'telecabin'
        }
      ]
    }
  ],

  en: [
    {
      name: 'Bus stop',
      value: 'onstreetBus',
      quayItemName: 'platform',
      submodes: [
        {
          name: 'Not specified',
          value: null
        },
        {
          name: "Airport Link bus",
          value: "airportLinkBus"
        },
        {
          name: "Express bus",
          value: "expressBus"
        },
        {
          name: "Local bus",
          value: "localBus"
        },
        {
          name: "Night bus",
          value: "nightBus"
        },
        {
          name: "Rail replacement bus",
          value: "railReplacementBus"
        },
        {
          name: "Regional bus",
          value: "regionalBus"
        },
        {
          name: "School bus",
          value: "schoolBus"
        },
        {
          name: "Shuttle bus",
          value: "shuttleBus"
        },
        {
          name: "Sightseeing bus",
          value: "sightseeingBus"
        }
      ]
    },
    {
      name: 'Bus terminal',
      value: 'busStation',
      quayItemName: 'platform'
    },
    {
      name: 'Harbour port',
      value: 'harbourPort',
      quayItemName: 'port',
      transportMode: 'water',
      submodes: [
        {
          name: 'Not specified',
          value: null
        },
        {
          value: "highSpeedPassengerService",
          name: "High speed passenger service"
        },
        {
          value: "highSpeedVehicleService",
          name: "High speed vehicle service"
        },
        {
          value: "internationalCarFerry",
          name: "International car ferry"
        },
        {
          value: "localCarFerry",
          name: "Local car ferry"
        },
        {
          value: "nationalCarFerry",
          name: "National car ferry"
        }
      ]
    },
    {
      name: 'Ferry stop',
      value: 'ferryStop',
      quayItemName: 'port',
      transportMode: 'water',
      submodes: [
        {
          name: 'Not specified',
          value: null
        },
        {
          value: 'highSpeedPassengerService',
          name: 'High speed passenger service'
        },
        {
          value: 'highSpeedVehicleService',
          name: 'High speed vehicle service'
        },
        {
          value: 'internationalPassengerFerry',
          name: 'International passenger ferry'
        },
        {
          value: 'localPassengerFerry',
          name: 'Local passenger ferry'
        },
        {
          value: 'sightseeingService',
          name: 'Sightseeing service'
        }
      ]
    },
    {
      name: 'Rail station',
      value: 'railStation',
      quayItemName: 'track',
      transportMode: 'rail',
      submodes: [
        {
          name: 'Not specified',
          value: null
        },
        {
          value: "internationalRail",
          name: "International rail"
        },
        {
          value: "interregionalRail",
          name: "Interregional rail"
        },
        {
          value: "local",
          name: "Local train"
        },
        {
          value: "longDistance",
          name: "Long distance train"
        },
        {
          value: "nightRail",
          name: "Night rail"
        },
        {
          value: "regionalRail",
          name: "Regional train"
        },
        {
          value: "touristRailway",
          name: "Tourist railway"
        }
      ]
    },
    {
      name: 'City tram',
      value: 'onstreetTram',
      transportMode: 'tram',
      quayItemName: 'platform',
      submodes: [
        {
          name: 'Not specified',
          value: null
        },
        {
          value: 'localTram',
          name: 'Local tram'
        }
      ]
    },
    {
      name: 'Metro stop',
      quayItemName: 'track',
      value: 'metroStation',
      transportMode: 'metro',
      submodes: [
        {
          name: 'Not specified',
          value: null
        },
        {
          name: 'Metro',
          value: 'metro'
        }
      ]
    },
    {
      name: 'Airport',
      value: 'airport',
      transportMode: 'air',
      quayItemName: 'gate',
      submodes: [
        {
          name: 'Not specified',
          value: null
        },
        {
          value: 'domesticFlight',
          name: 'Domestic flight'
        },
        {
          value: 'helicopterService',
          name: 'Helicopter service'
        },
        {
          value: 'internationalFlight',
          name: 'International flight'
        }
      ]
    },
    {
      name: 'Lift station',
      value: 'liftStation',
      quayItemName: 'platform',
      transportMode: 'cableway',
      submodes: [
        {
          name: 'Not specified',
          value: null
        },
        {
          name: 'Telecabin',
          value: 'telecabin'
        }
      ]
    }
  ],

  fr: [
    {
      name: 'Arrêt de bus',
      value: 'onstreetBus',
      quayItemName: 'quay',
      transportMode: 'bus',
      submodes: [
        {
          name: 'Non spécifié',
          value: null
        },
        {
          name: "Bus express",
          value: "expressBus"
        },
        {
          name: "Remplacement de train",
          value: "railReplacementBus"
        },
        {
          name: "Navette aéroport",
          value: "airportLinkBus"
        },
        {
          name: "Bus local",
          value: "localBus"
        },
        {
          name: "Bus de nuit",
          value: "nightBus"
        },
        {
          name: "Bus régional",
          value: "regionalBus"
        },
        {
          name: "Navette",
          value: "shuttleBus"
        },
        {
          name: "Bus scolaire",
          value: "schoolBus"
        },
        {
          name: "Bus tourisme",
          value: "sightseeingBus"
        }
      ]
    },
    {
      name: 'Gare routière',
      value: 'busStation',
      quayItemName: 'quay'
    },
    {
      name: 'Port de plaisance',
      value: 'harbourPort',
      quayItemName: 'quay',
      transportMode: 'water',
      submodes: [
        {
          name: 'Non spécifié',
          value: null
        },
        {
          value: "highSpeedPassengerService",
          name: "Navette passagers grande vitesse"
        },
        {
          value: "nationalCarFerry",
          name: "Service de ferry national"
        },
        {
          value: "localCarFerry",
          name: "Service de ferry local"
        },
        {
          value: "internationalCarFerry",
          name: "Service de ferry international"
        },
        {
          value: "highSpeedVehicleService",
          name: "Navette véhicules grande vitesse"
        }
      ]
    },
    {
      name: 'Arrêt de ferry',
      value: 'ferryStop',
      quayItemName: 'quay',
      transportMode: 'water',
      submodes: [
        {
          name: 'Non spécifié',
          value: null
        },
        {
          value: "highSpeedPassengerService",
          name: "Navette passagers grande vitesse"
        },
        {
          value: "localPassengerFerry",
          name: "Service local de ferry pour passagers"
        },
        {
          value: "internationalPassengerFerry",
          name: "Service international de ferry pour passagers"
        },
        {
          value: "sightseeingService",
          name: "Tourisme"
        }
      ]
    },
    {
      name: 'Station ferroviaire',
      value: 'railStation',
      quayItemName: 'track',
      transportMode: 'rail',
      submodes: [
        {
          name: 'Non spécifié',
          value: null
        },
        {
          value: "longDistance",
          name: "Longue distance"
        },
        {
          value: "internationalRail",
          name: "International"
        },
        {
          value: "local",
          name: "Local"
        },
        {
          value: "touristRailway",
          name: "Tourisme"
        },
        {
          value: "nightRail",
          name: "Train de nuit"
        },
        {
          value: "interregionalRail",
          name: "Interregional"
        },
        {
          value: "regionalRail",
          name: "Régional (TER)"
        }
      ]
    },
    {
      name: 'Tram',
      value: 'onstreetTram',
      quayItemName: 'quay',
      transportMode: 'tram',
      submodes: [
        {
          name: 'Non spécifié',
          value: null
        },
        {
          value: 'localTram',
          name: 'Tram local'
        }
      ]
    },
    {
      name: 'Métro',
      value: 'metroStation',
      quayItemName: 'quay',
      transportMode: 'metro',
      submodes: [
        {
          name: 'Non spécifié',
          value: null
        },
        {
          name: 'Métro',
          value: 'metro'
        }
      ]
    },
    {
      name: 'Aéroport',
      value: 'airport',
      transportMode: 'air',
      quayItemName: 'gate',
      submodes: [
        {
          name: 'Non spécifié',
          value: null
        },
        {
          value: 'domesticFlight',
          name: 'Vol domestique'
        },
        {
          value: 'internationalFlight',
          name: 'Vol international'
        },
        {
          value: 'helicopterService',
          name: 'Héliport'
        }
      ]
    },
    {
      name: 'Téléphérique',
      value: 'liftStation',
      quayItemName: 'quay',
      transportMode: 'cableway',
      submodes: [
        {
          name: 'Non spécifié',
          value: null
        },
        {
          name: 'Télécabine',
          value: 'telecabin'
        }
      ]
    }
  ],


};

export const unknownStopPlaceType = {
  nb: 'Modalitet ikke satt',
  en: 'Modality not defined',
  fr: 'Mode de transport non défini'
};

export const submodes = [
  "airportLinkBus",
  "expressBus",
  "localBus",
  "nightBus",
  "railReplacementBus",
  "regionalBus",
  "schoolBus",
  "shuttleBus",
  "sightseeingBus",
  "localTram",
  "internationalRail",
  "interregionalRail",
  "local",
  "longDistance",
  "nightRail",
  "regionalRail",
  "touristRailway",
  "metro",
  "domesticFlight",
  "helicopterService",
  "internationalFlight",
  "highSpeedPassengerService",
  "highSpeedVehicleService",
  "internationalCarFerry",
  "internationalPassengerFerry",
  "localCarFerry",
  "localPassengerFerry",
  "nationalCarFerry",
  "sightseeingService",
  "telecabin",
  "funicular"
];

export default stopTypes;
