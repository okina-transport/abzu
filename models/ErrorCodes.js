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


export const MutationErrorCodes = {
  ERROR_STOP_PLACE: 'ERROR_STOP_PLACE',
  ERROR_PATH_LINKS: 'ERROR_PATH_LINKS',
  ERROR_PARKING: 'ERROR_PARKING',
  ERROR_POI: 'ERROR_POI',
};

export const HumanReadableErrorCodes = {
  nb: {
    ERROR_STOP_PLACE: 'Feilet å lagre stoppested',
    ERROR_PATH_LINKS: 'Feilet å lagre ganglenker',
    ERROR_PARKING: 'Feilet å lagre parkering',
    ERROR_POI: 'Feilet å lagre severdighet',
  },
  en: {
    ERROR_STOP_PLACE: 'Failed to save stop place',
    ERROR_PATH_LINKS: 'Failed to save path links',
    ERROR_PARKING: 'Failed to save parking',
    ERROR_POI: 'Failed to save point of interest',
  },
  fr: {
    ERROR_STOP_PLACE: 'Erreur lors de la sauvegarde du point d\'arrêt',
    ERROR_PATH_LINKS: 'Erreur lors de la sauvegarde du cheminement',
    ERROR_PARKING: 'Erreur lors de la sauvegarde du parking',
    ERROR_POI: 'Erreur lors de la sauvegarde du point d\'intérêt',
  },
};
