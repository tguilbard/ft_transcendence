if ! [ -d "./project" ];
then
    git clone https://github.com/nestjs/typescript-starter.git project
fi
cd project
npm i --save @nestjs/websockets @nestjs/platform-socket.io express canvas datauri jsdom

rm -rf src ; cp -r ../src src
npm run start:dev