import { Request, Response } from 'express';
import { AIService } from '../services/ai.service.js';
import { mockAudits } from '../utils/mockData.js';

export class IncidentController {
  static async analyzeSingle(req: Request, res: Response) {
    try {
      const { id_auditoria } = req.body;
      
      // Busca o item dentro do array atualizado de auditorias
      const auditItem = mockAudits.find(item => item.id_auditoria === id_auditoria);

      if (!auditItem) {
        return res.status(404).json({ error: 'Registro de auditoria não localizado.' });
      }

      // Passa o item dentro de um array, pois o evaluateMetrics espera uma lista
      const aiAnalysis = await AIService.evaluateMetrics([auditItem]);
      
      return res.status(200).json({
        dados_origem: auditItem,
        matriz_risco: {
          criticidade: aiAnalysis.nivel_criticidade,
          score_final: aiAnalysis.impacto_score * aiAnalysis.probabilidade_score,
          detalhes: aiAnalysis
        }
      });
    } catch (error) {
      return res.status(500).json({ error: 'Falha no processamento da Matriz de Risco.' });
    }
  }
}