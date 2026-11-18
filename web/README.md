# Sentinel Web

Frontend React do **Sentinel**, projeto de operações de segurança e auditoria preditiva de **J64D**. Este painel é publicado como parte do portfólio; para visão geral, API, regras de alerta e limites de segurança, consulte o [README principal](../Readme.md).

## O que o painel apresenta

- Visão geral de eventos, falhas de autenticação e alertas ativos.
- Consulta de eventos de segurança e alertas.
- Fluxo manual para investigar e resolver alertas.
- Resumo de risco ISO 31000.
- Trilha de auditoria.
- Atualização periódica e apresentação explícita de erros da API.

## Tecnologias

React, TypeScript, Vite e Lucide React.

## Executar localmente

Requisitos: Node.js 20.19+ e a API Sentinel em execução. Na pasta `Sentinel\web`:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

O Vite normalmente disponibiliza o painel em `http://localhost:5173`.

### Endereço da API

`VITE_API_BASE_URL` define o endereço base da API. O valor de exemplo em `.env.example` aponta para `http://localhost:3000/api/v1`. Para outro ambiente, ajuste essa variável antes de iniciar ou compilar o frontend. Não inclua chaves ou segredos no bundle do navegador.

## Scripts

```powershell
npm run dev
npm run build
npm run preview
npm run lint
```

## Autoria e uso

**© 2026 J64D. Todos os direitos reservados sobre o código e os materiais originais deste painel.**

A publicação no GitHub serve à apresentação de portfólio. Nos termos da plataforma, o GitHub pode permitir que usuários visualizem e criem forks de repositórios públicos. Um fork não transfere a autoria nem concede autorização para usar este painel fora dos recursos e termos do GitHub, distribuir cópias independentes, incorporá-lo em outro produto ou explorá-lo comercialmente.

Qualquer utilização além do permitido pela plataforma — incluindo a venda deste painel ou de partes dele — requer autorização prévia e expressa de J64D. Dependências de terceiros continuam sujeitas às próprias licenças.
