import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRoutes } from './routes/api.routes.js'; // Importação corrigida com chaves

// Carrega as variáveis do .env
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Injeta os endpoints com versionamento v1
app.use('/api/v1', apiRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🚀 ENGINE DE ANÁLISE DE RISCO CORPORATIVO ATIVA NA PORTA: ${PORT}`);
  console.log(`📊 Endpoint do Board: http://localhost:${PORT}/api/v1/board/executive-summary`);
  console.log(`================================================================`);
});