FROM node:7.2.1
# https://hub.docker.com/_/node/


ARG SSH_KEY

RUN mkdir -p /root/.ssh && chmod 0700 /root/.ssh && ssh-keyscan github.com > /root/.ssh/known_hosts && echo "${SSH_KEY}" > /root/.ssh/id_rsa && chmod 600 /root/.ssh/id_rsa

# https://github.com/Yelp/dumb-init
RUN wget --quiet https://github.com/Yelp/dumb-init/releases/download/v1.0.1/dumb-init_1.0.1_amd64.deb
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
