# ── Frontend (React + Vite) ───────────────────────────────────────────────────
# Multi-stage build:
#   Stage 1 — "builder" installs deps and runs `vite build`
#   Stage 2 — lightweight Node image serves the production bundle

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies using the lockfile for reproducibility
COPY package.json package-lock.json* ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copy the production build from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Configure NGINX to listen on port 3000 and support React Router + API proxy
RUN echo 'server { listen 3000; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } location /api/ { rewrite ^/api/(.*) /$1 break; proxy_pass http://fastapi:8000; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
