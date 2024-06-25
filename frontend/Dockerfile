FROM node:latest as build-stage

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Install TypeScript globally
RUN npm install -g typescript

COPY . .

RUN npm run build

FROM nginx:stable-alpine as production-stage

COPY --chown=101 --from=build-stage /app/dist /usr/share/nginx/html

COPY --chown=101 ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]