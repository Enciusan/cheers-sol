FROM oven/bun:1.2.6 as base

WORKDIR /app
ARG NEXT_PUBLIC_CIVIC_AUTH_KEY
ARG UPSTASH_REDIS_REST_URL
ARG UPSTASH_REDIS_REST_TOKEN

ENV NEXT_PUBLIC_CIVIC_AUTH_KEY=${NEXT_PUBLIC_CIVIC_AUTH_KEY}
ENV UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}
ENV UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN}

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --ignore-scripts

COPY . .

RUN bun run build

FROM oven/bun:1.2.6-slim as runtime

WORKDIR /app

COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules

EXPOSE 3000

# Start the Next.js application
CMD ["bun", "run", "start"]