FROM node:16

WORKDIR /usr/src/app
COPY ["data.json", "index.js", "package.json", "./"]

RUN yarn

CMD ["node", "index.js"]