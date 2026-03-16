# ==========================================
# Dockerfile — ERP Indusvit Backend
# Multi-stage build para producción
# ==========================================

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Ejecutar migraciones y levantar servidor
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
