# Sentinel

> **Do evento ao contexto: uma visão unificada de segurança e risco.**

O Sentinel é um projeto demonstrativo de operações de segurança e auditoria preditiva, desenvolvido por **J64D** para portfólio. Ele combina ingestão de eventos, regras determinísticas de alerta, investigação manual e uma visão de risco relacionada à metodologia ISO 31000.

O projeto também incorpora o motor de auditoria preditiva do repositório [J64D — API de Análise Preditiva e Auditoria de Checklists com IA](https://github.com/J64D/-API-DeAnalise-Preditiva-e-Auditoria-de-Checklists-com-IA). Os endpoints executivos e de análise de não conformidades foram mantidos; a camada de eventos de segurança e o painel React foram adicionados neste projeto.

## Visão geral

- **Console React:** visão geral, eventos, alertas, risco ISO 31000 e trilha de auditoria.
- **API REST:** Node.js, Express e TypeScript, com endpoints de segurança e de risco.
- **Persistência:** PostgreSQL para eventos, alertas e alterações de estado.
- **Detecção determinística:** 5 falhas de login ou 3 falhas de MFA em 5 minutos para a mesma identidade e IP; alteração de privilégio gera alerta crítico.
- **Investigação manual:** alertas podem ser marcados como em investigação e resolvidos com uma nota.
- **Análise opcional com Groq/Llama:** se a integração não estiver configurada ou não responder, o motor de risco usa avaliação determinística de contingência.

O painel consulta a API periodicamente e apresenta falhas de serviço na própria interface. A investigação é manual: o sistema não executa ações automáticas em serviços externos.

## Tecnologias

| Componente | Tecnologias |
|---|---|
| Painel | React, TypeScript, Vite |
| API | Node.js, Express, TypeScript |
| Dados | PostgreSQL |
| Validação | Zod |
| Análise opcional | Groq/Llama |
| Ambiente local | Docker Compose |

## Executar localmente

Requisitos: Node.js 20.19+ e Docker Desktop.

### 1. Iniciar banco de dados e API

Na raiz de `Sentinel`:

```powershell
Copy-Item .env.example .env
docker compose up -d
npm install
npm run migrate
npm run dev
```

A API fica em `http://localhost:3000`.

### 2. Iniciar o painel

Em outro terminal:

```powershell
Set-Location web
Copy-Item .env.example .env
npm install
npm run dev
```

O painel fica em `http://localhost:5173` e usa `VITE_API_BASE_URL` para localizar a API. Consulte [web/README.md](./web/README.md) para detalhes do frontend.

### 3. Criar um alerta demonstrativo

No painel, use **Registrar evento** ou envie cinco eventos de falha de login para a mesma identidade e IP:

```powershell
1..5 | ForEach-Object {
  Invoke-RestMethod -Method Post `
    -Uri http://localhost:3000/api/v1/security/events `
    -ContentType 'application/json' `
    -Body (@{
      eventType = 'login.failure'
      actorEmail = 'analista@example.com'
      sourceIp = '203.0.113.10'
      sourceSystem = 'Demo Identity Provider'
      outcome = 'failure'
    } | ConvertTo-Json)
}
```

`203.0.113.10` é reservado para documentação e exemplos. Em integrações reais, envie o IP observado pelo provedor de identidade e nunca inclua senhas, tokens ou segredos.

## API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/v1/security/overview` | Indicadores e atividade recente |
| `GET` | `/api/v1/security/events?limit=50` | Eventos recentes (limite de 1 a 100) |
| `POST` | `/api/v1/security/events` | Registrar e avaliar um evento |
| `GET` | `/api/v1/security/alerts?status=OPEN` | Consultar e filtrar alertas |
| `PATCH` | `/api/v1/security/alerts/:id` | Marcar em investigação ou resolver |
| `GET` | `/api/v1/security/audit-log?limit=100` | Consultar eventos e histórico de estado |
| `GET` | `/api/v1/board/executive-summary` | Resumo ISO 31000 do motor existente |
| `POST` | `/api/v1/risk/analyze` | Análise existente por `id_auditoria` |

Tipos de evento aceitos: `login.success`, `login.failure`, `mfa.failure`, `privilege.change`, `policy.change` e `sensitive.access`. Campos desconhecidos são rejeitados; credenciais não devem ser incluídas nos eventos.

## Configuração

As variáveis da API estão em `.env.example`: `DATABASE_URL`, `PORT` e `CLIENT_ORIGIN`. `GROQ_API_KEY` é opcional; `GROQ_MODEL` define o modelo configurado. No painel, `VITE_API_BASE_URL` está documentada em `web/.env.example`.

Não coloque chaves ou segredos no frontend, em commits ou em capturas de tela.

## Limitações e segurança

Este é um **protótipo de portfólio**, não um SIEM pronto para produção. A API não implementa autenticação/RBAC, TLS, gestão de retenção, ingestão syslog/CEF ou isolamento multi-tenant. Restrinja a execução a ambiente local ou rede controlada. Antes de qualquer uso real, projete e implemente controles de identidade e autorização, limites de taxa, gestão de segredos e política de retenção adequados.

## Verificação

Na raiz do projeto:

```powershell
npm run build
Set-Location web
npm run build
```

## Autoria e uso

**© 2026 J64D. Todos os direitos reservados sobre o código e os materiais originais deste projeto.**

Este repositório está público no GitHub para apresentação de portfólio. Nos termos da plataforma, o GitHub pode permitir que usuários visualizem e criem forks de repositórios públicos. Um fork não transfere a autoria nem concede autorização para usar o código fora dos recursos e termos do GitHub, distribuir cópias independentes, incorporar o projeto em outro produto ou explorá-lo comercialmente.

Qualquer utilização além do permitido pela plataforma — incluindo venda do projeto, de partes dele ou de versões modificadas — requer autorização prévia e expressa de J64D. Componentes de terceiros continuam sujeitos às respectivas licenças.

Para solicitar autorização, entre em contato com **J64D** pelo perfil ou pelos canais associados a este portfólio.
