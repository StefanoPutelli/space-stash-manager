########################
# 1) Build stage
########################
FROM node:20-alpine AS builder

# cartella di lavoro
WORKDIR /app

# dipendenze
COPY package*.json ./
RUN npm ci         # usa pnpm/yarn se preferisci

# sorgenti
COPY . .

# build ottimizzata in /dist
RUN npm run build


########################
# 2) Runtime stage
########################
FROM nginx:alpine AS runner

# copia i file statici in Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# configurazione SPA: se richiedi /qualunque/percorso restituisce index.html
RUN printf 'server {\n\
  listen 80;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  include /etc/nginx/mime.types;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
