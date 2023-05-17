FROM node:16

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./


RUN yarn install


COPY . .

RUN yarn build

EXPOSE 8080
CMD ["yarn", "start"]