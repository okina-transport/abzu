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


var convict = require('convict');
var request = require('request');
var fs = require('fs');

module.exports = new Promise(function (resolve, reject) {
  var conf = convict({
    env: {
      doc: 'The applicaton environment.',
      format: [ 'production', 'development' ],
      default: 'development',
      env: 'NODE_ENV'
    },
    tiamatEnv: {
      doc: 'Back end applicaton environment.',
      format: [ 'production', 'development', 'test' ],
      default: 'development',
      env: 'TIAMAT_ENV'
    },
    configUrl: {
      doc: 'URL for where to read the configuration',
      format: '*',
      default: 'http://rutebanken.org/do_not_read',
      env: 'CONFIG_URL'
    },
    tiamatBaseUrl: {
      doc: 'Base URL for for tiamat graphql endpoint',
      default: 'http://tiamat:8585/services/stop_places/graphql',
      env: 'TIAMAT_BASE_URL'
    },
    OTPUrl: {
      doc: 'URL for for OTP / Journey planner graphql endpoint',
      format: 'url',
      default: 'https://api-test.entur.org/journeyplanner/2.0/index/graphql',
      env: 'OTP_URL'
    },
    endpointBase: {
      doc: 'Where th application resides, in development defaulting\n' +
        '  to `/` but in other environment `/arrets`',
      format: String,
      default: '/arrets',
      env: 'ENDPOINTBASE'
    },
    authServerUrl: {
      doc: 'URL to keycloak auth server',
      format: String,
      default: '/auth/',
      env: 'AUTH_SERVER_URL'
    },
    authRealmName: {
      doc: 'Authentication realm name',
      format: String,
      default: 'Mobi-iti',
      env: 'AUTH_REALM_NAME'
    },
    netexPrefix: {
      doc: 'Netex Prefix to be used',
      format: String,
      env: 'NETEX_PREFIX'
    },
    mapboxAccessToken: {
      doc: 'Mapbox Access Token',
      format: String,
      default: undefined,
      env: 'MAPBOX_ACCESS_TOKEN'
    },
    mapboxTariffZonesStyle: {
      doc: 'Mapbox Style for Tariff Zones',
      format: String,
      default: undefined,
      env: 'MAPBOX_TARIFF_ZONES_STYLE'
    },
    sentryDSN: {
      doc: 'SENTRY_DSN - found in https://sentry.io/settings/{organisation_slug}/{project_slug}/keys/',
      format: String,
      default: 'https://f321fe0dec4f462b9563b2232d76763a@sentry.okina.fr/8',
      env: 'SENTRY_DSN'
    },
    defaultMapCentroid: {
      doc: 'Default centroid for map. Center of france if not specified',
      format: String,
      default: "[46.7541751,0.0682244]",
      env: 'DEFAULT_MAP_CENTROID'
    }
  });

  // If configuration URL exists, read it and update the configuration object
  var configUrl = conf.get('configUrl');

  if (configUrl.indexOf('do_not_read') == -1) {
    // Read contents from configUrl if it is given

    if (configUrl.indexOf("http") == -1) {
      fs.readFile(configUrl, (error, data) => {
        if (!error) {
        data = JSON.parse(data)
        conf.load(data);
        conf.validate();
        resolve(conf)
      } else {
        reject("Could not load data from " + configUrl, error)
      }
    });
    } else {
      request(configUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          body = JSON.parse(body)
          conf.load(body);
          conf.validate();
          resolve(conf)
        } else {
          reject("Could not load data from " + configUrl, error)
        }
      });
    }
    } else {
        console.log(
            'The CONFIG_URL element has not been set, so you use the default dev-mode configuration'
        );
        conf.validate();
        resolve(conf);
    }
});

