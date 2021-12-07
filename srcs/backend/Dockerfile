FROM node AS production

WORKDIR /usr/src/app

COPY srcs/package*.json ./

RUN npm install

COPY srcs .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]