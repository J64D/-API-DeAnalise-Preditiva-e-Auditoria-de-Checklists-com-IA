import axios from 'axios';
import { z } from "zod";
import { ChecklistAudit } from '../utils/mockData.js';

export interface RiskAnalysisResult {
  nivel_criticidade: "BAIXO" | "MEDIO" | "ALTO" | "CRITICO";
  impacto_score: number;
  probabilidade_score: number;
  analise_transversal: string;
  acao_preventiva_imediata: string;
  analysis_source: "GROQ" | "DETERMINISTIC_FALLBACK";
}

const riskAnalysisSchema = z.object({
  nivel_criticidade: z.enum(["BAIXO", "MEDIO", "ALTO", "CRITICO"]),
  impacto_score: z.number().min(1).max(5),
  probabilidade_score: z.number().min(1).max(5),
  analise_transversal: z.string().min(1).max(2000),
  acao_preventiva_imediata: z.string().min(1).max(2000),
});

export class AIService {
  private static apiKey = process.env.GROQ_API_KEY;
  private static model = process.env.GROQ_MODEL || 'llama3-8b-8192';

  static async evaluateMetrics(audits: ChecklistAudit[]): Promise<RiskAnalysisResult> {
    if (!this.apiKey) {
      return this.deterministicFallback("GROQ_API_KEY is not configured.");
    }

    const systemPrompt = `Você é um motor de análise de risco especialista em ISO 31000.
    Analise a lista de não-conformidades de auditoria e gere uma avaliação consolidada.
    Você DEVE responder estritamente com um objeto JSON válido, seguindo exatamente este esquema, sem nenhum texto extra antes ou depois:
    {
      "nivel_criticidade": "BAIXO" | "MEDIO" | "ALTO" | "CRITICO",
      "impacto_score": 1,
      "probabilidade_score": 1,
      "analise_transversal": "Texto conciso correlacionando os setores afetados",
      "acao_preventiva_imediata": "Ação imediata recomendada focado em governança"
    }`;

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: this.model,
          response_format: { type: "json_object" },
          temperature: 0.2, // Baixa temperatura garante respostas objetivas e determinísticas
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(audits) }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 7000
        }
      );

      const parsed = riskAnalysisSchema.safeParse(JSON.parse(response.data.choices[0].message.content));
      if (!parsed.success) throw new Error("Risk provider returned an invalid response.");
      return {
        ...parsed.data,
        analysis_source: "GROQ",
      };
    } catch (error) {
      return this.deterministicFallback(error instanceof Error ? error.message : "Unknown risk provider error.");
    }
  }

  private static deterministicFallback(reason: string): RiskAnalysisResult {
    console.warn(`Risk provider unavailable (${reason}); using deterministic fallback.`);
    return {
      nivel_criticidade: "ALTO",
      impacto_score: 4,
      probabilidade_score: 3,
      analise_transversal: "Falhas simultâneas em TI/Logística e Compliance indicam fragilidade no controle de mudanças operacionais.",
      acao_preventiva_imediata: "Bloquear atualizações de firmware em produção e revisar logs de aprovações financeiras manuais.",
      analysis_source: "DETERMINISTIC_FALLBACK",
    };
  }
}