# 🚀 Guia de Deploy - Task List App

## ❌ Problema Atual: 502 Bad Gateway

O erro 502 ocorre porque o servidor web (Nginx) não consegue se comunicar com o servidor Node.js.

### Causas Possíveis:
1. ❌ Servidor Node.js não está rodando
2. ❌ Configuração do Nginx incorreta
3. ❌ Variável de ambiente `VITE_API_URL` incorreta no build do frontend
4. ❌ Porta 4000 bloqueada ou não acessível

---

## ✅ Solução: Configuração Completa

### 1️⃣ Configurar Backend (Node.js)

#### 1.1. Criar arquivo `.env` no diretório `back/`

```bash
cd back
nano .env
```

Adicione o seguinte conteúdo:

```env
# Configuração do Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/task_list"

# Configuração de Email (Nodemailer)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="seu-email@gmail.com"
EMAIL_PASS="sua-senha-de-app"
EMAIL_FROM="noreply@task-list.com.br"

# Configuração do Twilio (WhatsApp)
TWILIO_ACCOUNT_SID="seu-account-sid"
TWILIO_AUTH_TOKEN="seu-auth-token"
TWILIO_PHONE_NUMBER="+5511999999999"

# URL do Frontend
FRONTEND_URL="https://app.task-list.com.br"

# Porta do servidor
PORT=4000
```

#### 1.2. Instalar dependências

```bash
cd back
npm install
npx prisma generate
npx prisma migrate deploy
```

#### 1.3. Instalar PM2 (gerenciador de processos)

```bash
npm install -g pm2
```

#### 1.4. Iniciar servidor com PM2

```bash
# Na raiz do projeto
pm2 start ecosystem.config.js

# Verificar se está rodando
pm2 status

# Ver logs em tempo real
pm2 logs task-list-api

# Configurar PM2 para iniciar no boot
pm2 startup
pm2 save
```

---

### 2️⃣ Configurar Frontend (React + Vite)

#### 2.1. Criar arquivo `.env` no diretório `front/`

```bash
cd front
nano .env
```

Adicione:

```env
VITE_API_URL=https://app.task-list.com.br/api
```

⚠️ **IMPORTANTE**: A URL deve apontar para `https://app.task-list.com.br/api` (com `/api`) porque o Nginx vai fazer o proxy reverso.

#### 2.2. Build do frontend

```bash
cd front
npm install
npm run build
```

#### 2.3. Copiar arquivos para o servidor

```bash
# Criar diretório se não existir
sudo mkdir -p /var/www/task-list/front

# Copiar o build para o diretório do servidor
sudo cp -r dist/* /var/www/task-list/front/dist/

# Ajustar permissões
sudo chown -R www-data:www-data /var/www/task-list
sudo chmod -R 755 /var/www/task-list
```

---

### 3️⃣ Configurar Nginx

#### 3.1. Criar arquivo de configuração

```bash
sudo nano /etc/nginx/sites-available/task-list
```

Adicione o conteúdo do arquivo `nginx.conf` (na raiz do projeto).

#### 3.2. Habilitar o site

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/task-list /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

#### 3.3. Configurar SSL (opcional, mas recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d app.task-list.com.br

# Renovação automática (já vem configurado)
sudo certbot renew --dry-run
```

---

### 4️⃣ Verificações Pós-Deploy

#### 4.1. Verificar se o Node.js está rodando

```bash
# Verificar status do PM2
pm2 status

# Verificar se a porta 4000 está ouvindo
sudo netstat -tulpn | grep :4000
# ou
sudo ss -tulpn | grep :4000
```

#### 4.2. Verificar logs do backend

```bash
# Logs do PM2
pm2 logs task-list-api

# Logs do Nginx
sudo tail -f /var/log/nginx/task-list-error.log
sudo tail -f /var/log/nginx/task-list-access.log
```

#### 4.3. Testar a API diretamente

```bash
# Testar se o backend responde localmente
curl http://localhost:4000/api/login

# Deve retornar um erro 401 ou 500 (mas não 502!)
```

#### 4.4. Testar o endpoint público

```bash
curl https://app.task-list.com.br/api/login
```

---

## 🔧 Troubleshooting

### Erro 502 persiste?

1. **Verificar se o Node.js está rodando:**
   ```bash
   pm2 status
   ```
   Se não estiver, inicie:
   ```bash
   pm2 start ecosystem.config.js
   ```

2. **Verificar logs do backend:**
   ```bash
   pm2 logs task-list-api
   ```

3. **Verificar logs do Nginx:**
   ```bash
   sudo tail -f /var/log/nginx/task-list-error.log
   ```

4. **Verificar se a porta 4000 está acessível:**
   ```bash
   sudo netstat -tulpn | grep :4000
   ```

5. **Testar conexão do Nginx para o backend:**
   ```bash
   curl http://localhost:4000
   ```

6. **Verificar firewall:**
   ```bash
   # UFW
   sudo ufw status
   
   # Se necessário, permitir porta 4000 (apenas para localhost)
   sudo ufw allow from 127.0.0.1 to any port 4000
   ```

### Build do frontend não funciona?

1. **Verificar variável de ambiente:**
   ```bash
   cd front
   cat .env
   # Deve conter: VITE_API_URL=https://app.task-list.com.br/api
   ```

2. **Limpar cache e rebuildar:**
   ```bash
   cd front
   rm -rf dist node_modules
   npm install
   npm run build
   ```

3. **Verificar se os arquivos foram copiados:**
   ```bash
   ls -la /var/www/task-list/front/dist/
   ```

### Conexão com banco de dados?

1. **Verificar DATABASE_URL:**
   ```bash
   cd back
   cat .env | grep DATABASE_URL
   ```

2. **Testar conexão com o banco:**
   ```bash
   cd back
   npx prisma db pull
   ```

---

## 📝 Comandos Úteis

### PM2
```bash
pm2 start ecosystem.config.js    # Iniciar
pm2 stop task-list-api            # Parar
pm2 restart task-list-api         # Reiniciar
pm2 logs task-list-api            # Ver logs
pm2 status                        # Ver status
pm2 delete task-list-api          # Remover
```

### Nginx
```bash
sudo systemctl status nginx       # Status
sudo systemctl start nginx        # Iniciar
sudo systemctl stop nginx         # Parar
sudo systemctl reload nginx       # Recarregar
sudo nginx -t                     # Testar configuração
```

### Atualizar aplicação
```bash
# Backend
cd back
git pull
npm install
pm2 restart task-list-api

# Frontend
cd front
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/task-list/front/dist/
```

---

## 📊 Estrutura de Diretórios no Servidor

```
/var/www/task-list/
├── front/
│   └── dist/           # Arquivos do build do frontend
└── back/               # Código do backend (opcional)

~/lista-app/            # Código-fonte do projeto
├── front/
│   ├── src/
│   ├── dist/
│   └── .env
├── back/
│   ├── server.js
│   └── .env
└── ecosystem.config.js
```

---

## 🎯 Checklist de Deploy

- [ ] Criar arquivo `.env` no backend com DATABASE_URL
- [ ] Criar arquivo `.env` no frontend com VITE_API_URL correto
- [ ] Instalar dependências do backend (`npm install`)
- [ ] Rodar migrations do Prisma (`npx prisma migrate deploy`)
- [ ] Instalar PM2 globalmente (`npm install -g pm2`)
- [ ] Iniciar backend com PM2 (`pm2 start ecosystem.config.js`)
- [ ] Verificar se backend está rodando (`pm2 status`)
- [ ] Build do frontend (`npm run build`)
- [ ] Copiar build para `/var/www/task-list/front/dist/`
- [ ] Configurar Nginx (arquivo de configuração)
- [ ] Testar configuração do Nginx (`sudo nginx -t`)
- [ ] Recarregar Nginx (`sudo systemctl reload nginx`)
- [ ] Testar endpoint da API (`curl http://localhost:4000`)
- [ ] Testar site em produção (`https://app.task-list.com.br`)
- [ ] Configurar SSL com Certbot (opcional)
- [ ] Configurar PM2 para iniciar no boot (`pm2 startup && pm2 save`)

---

## 🆘 Precisa de Ajuda?

Se o erro persistir, envie os seguintes logs:

1. **Logs do PM2:**
   ```bash
   pm2 logs task-list-api --lines 50
   ```

2. **Logs do Nginx:**
   ```bash
   sudo tail -50 /var/log/nginx/task-list-error.log
   ```

3. **Status da porta 4000:**
   ```bash
   sudo netstat -tulpn | grep :4000
   ```

4. **Teste manual da API:**
   ```bash
   curl -v http://localhost:4000
   ```

