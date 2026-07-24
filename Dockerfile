# syntax=docker/dockerfile:1

# ---- Dependencies ----
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Runtime ----
FROM node:20-alpine AS runtime

WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /app/.output ./.output

USER app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", ".output/server/index.mjs"]
