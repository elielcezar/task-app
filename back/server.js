import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usuariosRoutes from './routes/usuarios.js';
import imoveisRoutes from './routes/tarefas.js';
import loginRoutes from './routes/login.js';
import senhaRoutes from './routes/senha.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { verificarConfiguracao } from './utils/emailConfig.js';

// Carregar variáveis de ambiente do arquivo .env PRIMEIRO
dotenv.config();

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definir a porta DEPOIS de carregar o .env
const PORT = process.env.PORT || 3003;

const app = express();
app.use(express.json());
app.use(cors());

// Rotas especificas para cada caso
app.use(usuariosRoutes);
app.use(imoveisRoutes);
app.use(loginRoutes);
app.use(senhaRoutes);
// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

verificarConfiguracao();

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
   