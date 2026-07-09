import { Router } from 'express';
import { IncidentController } from '../controllers/incident.controller.js';
import { BoardController } from '../controllers/board.controller.js';

// Alteração aqui: exportando a constante diretamente
export const apiRoutes = Router();

// Endpoint para analisar o score de risco individual
apiRoutes.post('/risk/analyze', IncidentController.analyzeSingle);

// Endpoint estratégico do diferencial do Board (Visão Holística)
apiRoutes.get('/board/executive-summary', BoardController.getExecutiveSummary);