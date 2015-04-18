FROM node:wheezy

RUN apt-get update -y && apt-get upgrade -y

WORKDIR /app

COPY . /app

RUN npm install

ENV NODE_ENV production

EXPOSE 8000

CMD npm start