#!/usr/bin/env node

const fs = require('fs');
const graphqlFetch = require('graphql-fetch');
const convictPromise = require('./config/convict.js');
const introspectionQuery = require('./graphql/Tiamat/introspection').introspectionQuery;
const axios = require('axios');

const KEYCLOAK_URL = process.env.MOBI_ITI_KEYCLOAK_URL;
const CLIENT_ID = process.env.TIAMAT_CLIENT_ID;
const CLIENT_SECRET = process.env.TIAMAT_CLIENT_SECRET;
const REALM = process.env.MOBI_ITI_REALM;

async function fetchBearerToken() {
  try {
    const tokenResponse = await axios.post(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, new URLSearchParams({
      'client_id': CLIENT_ID,
      'client_secret': CLIENT_SECRET,
      'grant_type': 'client_credentials'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return "Bearer " + tokenResponse.data.access_token;
  } catch (error) {
    console.error('Error fetching bearer token:', error.response ? error.response.data : error.message);
  }
}

fetchBearerToken().then(token => {

  convictPromise.then(convict => {
    const url = convict.get('tiamatBaseUrl');
    const headers = new Headers();
    headers.append('Authorization', token)
    return graphqlFetch(url)(introspectionQuery, {}, {headers});
  }).then(response => {
    fs.writeFileSync(
        './graphql/Tiamat/schema.json',
        JSON.stringify(response.data),
        'utf8'
    );
  }).catch(err => {
    console.log("Unable to fetch schema, server exited with error", err);
    process.exit(1);
  });
});
