FROM node:wheezy

RUN apt-get update -y && apt-get upgrade -y

WORKDIR /app

VOLUME /app

RUN npm install

EXPOSE 9000

COPY . /app

CMD npm start