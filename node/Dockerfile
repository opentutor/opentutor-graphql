# syntax=docker/dockerfile:1.0.0-experimental
FROM node:14.15-slim as tsc-compile
RUN apt-get update \
    && apt-get install -y git openssh-client \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /build
COPY . .
# for access to private repos installed by npm
RUN mkdir -p -m 0600 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts
RUN --mount=type=ssh npm ci
RUN npm run build
FROM node:14.15-slim as builder
RUN apt-get update \
    && apt-get install -y git openssh-client \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
# for access to private repos installed by npm
RUN mkdir -p -m 0600 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts
RUN --mount=type=ssh npm ci --production
FROM node:14.15-slim
COPY --from=tsc-compile /build/dist /app
COPY --from=builder /app/node_modules /app/node_modules
WORKDIR /app
ENV NODE_PATH=/app
CMD ["node", "./server.js"]
EXPOSE 3001
