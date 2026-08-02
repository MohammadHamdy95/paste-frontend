FROM node:22-alpine AS build
WORKDIR /app
# No API URL build arg: the UI and API share the same origin by design
# (/v1/* is routed to the backend by the platform Caddy).
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy
EXPOSE 80
