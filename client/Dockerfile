# Build context is the repo root (see docker-compose.yml) so /shared is available.
FROM node:20-alpine

WORKDIR /app/client

COPY shared /app/shared
COPY client/package*.json ./
RUN npm install

COPY client ./

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
