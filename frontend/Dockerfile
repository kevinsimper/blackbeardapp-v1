FROM node:wheezy

RUN apt-get update -y && apt-get upgrade -y

WORKDIR /app

VOLUME /app

COPY . /app

ENV NODE_ENV production

RUN npm install

EXPOSE 9000

CMD npm start
