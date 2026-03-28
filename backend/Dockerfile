FROM node:22-alpine

WORKDIR /app

# Paket dosyalarını kopyala ve bağımlılıkları yükle
COPY package*.json ./
RUN npm install

# Tüm proje dosyalarını kopyala
COPY . .

# Backend'in çalışacağı portu aç
EXPOSE 5000

# Geliştirme (veya normal) modunda çalıştır
CMD ["npm", "run", "dev"]
