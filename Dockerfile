FROM node:10 //pull a node image from docker hub

WORKDIR /auction //set the working dir to /auction

COPY package.json package.json //copy package.json to the container

RUN npm install // install package.json modules in container

COPY . . //copy everything to container /auction

EXPOSE 8001 //expose port 8001 to mount it to another port in local machine

RUN npm install -g nodemon // install nodemon for changes on the fly

CMD [ "nodemon", "app.js" ] // start server inside container