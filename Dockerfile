# Multi-stage build producing a small Cloud Run image from Next.js standalone output.

# --- build stage ---
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- runtime stage ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Cloud Run provides $PORT; the standalone server listens on it.
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Copy only what the standalone server needs.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 8080
CMD ["node", "server.js"]
