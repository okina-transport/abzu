FROM node:10.16.3
# https://hub.docker.com/_/node/

# dumb-init downloaded from https://github.com/Yelp/dumb-init/releases/download/v1.0.1/dumb-init_1.0.1_amd64.deb
COPY dumb-init_1.0.1_amd64.deb .
RUN dpkg -i dumb-init_*.deb

RUN npm set progress=false

EXPOSE 8000
ENV port 8000

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build

EXPOSE 8000
ENV port 8000

CMD [ "dumb-init", "npm", "run", "prod" ]
