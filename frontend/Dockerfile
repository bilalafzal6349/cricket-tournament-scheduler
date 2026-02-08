FROM node:20-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

# Install dependencies including rollup explicitly for Vite
RUN pnpm install --frozen-lockfile
RUN pnpm add -D rollup

COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--host"]
