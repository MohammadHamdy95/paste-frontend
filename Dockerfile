FROM node:22-alpine AS build
WORKDIR /app
# Where the built bundle calls the paste API; CI overrides for prod.
ARG VITE_API_URL=http://api.paste.localhost
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy
EXPOSE 80
