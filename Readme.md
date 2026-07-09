# 📊 API de Auditoria Preditiva e Gestão de Riscos Transversais (ISO 31000)
### 🚀 Desenvolvido por Jarod "J64D" da Silva Pereira — Portfólio de Engenharia

Este projeto faz parte do meu ecossistema de portfólio técnico focado em arquiteturas corporativas de alto desempenho, unindo **Node.js**, **TypeScript** e **Inteligência Artificial Preditiva** para resolver desafios críticos de governança corporativa sob a ótica da **ISO 31000**.

Sistemas de auditoria tradicionais tratam falhas operacionais em silos isolados, impedindo que a liderança enxergue o efeito cascata de pequenas ocorrências. Esta API demonstra como centralizar checklists e não-conformidades fragmentadas (Logística, Segurança, Compliance) e tratá-las de forma unificada através de um motor de IA agnóstico, transformando dados brutos em decisões estratégicas.

---

## 🎯 Diferencial Técnico e de Negócio (Visão Content-Negotiation)

A arquitetura desta API foi desenhada para atender a dois mundos de forma nativa através de técnicas de **Content-Negotiation**:
1. **Integração de Sistemas (M2M):** Quando consumido por outras aplicações ou clients HTTP (como Postman/Insomnia), o endpoint retorna um **JSON puríssimo, tipado e de alta velocidade**.
2. **Dashboard do Board (Humano):** Quando acessado diretamente pelo navegador, a própria API detecta o cabeçalho `Accept` e renderiza um **Dashboard Executivo Premium em Dark Mode**, otimizando a legibilidade e a apresentação dos dados para tomadores de decisão sem onerar o consumo do servidor com templates pesados.

---

## 🛠️ Stack Tecnológica e Engenharia
- **Runtime:** Node.js & TypeScript (Configuração estrita e tipagem robusta via `NodeNext`)
- **Framework:** Express (REST API)
- **Engine de IA:** Groq API Gateway / Llama 3 (Acessado via chamadas HTTP nativas com controle de timeout e fallback determinístico integrado)
- **Padrão de Projeto:** Controller-Service-Route Pattern (Arquitetura corporativa desacoplada e escalável)

---

## 📊 Endpoints Estratégicos

### 📑 1. Painel Consolidado de Riscos Integrados
- **Rota:** `GET /api/v1/board/executive-summary`
- **Comportamento via Código:** Retorna a matriz de riscos e os dados de auditoria formatados em JSON estruturado.
- **Comportamento via Navegador:** Renderiza a interface do Dashboard Executivo em tempo real, calculando dinamicamente a criticidade e o score final baseado na fórmula:
  
  $$Score = Impacto \times Probabilidade$$

### 🔍 2. Análise de Criticidade Individual
- **Rota:** `POST /api/v1/risk/analyze`
- **Payload Mandatório:**
  ```json
  {
    "id_auditoria": "AUD-2026-001"
  }
  
Descrição: Isola uma única não-conformidade técnica e aciona o motor de inteligência para classificar os impactos colaterais que ela pode gerar em outros setores da companhia.

🚀 Como Executar este Projeto Localmente
1. Clonagem e Instalação
Abra o terminal na pasta do projeto e execute:

Bash
npm install
2. Variáveis de Ambiente (.env)
Configure um arquivo .env na raiz do repositório contendo:

Snippet de código
PORT=3000
GROQ_API_KEY=sua_api_key_aqui
GROQ_MODEL=llama3-8b-8192
Nota: Se a chave do gateway de IA não for configurada ou o serviço estiver offline, a camada de serviço ativa o Modo de Contingência Automatizado para manter a resiliência da aplicação.

3. Inicialização em Modo Dev
Rode o servidor local com hot-reload ativo:

Bash
npm run dev
Após iniciar, abra o navegador e acesse a interface visual direto em: http://localhost:3000/api/v1/board/executive-summary

👨‍💻 Sobre o Desenvolvedor
Sou Jarod da Silva Pereira, desenvolvedor focado em entregar soluções eficientes de software. Através do selo J64D DEV, compartilho conhecimento técnico, focado em arquitetura de software, automações inovadoras e engenharia de back-end moderna.

Conecte-se comigo: Meu GitHub / Meu YouTube


---

### 💾 Comitando e Subindo no Portfólio

Para que isso reflita imediatamente no seu perfil, execute estes comandos no terminal do seu VS Code:

```powershell
git add README.md
git commit -m "docs: upgrade readme into premium j64d portfolio portfolio showcase"
git push