#!/usr/bin/env bash

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

# Lancer la construction de l'image docker.
# Passe en argument la clé publique de la machine hote (qui doit du coup avoir github dans ses "known_hosts" pour permettre le clonage des repos nécessaires depuis github depuis le container
docker build --tag=registry.okina.fr/mobiiti/abzu:${PACKAGE_VERSION} --force-rm=true . --build-arg SSH_KEY="$(cat ~/.ssh/id_rsa)"
docker push registry.okina.fr/mobiiti/abzu:${PACKAGE_VERSION}