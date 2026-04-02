# ── Stage 1: install app dependencies ─────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: install runtime tools (prisma CLI + tsx) ─────────────────────────
# These run inside the container at startup (db push, seed), not part of the app
FROM node:20-alpine AS runtime-tools
WORKDIR /tools
RUN echo '{"name":"tools","version":"1.0.0"}' > package.json && \
    npm install prisma@6.19.3 tsx typescript --no-save 2>/dev/null

# ── Stage 3: build ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Provide a dummy DATABASE_URL so Prisma generate works without a real DB
ARG DATABASE_URL=mysql://build:build@localhost:3306/build
ENV DATABASE_URL=$DATABASE_URL

RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 4: production runner ─────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Next.js standalone output
COPY --from=builder /app/public             ./public
COPY --from=builder /app/.next/standalone   ./
COPY --from=builder /app/.next/static       ./.next/static
# Remove any .env baked in by Next.js standalone — env vars come from Docker at runtime
RUN rm -f /app/.env /app/.env.*

# Prisma generated client (used by the app at runtime)
COPY --from=builder /app/prisma             ./prisma
COPY --from=builder /app/node_modules/.prisma  ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma  ./node_modules/@prisma

# Runtime tools: prisma CLI + tsx (for db push and seed in entrypoint)
COPY --from=runtime-tools /tools/node_modules  ./node_modules

# Entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["/docker-entrypoint.sh"]
