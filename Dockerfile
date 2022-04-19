FROM node:16-alpine

WORKDIR /usr/src/app
COPY ["data.json", "index.js", "package.json", "./"]

RUN yarn install --prod

CMD ["node", "index.js"]