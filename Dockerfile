FROM node:24-alpine AS builder
RUN node -e "const v=process.versions.node.split('.').map(Number); if(v[0]<24 || (v[0]===24 && (v[1]<22 || (v[1]===22 && v[2]<1)))) throw Error('Node security release 24.22.1 or newer required')"
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine
RUN node -e "const v=process.versions.node.split('.').map(Number); if(v[0]<24 || (v[0]===24 && (v[1]<22 || (v[1]===22 && v[2]<1)))) throw Error('Node security release 24.22.1 or newer required')"
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV DATA_DIR=/app/data
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/data ./data
EXPOSE 8080
CMD ["node", "server/index.js"]
