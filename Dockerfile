FROM node:10

WORKDIR /auction

COPY package.json package.json

RUN npm install

COPY . .

EXPOSE 8001

RUN npm install -g nodemon

CMD [ "nodemon", "app.js" ]