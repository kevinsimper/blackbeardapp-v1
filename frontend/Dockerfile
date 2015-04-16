FROM node:wheezy

RUN apt-get update -y && apt-get upgrade -y

WORKDIR /app

COPY . /app

RUN npm install

ENV NODE_ENV production

RUN npm run build

CMD npm start

EXPOSE 9000
