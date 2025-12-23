# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
# Install all dependencies including devDependencies for build
RUN npm ci

COPY src ./src
COPY csv ./csv

# Build the TypeScript application
RUN npm run build

# Prune dev dependencies to keep the image small
RUN npm prune --production

# Stage 2: Production
FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /app

# Copy production node_modules and built app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Copy static assets required for runtime (fonts and public/css)
COPY fonts ./fonts
COPY public ./public
# Optionally copy csv if needed by the app at runtime, though ingestion is usually separate.
# Retaining csv in the image just in case the app needs to reference them, 
# but per architecture, data should be in DB. We will omit csv in runtime to be clean.

# Set environment variables (can be overridden by docker-compose)
ENV NODE_ENV=production

CMD ["dist/index.js"]
