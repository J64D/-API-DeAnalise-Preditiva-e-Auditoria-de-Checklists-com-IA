import { Router } from 'express';
import { IncidentController } from '../controllers/incident.controller.js';
import { BoardController } from '../controllers/board.controller.js';
import { SecurityController } from '../controllers/security.controller.js';

// Alteração aqui: exportando a constante diretamente
export const apiRoutes = Router();

// Endpoint para analisar o score de risco individual
apiRoutes.post('/risk/analyze', IncidentController.analyzeSingle);

// Endpoint estratégico do diferencial do Board (Visão Holística)
apiRoutes.get('/board/executive-summary', BoardController.getExecutiveSummary);

apiRoutes.get('/security/overview', SecurityController.getOverview);
apiRoutes.get('/security/events', SecurityController.getEvents);
apiRoutes.post('/security/events', SecurityController.createEvent);
apiRoutes.get('/security/alerts', SecurityController.getAlerts);
apiRoutes.patch('/security/alerts/:id', SecurityController.updateAlert);
apiRoutes.get('/security/audit-log', SecurityController.getAuditLog);