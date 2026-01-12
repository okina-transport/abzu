FROM node:10.16.3
# https://hub.docker.com/_/node/

# dumb-init downloaded from https://github.com/Yelp/dumb-init/releases/download/v1.0.1/dumb-init_1.0.1_amd64.deb
COPY dumb-init_1.0.1_amd64.deb .
RUN dpkg -i dumb-init_*.deb && npm set progress=false

EXPOSE 8000
ENV port=8000

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN --mount=type=secret,id=tiamat_client_id,env=TIAMAT_CLIENT_ID \
    --mount=type=secret,id=tiamat_secret,env=TIAMAT_CLIENT_SECRET \
    --mount=type=secret,id=keycloak_url,env=MOBI_ITI_KEYCLOAK_URL \
    --mount=type=secret,id=realm,env=MOBI_ITI_REALM \
    npm install && npm run build

CMD [ "dumb-init", "npm", "run", "prod" ]
