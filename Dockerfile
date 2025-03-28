FROM node:22

WORKDIR /app

COPY . .
COPY package.json ./
COPY .env.local ./.env.local

RUN npm install

# Create db directory for migrations if needed
RUN mkdir -p db/migrations

CMD ["npm", "run", "docker"]
