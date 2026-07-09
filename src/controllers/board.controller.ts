import { Request, Response } from 'express';
import { AIService } from '../services/ai.service.js';
import { mockAudits } from '../utils/mockData.js';
import { renderDashboard } from '../views/dashboard.template.js'; // Importa a nossa view

export class BoardController {
  static async getExecutiveSummary(req: Request, res: Response) {
    try {
      const nonConformities = mockAudits.filter(audit => audit.status === 'NAO_CONFORME');
      const assessment = await AIService.evaluateMetrics(nonConformities);

      const scoreFinal = assessment.impacto_score * assessment.probabilidade_score;

      // Se a requisição NÃO vier de um navegador, responde JSON puríssimo
      const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
      if (!acceptsHtml) {
        return res.status(200).json({
          metodologia: "ISO 31000 - Gestão de Riscos Integrados",
          data_analise: "2026-07-09",
          total_nao_conformidades_analisadas: nonConformities.length,
          matriz_risco: {
            criticidade: assessment.nivel_criticidade,
            score_final: scoreFinal,
            detalhes: assessment
          },
          dados_origem: nonConformities
        });
      }

      // Se for o navegador, apenas chama a função de renderização passando as propriedades
      const htmlDashboard = renderDashboard({
        metodologia: "ISO 31000 - Gestão de Riscos Integrados",
        data_analise: "2026-07-09",
        total_nao_conformidades_analisadas: nonConformities.length,
        criticidade: assessment.nivel_criticidade,
        score_final: scoreFinal,
        assessment,
        dados_origem: nonConformities
      });

      res.setHeader('Content-Type', 'text/html');
      return res.send(htmlDashboard);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno ao processar inteligência preditiva." });
    }
  }
}