FROM node:17 AS production

WORKDIR /usr/src/app

COPY srcs/package*.json ./

RUN npm update \
&& npm install \
&& npm i -g rimraf

COPY srcs .

RUN npm run build

CMD ["node", "dist/main"]