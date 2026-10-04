FROM node:24-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

USER node
CMD ["./node_modules/.bin/sse-to-mqtt-node"]
