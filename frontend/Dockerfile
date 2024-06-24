FROM node:latest

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Install TypeScript globally
RUN npm install -g typescript

COPY . .

RUN npm run build

# Application needs owner permissions at runtime
RUN chown -R 1001:1001 /app

USER 1001

EXPOSE 3000

CMD [ "npm" , "run", "dev"]


