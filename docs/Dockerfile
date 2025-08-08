# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package.json
COPY docs/package.json ./

# Install dependencies (using npm install instead of npm ci since package-lock.json might not exist)
RUN npm install

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY docs/ .

# Create public directory if it doesn't exist
RUN mkdir -p public

# Create a .env.production file with necessary environment variables
RUN touch .env.production && \
    echo "NODE_ENV=production" >> .env.production && \
    echo "OPENAI_API_KEY=${OPENAI_API_KEY:-}" >> .env.production && \
    echo "GEMINI_API_KEY=${GEMINI_API_KEY:-}" >> .env.production && \
    echo "AIRTABLE_API_KEY=${AIRTABLE_API_KEY:-}" >> .env.production && \
    echo "AIRTABLE_BASE_ID=${AIRTABLE_BASE_ID:-}" >> .env.production && \
    echo "AIRTABLE_EVENTS_TABLE_ID=${AIRTABLE_EVENTS_TABLE_ID:-}" >> .env.production && \
    echo "AIRTABLE_ALIASES_TABLE_ID=${AIRTABLE_ALIASES_TABLE_ID:-}" >> .env.production

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user to run the application
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy cxs directory to root of the container
COPY cxs /cxs

# Create directory structure for documentation files
RUN mkdir -p /app/data/event-bible/documentation

# Set proper ownership
RUN chown -R nextjs:nodejs /app
RUN chown -R nextjs:nodejs /cxs

# Switch to non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Set the command to start the app and bind to all interfaces
CMD ["node", "server.js", "--hostname", "0.0.0.0"]