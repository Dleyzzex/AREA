FROM node:15.6.0

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package*.json ./

COPY . .

RUN npm install

CMD [ "npm", "run", "start.dev" ]