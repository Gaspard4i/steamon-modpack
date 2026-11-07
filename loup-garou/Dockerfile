FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev
ENV NODE_ENV=production HOST=0.0.0.0 PORT=10000 DATA_DIR=/tmp/data
EXPOSE 10000
CMD ["node", "server/index.js"]
