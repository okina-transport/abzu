const mockRailReplacementStop = {
  data: {
    pathLink: [],
    stopPlace: [
      {
        __typename: 'StopPlace',
        id: 'NSR:StopPlace:70392',
        name: {
          value: 'TestStopp - buss for tog',
          __typename: 'EmbeddableMultilingualString'
        },
        alternativeNames: [],
        weighting: null,
        description: {
          value: null,
          __typename: 'EmbeddableMultilingualString'
        },
        geometry: {
          coordinates: [[9.052734, 60.844911]],
          __typename: 'GeoJSON'
        },
        quays: [
          {
            id: 'NSR:Quay:110500',
            geometry: {
              coordinates: [[9.049687, 60.845538]],
              __typename: 'GeoJSON'
            },
            version: '1',
            compassBearing: null,
            publicCode: null,
            privateCode: null,
            description: {
              value: null,
              __typename: 'EmbeddableMultilingualString'
            },
            keyValues: [
              {
                key: 'imported-id',
                values: [],
                __typename: 'KeyValues'
              }
            ],
            accessibilityAssessment: null,
            placeEquipments: null,
            __typename: 'Quay'
          }
        ],
        version: '2',
        keyValues: [],
        stopPlaceType: 'onstreetBus',
        submode: 'railReplacementBus',
        transportMode: 'bus',
        tariffZones: [],
        topographicPlace: {
          name: {
            value: 'Nord-Aurdal',
            __typename: 'EmbeddableMultilingualString'
          },
          parentTopographicPlace: {
            name: {
              value: 'Oppland',
              __typename: 'EmbeddableMultilingualString'
            },
            __typename: 'TopographicPlace'
          },
          topographicPlaceType: 'town',
          __typename: 'TopographicPlace'
        },
        accessibilityAssessment: {
          limitations: {
            wheelchairAccess: 'UNKNOWN',
            stepFreeAccess: 'UNKNOWN',
            escalatorFreeAccess: 'UNKNOWN',
            liftFreeAccess: 'UNKNOWN',
            audibleSignalsAvailable: 'UNKNOWN',
            __typename: 'AccessibilityLimitations'
          },
          __typename: 'AccessibilityAssessment'
        },
        placeEquipments: null,
        validBetween: {
          fromDate: '2017-06-21T09:35:40.000+0200',
          toDate: null,
          __typename: 'ValidBetween'
        },
        __typename: 'StopPlace'
      }
    ],
    parking: [],
    versions: [
      {
        id: 'NSR:StopPlace:70392',
        validBetween: {
          fromDate: '2017-06-21T09:35:23.000+0200',
          toDate: '2017-06-21T09:35:41.735+0200',
          __typename: 'ValidBetween'
        },
        name: {
          value: 'TestStopp - buss for tog',
          lang: 'no',
          __typename: 'EmbeddableMultilingualString'
        },
        version: '1',
        versionComment: '',
        __typename: 'StopPlace'
      },
      {
        id: 'NSR:StopPlace:70392',
        validBetween: {
          fromDate: '2017-06-21T09:35:40.000+0200',
          toDate: null,
          __typename: 'ValidBetween'
        },
        name: {
          value: 'TestStopp - buss for tog',
          lang: 'no',
          __typename: 'EmbeddableMultilingualString'
        },
        version: '2',
        versionComment: '',
        __typename: 'StopPlace'
      }
    ]
  }
};

export default mockRailReplacementStop;
