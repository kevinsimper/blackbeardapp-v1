FROM node:wheezy

RUN apt-get update -y && apt-get upgrade -y

WORKDIR /app

COPY . /app

ENV NODE_ENV production

RUN npm install

RUN npm run build

CMD npm start

EXPOSE 9000
