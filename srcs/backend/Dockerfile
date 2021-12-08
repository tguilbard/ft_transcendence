FROM node AS production

WORKDIR /usr/src/app

COPY srcs/package*.json ./

RUN npm install

COPY srcs .

RUN npm run build

CMD ["node", "dist/main"]