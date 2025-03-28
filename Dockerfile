FROM node:22

WORKDIR /app

COPY . .
COPY package.json ./
COPY .env.local ./.env.local

RUN npm install

CMD ["npm", "run", "docker"]
