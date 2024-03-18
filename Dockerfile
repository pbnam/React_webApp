ARG APP_PREFIX=bpt
ARG APP_HOME=/app/build

# build stage
FROM node:16-alpine as build-stage
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . ./
ARG BUILD_ENV
ARG APP_DOMAIN
ARG APP_PREFIX
ARG APP_HOME

RUN npm run build:$BUILD_ENV

# change to abs path
RUN sed -i -e "s/\/$APP_PREFIX/$APP_DOMAIN/g" $APP_HOME/index.html
RUN cat $APP_HOME/index.html | grep $APP_PREFIX

# production stage
FROM nginx:stable-alpine as production-stage

ARG APP_HOME

COPY --from=build-stage $APP_HOME /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

RUN ls /usr/share/nginx/html
RUN ls /usr/share/nginx/html/static
RUN ls /usr/share/nginx/html/static/js

CMD ["nginx", "-g", "daemon off;"]
