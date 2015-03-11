FROM node:wheezy

RUN apt-get update -y && apt-get upgrade -y

WORKDIR /app

VOLUME /app

COPY . /app

RUN npm install

EXPOSE 9000

CMD node /app/server.js