FROM oven/bun:1.2.6 as dependencies

WORKDIR /app
COPY package.json bun.lock ./

# Install dependencies but skip problematic postinstall scripts
ENV npm_config_build_from_source=false
ENV SKIP_POSTINSTALL=true
RUN bun install --frozen-lockfile --ignore-scripts

FROM oven/bun:1.2.6 as build

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Build the application
RUN bun run build

FROM oven/bun:1.2.6-slim as runtime

WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["bun", "server.js"]