FROM node AS development

WORKDIR /usr/src/app

COPY srcs/package*.json ./

RUN npm install

COPY srcs .

RUN npm run build

EXPOSE 3000 5432 8080

CMD ["node", "dist/main"]