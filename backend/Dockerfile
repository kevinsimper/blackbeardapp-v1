FROM node:wheezy

RUN apt-get update -y && apt-get upgrade -y

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 8000

CMD npm start