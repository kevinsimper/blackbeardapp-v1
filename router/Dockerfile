FROM node:4.0

RUN apt-get update -y && apt-get upgrade -y

WORKDIR /app

COPY . /app

RUN npm install

ENV NODE_ENV production

EXPOSE 8500

CMD npm start
