# ---- Builder ----
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 👇 skip DB during build
ENV SKIP_DB=true
RUN npm run build

# ---- Runner ----
FROM node:20 AS runner
WORKDIR /app

COPY --from=builder /app/.next .next
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/package*.json ./

# 👇 in runtime, connect to DB
ENV SKIP_DB=false
CMD ["npm", "start"]