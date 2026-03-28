FROM node:22-alpine

WORKDIR /app

# Paket dosyalarını kopyala ve bağımlılıkları yükle
COPY package*.json ./
RUN npm install

# Tüm proje dosyalarını kopyala
COPY . .

# Vite'in çalışacağı portu aç
EXPOSE 5173

# Network üzerinden ulaşılabilmesi için host ayarıyla çalıştır
CMD ["npm", "run", "dev", "--", "--host"]
