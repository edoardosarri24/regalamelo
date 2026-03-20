FROM node:24-bookworm-slim as builder

WORKDIR /app
RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY pnpm-lock.yaml* pnpm-workspace.yaml package.json ./
RUN npm install -g pnpm

COPY packages/shared packages/shared
COPY apps/backend apps/backend
RUN pnpm install

# Build shared first
WORKDIR /app/packages/shared
RUN pnpm build

# Generate Prisma and build backend
WORKDIR /app/apps/backend
RUN npx prisma generate
RUN pnpm build

FROM node:24-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

RUN npm install -g pnpm
RUN pnpm install --prod

WORKDIR /app/apps/backend
RUN npx prisma generate

EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/index.js"]
