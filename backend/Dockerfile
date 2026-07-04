FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma/schema.prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 4000
ENV NODE_ENV=production

CMD ["npm", "start"]
