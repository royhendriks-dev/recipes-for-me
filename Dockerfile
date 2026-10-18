# Bouwen draait altijd op de architectuur van de bouwer; de uitvoer is statisch en
# dus voor amd64 en arm64 hetzelfde. Alleen de nginx-laag verschilt per platform.
FROM --platform=$BUILDPLATFORM node:24-alpine AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY angular.json tsconfig*.json ./
COPY public ./public
COPY src ./src
RUN npm run build
# version.json (naam, versie, commit) in hetzelfde formaat als /version.json van het portfolio; het portfolio leest
# het via /apps/recipes/version.json. images.yml geeft de waarden mee; lokaal blijft het dev (public/version.json).
ARG APP_VERSION=dev
ARG APP_COMMIT=
RUN printf '{"name":"recipes-for-me","version":"%s","commit":"%s"}\n' "$APP_VERSION" "$APP_COMMIT" > dist/recipes/browser/version.json

FROM nginxinc/nginx-unprivileged:stable-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist/recipes/browser /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
