# syntax=docker/dockerfile:1.0.0-experimental
FROM node:14.16-slim as builder
WORKDIR /build
COPY . .
RUN npm ci
RUN npm run build
WORKDIR /app
COPY . .
RUN npm ci --production
FROM node:14.16-alpine
COPY --from=builder /build/dist /app
COPY --from=builder /app/node_modules /app/node_modules
WORKDIR /app
ENV NODE_PATH=/app
CMD ["node", "./server.js"]
EXPOSE 3001
