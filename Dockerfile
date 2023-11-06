FROM node:20-buster AS build

WORKDIR /app

COPY package-lock.json package.json /app/

RUN npm ci

COPY . /app

RUN npm run build

FROM nginx:alpine3.18

COPY --from=build /app/dist /usr/share/nginx/html
