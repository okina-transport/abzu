import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import Keycloak from 'keycloak-js';
import Root from './containers/Root';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import cfgreader from './config/readConfig';
import 'intl';
import { ApolloProvider } from 'react-apollo';
import axios from 'axios';
import Promise from 'promise-polyfill';
import 'babel-polyfill';
import ErrorBoundry from './containers/ErrorBoundry';

if (!window.Promise) {
  window.Promise = Promise;
}

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

function renderIndex(path, kc) {
  const configureStore = require('./store/store').default;
  const store = configureStore(kc);
  const history = syncHistoryWithStore(browserHistory, store.self);
  render(
    <ErrorBoundry>
      <ApolloProvider store={store.self} client={store.client}>
        <Root path={path} history={history} />
      </ApolloProvider>
    </ErrorBoundry>
    ,
    document.getElementById('root'),
  );
}

cfgreader.readConfig(
  function(config) {
    window.config = config;

    let token = JSON.parse(localStorage.getItem('ABZU::GKT_TOKEN'));

    /* Renews token if it expires within 30 minutes to be on the safer side*/
    if (
      token != null &&
      token.expires > new Date(Date.now() + 60 * 1000 * 30).getTime()
    ) {
      authWithKeyCloak(config.endpointBase);
    } else {
      axios
        .get(config.endpointBase + 'token')
        .then(response => {
          let token = JSON.stringify(response.data);
          localStorage.setItem('ABZU::GKT_TOKEN', token);
          authWithKeyCloak(config.endpointBase);
        })
        .catch(err => {
          console.warn(
            'Failed to get GK token, Kartverket Flyfoto will not work',
            err,
          );
          authWithKeyCloak(config.endpointBase);
        });
    }
  }.bind(this),
);

function authWithKeyCloak(path) {
  let kc = new Keycloak(config.endpointBase + 'config/keycloak.json');

  kc
    .init({ onLoad: 'login-required', checkLoginIframe: false })
    .success(authenticated => {
      if (authenticated) {
        localStorage.setItem('ABZU::jwt', kc.token);

        setInterval(() => {
          kc.updateToken(10).error(() => kc.logout());
          localStorage.setItem('ABZU::jwt', kc.token);
        }, 10000);

        renderIndex(path, kc);
      } else {
        kc.login();
      }
    });
}
