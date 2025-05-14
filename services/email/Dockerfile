FROM oven/bun

WORKDIR /app

# Copy the root package.json and workspace files
COPY ../../bun.lock .

# Copy the service-specific files
COPY . .

# Install dependencies from the workspace root
RUN bun install

WORKDIR /app/services/email
CMD ["bun", "index.ts"]
