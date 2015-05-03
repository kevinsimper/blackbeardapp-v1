FROM node:wheezy

RUN apt-get update -y --force-yes && apt-get upgrade -y --force-yes

WORKDIR /app

COPY . /app

RUN npm install

ENV NODE_ENV production

RUN npm run build

CMD npm start

EXPOSE 9000
