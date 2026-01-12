#!/usr/bin/env bash

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

# Lancer la construction de l'image docker.
# Passe en argument la clé publique de la machine hote (qui doit du coup avoir github dans ses "known_hosts" pour permettre le clonage des repos nécessaires depuis github depuis le container
docker build \
  --secret id=tiamat_secret,env=TIAMAT_CLIENT_SECRET \
  --secret id=tiamat_client_id,env=TIAMAT_CLIENT_ID \
  --secret id=keycloak_url,env=MOBI_ITI_KEYCLOAK_URL \
  --secret id=realm,env=MOBI_ITI_REALM \
  --tag=registry.okina.fr/mobiiti/abzu:${PACKAGE_VERSION} --no-cache  --force-rm=true .

docker push registry.okina.fr/mobiiti/abzu:${PACKAGE_VERSION}
