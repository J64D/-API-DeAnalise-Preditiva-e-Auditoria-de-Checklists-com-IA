import { Request, Response } from 'express';
import { AIService } from '../services/ai.service.js';
import { mockAudits } from '../utils/mockData.js';

export class BoardController {
  static async getExecutiveSummary(req: Request, res: Response) {
    try {
      const nonConformities = mockAudits.filter(audit => audit.status === 'NAO_CONFORME');
      const assessment = await AIService.evaluateMetrics(nonConformities);

      const responseData = {
        metodologia: "ISO 31000 - Gestão de Riscos Integrados",
        data_analise: "2026-07-09",
        total_nao_conformidades_analisadas: nonConformities.length,
        matriz_risco: {
          criticidade: assessment.nivel_criticidade,
          score_final: assessment.impacto_score * assessment.probabilidade_score,
          detalhes: assessment
        },
        dados_origem: nonConformities
      };

      // Se a requisição não vier de um navegador (ex: requisição de código ou API), retorna JSON puro
      const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
      if (!acceptsHtml) {
        return res.status(200).json(responseData);
      }

      // Se for o navegador, renderiza o Dashboard Executivo Premium
      const badgeColor = assessment.nivel_criticidade === 'CRITICO' || assessment.nivel_criticidade === 'ALTO' ? '#ff7b72' : '#f0883e';
      
      const htmlDashboard = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dashboard de Riscos Transversais</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; background-color: #0d1117; color: #c9d1d9; margin: 0; padding: 30px; }
          .container { max-width: 1100px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #30363d; padding-bottom: 20px; margin-bottom: 30px; }
          h1 { font-size: 22px; color: #f0f6fc; margin: 0; font-weight: 600; letter-spacing: 0.5px; }
          .meta-badge { font-size: 12px; background: #1f242c; border: 1px solid #30363d; padding: 6px 12px; border-radius: 6px; color: #8b949e; }
          
          .grid-summary { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin-bottom: 30px; }
          .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
          
          .risk-status { text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; }
          .criticidade-tag { font-size: 28px; font-weight: 800; color: ${badgeColor}; margin: 10px 0; letter-spacing: 1px; }
          .score-sub { font-size: 13px; color: #8b949e; }

          .section-title { font-size: 14px; text-transform: uppercase; color: #58a6ff; font-weight: 600; margin-bottom: 16px; letter-spacing: 1px; border-left: 3px solid #58a6ff; padding-left: 10px; }
          .text-block { rgba(255,255,255,0.05); border-radius: 6px; padding: 14px; font-size: 14px; line-height: 1.6; color: #e6edf3; background: #1f242c; border: 1px solid #21262d; }
          
          .table-title { font-size: 16px; color: #f0f6fc; margin: 40px 0 15px 0; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; background: #161b22; border: 1px solid #30363d; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
          th { background: #1f242c; color: #8b949e; font-size: 12px; text-transform: uppercase; text-align: left; padding: 14px; font-weight: 600; border-bottom: 1px solid #30363d; }
          td { padding: 14px; font-size: 13px; border-bottom: 1px solid #21262d; color: #e6edf3; vertical-align: top; }
          tr:last-child td { border-bottom: none; }
          .badge-sector { display: inline-block; padding: 3px 8px; font-size: 11px; font-weight: 600; border-radius: 4px; background: #232a35; border: 1px solid #38444d; color: #dbedff; }
          .status-alert { color: #f85149; font-weight: 600; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <h1>Painel de Análise Preditiva de Riscos</h1>
              <div style="font-size: 13px; color: #8b949e; margin-top: 5px;">Metodologia Baseada na Diretriz Governamental <strong>${responseData.metodologia}</strong></div>
            </div>
            <div class="meta-badge">Data da Análise: <strong>2026-07-09</strong></div>
          </div>

          <div class="grid-summary">
            <!-- CARD MATRIZ -->
            <div class="card risk-status">
              <div class="section-title" style="border:none; padding:0;">Criticidade do Cenário</div>
              <div class="criticidade-tag">${responseData.matriz_risco.criticidade}</div>
              <div class="score-sub">Score Agregado: <strong>${responseData.matriz_risco.score_final} / 25</strong></div>
              <div style="font-size: 11px; color: #8b949e; margin-top: 15px;">Métrica: Impacto (${assessment.impacto_score}) × Probabilidade (${assessment.probabilidade_score})</div>
            </div>

            <!-- CARD INTELIGÊNCIA TRANSVERSAL -->
            <div class="card" style="display: flex; flex-direction: column; gap: 15px;">
              <div>
                <div class="section-title">Análise Transversal de Impacto</div>
                <div class="text-block">${assessment.analise_transversal}</div>
              </div>
              <div>
                <div class="section-title">Plano de Ação Corretiva Recomendado</div>
                <div class="text-block" style="border-left: 3px solid #ff7b72;">${assessment.acao_preventiva_imediata}</div>
              </div>
            </div>
          </div>

          <!-- TABELA DE ORIGEM DOS DADOS -->
          <div class="table-title">Fontes de Auditoria Avaliadas (${responseData.total_nao_conformidades_analisadas} não-conformidades)</div>
          <table>
            <thead>
              <tr>
                <th style="width: 120px;">ID Auditoria</th>
                <th style="width: 120px;">Setor</th>
                <th style="width: 220px;">Item de Controle</th>
                <th>Evidência Técnica Descrita</th>
                <th style="width: 100px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${responseData.dados_origem.map(audit => `
                <tr>
                  <td style="font-family: monospace; color: #58a6ff;">${audit.id_auditoria}</td>
                  <td><span class="badge-sector">${audit.setor}</span></td>
                  <td style="font-weight: 500;">${audit.item_controle}</td>
                  <td style="color: #8b949e; line-height: 1.4;">${audit.evidencia_descrita}</td>
                  <td><span class="status-alert">● ${audit.status.replace('_', ' ')}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
      `;

      res.setHeader('Content-Type', 'text/html');
      return res.send(htmlDashboard);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno ao processar inteligência preditiva." });
    }
  }
}