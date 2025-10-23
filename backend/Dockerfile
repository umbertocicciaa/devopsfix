# syntax=docker/dockerfile:1

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src

RUN npm run build
RUN npm prune --omit=dev

FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/server.js"]
