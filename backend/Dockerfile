FROM node:0.12

RUN apt-get update -y --force-yes && \
    apt-get upgrade -y --force-yes && \
    apt-get install -y --force-yes \
      mongodb-clients

WORKDIR /app

COPY . /app

RUN npm install

ENV NODE_ENV production

EXPOSE 8000

CMD npm start
