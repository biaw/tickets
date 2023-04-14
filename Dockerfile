FROM node:18-alpine@sha256:ca5d399560a9d239cbfa28eec00417f1505e5e108f3ec6938d230767eaa81f61 AS base
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./


# compile typescript to normal javascript

FROM base AS builder
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM base AS final
RUN npm ci --omit=dev

COPY .env ./.env
COPY --from=builder /app/build ./build

ENV NODE_ENV=production
ENTRYPOINT [ "dumb-init", "npm", "run" ]
CMD [ "start" ]
