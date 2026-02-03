FROM node:20-alpine

WORKDIR /app

# Copia os arquivos de definição de pacotes primeiro
COPY package*.json ./

# Instala as dependências durante a construção da imagem
RUN npm install

# Copia o restante dos arquivos
COPY . .

# Expõe a porta do Next.js
EXPOSE 3000

# Inicia o servidor de desenvolvimento
CMD ["npm", "run", "dev"]