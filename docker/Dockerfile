ARG NODE_VERSION=14.15.0

FROM node:${NODE_VERSION} as dev

WORKDIR /app

COPY src /app/src
COPY package.json .
COPY nest-cli.docker.json /app/nest-cli.json
COPY tsconfig.json .
COPY tsconfig.build.json .

RUN npm install

RUN npx nest build

EXPOSE 3000
CMD TARGET=dev npx nest start --watch --preserveWatchOutput


FROM node:${NODE_VERSION} as prod

COPY --from=dev /app/dist /app
COPY --from=dev /app/node_modules /app/node_modules

EXPOSE 3000

CMD ["node", "/app/main.js"]