export interface ChecklistAudit {
  id_auditoria: string;
  setor: "LOGISTICA" | "SEGURANCA" | "COMPLIANCE";
  item_controle: string;
  status: "CONFORME" | "NAO_CONFORME";
  evidencia_descrita: string;
  data_auditoria: string;
}

export const mockAudits: ChecklistAudit[] = [
  {
    id_auditoria: "AUD-2026-001",
    setor: "LOGISTICA",
    item_controle: "Cadeia de Frios e Climatização",
    status: "NAO_CONFORME",
    evidencia_descrita: "Sensor de temperatura da câmara principal oscilou por 50 minutos devido a uma falha de atualização de firmware não homologada no gateway.",
    data_auditoria: "2026-07-09"
  },
  {
    id_auditoria: "AUD-2026-002",
    setor: "SEGURANCA",
    item_controle: "Monitoramento de Perímetro (CFTV)",
    status: "NAO_CONFORME",
    evidencia_descrita: "Identificado ponto cego na cobertura de câmeras do perímetro oeste após empilhamento temporário de pallets de descarte.",
    data_auditoria: "2026-07-09"
  },
  {
    id_auditoria: "AUD-2026-003",
    setor: "COMPLIANCE",
    item_controle: "Alçadas e Dupla Checagem Financeira",
    status: "NAO_CONFORME",
    evidencia_descrita: "Liberação de pagamento emergencial de frete realizada sem a assinatura digital de validação exigida na política antifraude.",
    data_auditoria: "2026-07-09"
  }
];