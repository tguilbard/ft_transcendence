FROM node:lts-alpine3.15

ARG BACK_PATH=backend
ARG FRONT_PATH=frontend

ARG VUE_APP_HOST=127.0.0.1
ARG VUE_APP_PORT=3000

#BACK
WORKDIR /usr/src/app/back

COPY ${BACK_PATH}/package*.json .

#dependencies
RUN apk add python3 build-base pango-dev

RUN npm update \
&& npm install
#&& npm i -g rimraf

COPY ${BACK_PATH} .

RUN npm run build

#RUN rm -rf srcs


#FRONT
WORKDIR /usr/src/app/front

COPY ${FRONT_PATH}/package*.json ./

# install project dependencies
RUN npm update
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY ${FRONT_PATH} .

RUN sed -i 's/${SED_REPLACE_HOST}'/${VUE_APP_HOST}/g .env.production \
&& sed -i 's/${SED_REPLACE_PORT}'/${VUE_APP_PORT}/g .env.production

# build app for production with minification
RUN npm run build
RUN mv dist ../back/app
RUN rm -rf srcs

WORKDIR /usr/src/app/back

CMD ["node", "dist/main"]
#CMD ["npm", "run", "start"]
#CMD "sh"