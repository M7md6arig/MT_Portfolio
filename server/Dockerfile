# Build context is the repo root (see docker-compose.yml) so /shared is available.
FROM node:20-alpine

WORKDIR /app/server

COPY shared /app/shared
# prisma/ must be present before npm install: the postinstall hook runs `prisma generate`,
# which needs schema.prisma.
COPY server/package*.json ./
COPY server/prisma ./prisma
RUN npm install

COPY server ./

EXPOSE 4000
CMD ["npm", "run", "dev"]
