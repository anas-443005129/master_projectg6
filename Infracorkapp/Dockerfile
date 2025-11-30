# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20.19.0

FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG SKIP_DB_MIGRATE=true
ARG POSTGRES_URL
ARG NEXTAUTH_URL
ARG AUTHJS_URL
ARG AUTHJS_TRUST_HOST
ARG AUTH_SECRET
ENV SKIP_DB_MIGRATE=${SKIP_DB_MIGRATE}
ENV POSTGRES_URL=${POSTGRES_URL}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV AUTHJS_URL=${AUTHJS_URL}
ENV AUTHJS_TRUST_HOST=${AUTHJS_TRUST_HOST}
ENV AUTH_SECRET=${AUTH_SECRET}
RUN pnpm build
RUN pnpm prune --prod

FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOST=0.0.0.0
ENV PORT=3000
ARG POSTGRES_URL
ARG NEXTAUTH_URL
ARG AUTHJS_URL
ARG AUTHJS_TRUST_HOST
ARG AUTH_SECRET
ENV POSTGRES_URL=${POSTGRES_URL}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV AUTHJS_URL=${AUTHJS_URL}
ENV AUTHJS_TRUST_HOST=${AUTHJS_TRUST_HOST}
ENV AUTH_SECRET=${AUTH_SECRET}
RUN addgroup -g 1001 -S nextjs && adduser -S nextjs -G nextjs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
