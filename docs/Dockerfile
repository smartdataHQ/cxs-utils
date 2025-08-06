# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

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

# Set proper ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Set the command to start the app and bind to all interfaces
CMD ["node", "server.js", "--hostname", "0.0.0.0"]