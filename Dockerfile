FROM node:22.14-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev
RUN npm install -g @nestjs/cli

COPY . .

RUN npm run build

FROM node:22.14-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["node", "dist/main.js"]