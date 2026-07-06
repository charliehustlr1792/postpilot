# ---- Builder: install all deps, generate Prisma client, compile TS ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy manifests + schema first so `postinstall` (prisma generate) has the schema
# and this layer caches when only source changes.
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npm run build

# ---- Runner: slim production image ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Prod deps only (prisma CLI + @prisma/client are runtime deps). postinstall
# regenerates the client for this image.
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev

# Compiled app (includes the copied Prisma client in dist/generated).
COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 5000
ENTRYPOINT ["./docker-entrypoint.sh"]
