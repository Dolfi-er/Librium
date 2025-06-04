FROM node:22-slim AS build
WORKDIR /app
COPY project/package*.json ./
RUN npm install
COPY project/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY project/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80