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

const otherTransportModesTypes = {
  fr: [
    { name: 'Aérien', value: 'airport', transportMode: 'air' },
    { name: 'Autocar', value: 'undefined', transportMode: 'coach' },
    { name: 'Ascenseur', value: 'liftStation', transportMode: 'lift' },
    { name: 'Bus', value: 'onstreetBus', transportMode: 'bus' },
    { name: 'Ferroviaire', value: 'railStation', transportMode: 'rail' },
    { name: 'Ferry', value: 'ferryStop', transportMode: 'ferry' },
    { name: 'Funiculaire', value: 'railStation', transportMode: 'funicular' },
    { name: 'Métro', value: 'metroStation', transportMode: 'metro' },
    { name: 'Téléphérique', value: 'liftStation', transportMode: 'cableway' },
    { name: 'Tramway', value: 'onstreetTram', transportMode: 'tram' },
    { name: 'Fluvial', value: 'harbourPort', transportMode: 'water' },
    { name: 'Trolleybus', value: 'onstreetBus', transportMode: 'trolleyBus' },
    { name: 'Autre', value: 'other', transportMode: 'other' },
  ],
  nb: [
    { name: 'Luftfart', value: 'airport', transportMode: 'air' },
    { name: 'Buss', value: 'undefined', transportMode: 'coach' },
    { name: 'Heis', value: 'liftStation', transportMode: 'lift' },
    { name: 'Buss', value: 'onstreetBus', transportMode: 'bus' },
    { name: 'Jernbane', value: 'railStation', transportMode: 'rail' },
    { name: 'Ferje', value: 'ferryStop', transportMode: 'ferry' },
    { name: 'Kabelbane', value: 'railStation', transportMode: 'funicular' },
    { name: 'T-bane', value: 'metroStation', transportMode: 'metro' },
    { name: 'Taubane',  value: 'liftStation', transportMode: 'cableway' },
    { name: 'Trikk', value: 'onstreetTram', transportMode: 'tram' },
    { name: 'Vann', value: 'harbourPort', transportMode: 'water' },
    { name: 'Trolleybuss', value: 'onstreetBus', transportMode: 'trolleyBus' },
    { name: 'Annet', value: 'other', transportMode: 'other' },
  ],
  en: [
    { name: 'Air', value: 'airport', transportMode: 'air' },
    { name: 'Coach', value: 'undefined', transportMode: 'coach' },
    { name: 'Lift', value: 'liftStation', transportMode: 'lift' },
    { name: 'Bus', value: 'onstreetBus', transportMode: 'bus' },
    { name: 'Rail', value: 'railStation', transportMode: 'rail' },
    { name: 'Ferry', value: 'ferryStop', transportMode: 'ferry' },
    { name: 'Funicular', value: 'railStation', transportMode: 'funicular' },
    { name: 'Metro', value: 'metroStation', transportMode: 'metro' },
    { name: 'Cable Car', value: 'liftStation', transportMode: 'cableway' },
    { name: 'Tram', value: 'onstreetTram', transportMode: 'tram' },
    { name: 'Water', value: 'harbourPort', transportMode: 'water' },
    { name: 'Trolleybus', value: 'onstreetBus', transportMode: 'trolleyBus' },
    { name: 'Other', value: 'other', transportMode: 'other' },
  ]
};


export default otherTransportModesTypes;
