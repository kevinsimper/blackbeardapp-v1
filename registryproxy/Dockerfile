FROM node:4.0

RUN apt-get update -y --force-yes && apt-get upgrade -y --force-yes

WORKDIR /app

COPY . /app

RUN npm install

ENV NODE_ENV production

CMD npm start

EXPOSE 9500
