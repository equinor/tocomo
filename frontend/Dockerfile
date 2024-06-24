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
RUN chown -R node:node /app

USER node

EXPOSE 3000

CMD [ "npm" , "run", "dev"]


