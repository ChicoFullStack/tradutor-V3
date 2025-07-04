# Etapa 1: Instalação das Dependências
# Usa uma imagem Node.js baseada em Alpine para um tamanho menor
FROM node:18-alpine AS deps
WORKDIR /app

# CORREÇÃO: Instala as dependências de build necessárias para o 'mediasoup'
# python, make e g++ são essenciais para compilar os módulos nativos.
RUN apk add --no-cache python3 make g++

# Copia os ficheiros de manifesto de pacotes
COPY package.json package-lock.json ./

# Instala todas as dependências
RUN npm install

# ----------------------------------------------------------------

# Etapa 2: Build da Aplicação
FROM node:18-alpine AS builder
WORKDIR /app

# Copia as dependências já instaladas da etapa anterior
COPY --from=deps /app/node_modules ./node_modules
# Copia o resto do código da aplicação
COPY . .

# Executa o script de build do Next.js
RUN npm run build

# ----------------------------------------------------------------

# Etapa 3: Imagem Final de Produção
# Esta imagem não contém as ferramentas de build, tornando-a mais leve e segura.
FROM node:18-alpine AS runner
WORKDIR /app

# Define o ambiente para produção
ENV NODE_ENV=production

# Cria um utilizador não-root para maior segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia os ficheiros de build da etapa 'builder'
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js

# Define o utilizador para executar a aplicação
USER nextjs

# Expõe a porta em que a aplicação Next.js corre
EXPOSE 3000

# Define o comando para iniciar o servidor personalizado
CMD ["node", "server.js"]
