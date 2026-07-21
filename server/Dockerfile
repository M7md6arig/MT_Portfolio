# Build context is the repo root (see docker-compose.yml) so /shared is available.
FROM node:20-alpine

WORKDIR /app/server

COPY shared /app/shared
COPY server/package*.json ./
RUN npm install

COPY server ./
RUN npx prisma generate

EXPOSE 4000
CMD ["npm", "run", "dev"]
