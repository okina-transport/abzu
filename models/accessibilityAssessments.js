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


const accessibilityAssements = {
  wheelchairAccess: {
    options: ['TRUE','FALSE','PARTIAL','UNKNOWN'],
    values: {
      nb: {
        UNKNOWN: 'Ukjent rullestolvennlighet',
        TRUE: 'Rullestolvennlig',
        FALSE: 'Ikke rullestolvennlig',
        PARTIAL: 'Delvis rullestolvennlig',
      },
      en: {
        UNKNOWN: 'Unknown wheelchair accessibility',
        TRUE: 'Wheelchair friendly',
        FALSE: 'Not wheelchair friendly',
        PARTIAL: 'Partial wheelchair friendly',
      },
      fr: {
        UNKNOWN: 'Accessibilité PMR inconnue',
        TRUE: 'Accessible PMR',
        FALSE: 'Non accessible PMR',
        PARTIAL: 'Partiellement accessible PMR',
      },
    },
  },
  stepFreeAccess: {
    options: ['TRUE', 'FALSE','PARTIAL', 'UNKNOWN'],
    values: {
      nb: {
        UNKNOWN: 'Ukjent trinnadgang',
        TRUE: 'Trinnfri adgang',
        FALSE: 'Adgang kun med trapper',
        PARTIAL: 'Delvis trinnfri adgang',
      },
      en: {
        UNKNOWN: 'Unknown step access',
        TRUE: 'Step free access',
        FALSE: 'Accessable only by steps',
        PARTIAL: 'Partial Step free access',
      },
      fr: {
        UNKNOWN: 'Accès plain-pied inconnu',
        TRUE: 'Accès de plain-pied',
        FALSE: 'Accessible uniquement par des marches',
        PARTIAL: 'Accès plain-pied partiel',
      },
    },
  },
  EscalatorFreeAccess: {
    options: ['TRUE', 'FALSE','PARTIAL', 'UNKNOWN'],
    values: {
      nb: {
        UNKNOWN: 'Rulletrapp fri ukjent',
        TRUE: 'Rulletrapp fri tilgangg',
        FALSE: 'Bare tilgjengelig med rulletrapp',
        PARTIAL: 'Delvis rulletrapp gratis tilgang',
      },
      en: {
        UNKNOWN: 'Unknown escalator free access',
        TRUE: 'escalator free access',
        FALSE: 'Accessable only by escalator',
        PARTIAL: 'Partial escalator free access',
      },
      fr: {
        UNKNOWN: 'Accès sans escalator inconnu',
        TRUE: 'Accès sans escalator',
        FALSE: 'Accessible uniquement par escalator',
        PARTIAL: 'Accès sans escalator partiel',
      },
    },
  },
  LiftFreeAccess: {
    options: ['TRUE', 'FALSE','PARTIAL', 'UNKNOWN'],
    values: {
      nb: {
        UNKNOWN: 'Ukjent heisfri tilgang',
        TRUE: 'løft gratis tilgang',
        FALSE: 'Kun tilgjengelig med heis',
        PARTIAL: 'Delvis heis gratis tilgang',
      },
      en: {
        UNKNOWN: 'Unknown lift free access',
        TRUE: 'lift free access',
        FALSE: 'Accessable only by lift',
        PARTIAL: 'Partial lift free access',
      },
      fr: {
        UNKNOWN: 'Accès sans ascenseur inconnu',
        TRUE: 'Accès sans ascenseur',
        FALSE: 'Accessible uniquement par ascenseur',
        PARTIAL: 'Accès sans ascenseur partiel',
      },
    },
  },
  AudibleSignalsAvailable: {
    options: ['TRUE', 'FALSE','PARTIAL', 'UNKNOWN'],
    values: {
      nb: {
        UNKNOWN: 'Ukjente hørbare signaler',
        TRUE: 'Hørbare signaler tilgjengelig',
        FALSE: 'Hørbare signaler utilgjengelige',
        PARTIAL: 'Delvis hørbare signaler',
      },
      en: {
        UNKNOWN: 'Unknown audible signals',
        TRUE: 'Audible signals available',
        FALSE: 'Audible signals unavailable',
        PARTIAL: 'Partial audible signals',
      },
      fr: {
        UNKNOWN: 'Signalétique auditive inconnue',
        TRUE: 'Signalétique auditive disponible',
        FALSE: 'Signalétique auditive indisponible',
        PARTIAL: 'Signalétique auditive disponible partiellement',
      },
    },
  },
  VisualSignsAvailable: {
    options: ['TRUE', 'FALSE','PARTIAL', 'UNKNOWN'],
    values: {
      nb: {
        UNKNOWN: 'Ukjente visuelle tegn',
        TRUE: 'Visuelle tegn tilgjengelig',
        FALSE: 'Visuelle tegn utilgjengelige',
        PARTIAL: 'Delvise visuelle tegn',
      },
      en: {
        UNKNOWN: 'Unknown visual signs',
        TRUE: 'Visual signs available',
        FALSE: 'Visual signs unavailable',
        PARTIAL: 'Partial visual signs',
      },
      fr: {
        UNKNOWN: 'Signalétique visuelle inconnue',
        TRUE: 'Signalétique visuelle disponible',
        FALSE: 'Signalétique visuelle indisponible',
        PARTIAL: 'Signalétique visuelle disponible partiellement',
      },
    },
  },
  colors: {
    UNKNOWN: '#e8e3e3',
    TRUE: '#181C56',
    FALSE: '#F44336',
    PARTIAL: '#FF9800',
  },
};

export default accessibilityAssements;
