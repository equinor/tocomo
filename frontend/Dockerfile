FROM node:latest

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Install TypeScript globally
RUN npm install -g typescript

# Install serve globally 
RUN npm install -g serve

COPY . .

RUN npm run build

USER 1001

EXPOSE 3000

CMD [ "npm" , "run", "dev"]


