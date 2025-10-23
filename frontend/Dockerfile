# syntax=docker/dockerfile:1

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

COPY tsconfig.json ./
COPY public ./public
COPY src ./src

ARG REACT_APP_API_URL=http://localhost:3001/api
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
