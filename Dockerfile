# Estágio de build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm ci

# Copia o código fonte
COPY . .

# Compila o TypeScript
RUN npm run build

# Estágio de produção
FROM node:20-alpine

# Instala o Tini
RUN apk add --no-cache tini

WORKDIR /app

# Copia apenas os arquivos necessários do estágio de build
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

# Instala apenas as dependências de produção
RUN npm ci --only=production

# Expõe a porta que a aplicação usa
EXPOSE 3000

# Configura o Tini como entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

# Comando para iniciar a aplicação
CMD ["npm", "start"] 