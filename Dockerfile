FROM node:20-alpine AS client-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client ./
RUN npm run build

FROM node:20-alpine AS app
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=client-build /app/client/dist ./client/dist

COPY server.js ./server.js
COPY plans.json ./plans.json
COPY users.json ./users.json

RUN chown -R node:node /app
USER node

EXPOSE 5001
CMD ["node", "server.js"]

