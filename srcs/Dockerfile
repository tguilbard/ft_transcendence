FROM node:lts-alpine3.15

#BACK
WORKDIR /usr/src/app/back

COPY backend/srcs/package*.json .

#dependencies
RUN apk add python3 build-base pango-dev

RUN npm update \
&& npm install
#&& npm i -g rimraf

COPY backend/srcs .

RUN npm run build

#RUN rm -rf srcs

#FRONT
WORKDIR /usr/src/app/front

COPY /frontend/srcs/package*.json ./

# install project dependencies
RUN npm update
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY /frontend/srcs .

# build app for production with minification
RUN npm run build
RUN mv dist ../back/app
RUN rm -rf srcs

WORKDIR /usr/src/app/back

CMD ["node", "dist/main"]
#CMD ["npm", "run", "start"]
#CMD "sh"