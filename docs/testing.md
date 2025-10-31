# Testing Guide

This document covers the automated checks and manual QA activities required to keep Popcorn Boxd stable, accessible, and ready
for release.

## Automated checks

Run the following commands locally and in CI:

- `npm run lint:check` – ESLint with zero-warning budget.
- `npm run typecheck` – TypeScript project-wide type validation.
- `npm test` – Jest unit tests (utilities such as password hashing).

## Manual accessibility & UX checklist

Complete each scenario on Android (TalkBack) and iOS (VoiceOver) simulators.

- [x] **Autenticação acessível** – Inputs e botões das telas de login/cadastro possuem labels claros e alvos ≥ 44×44.
- [x] **Anúncios em tempo real** – Mensagens de erro/sucesso durante login, cadastro e salvamento de filmes anunciam seu estado
  via `accessibilityLiveRegion` ou `AccessibilityInfo`.
- [x] **Busca de filmes** – Campo de busca indica propósito, FlatList expõe `accessibilityLabel` e itens fornecem contexto sobre
  ano e nota.
- [x] **Detalhes do filme** – Estrelas de avaliação são navegáveis, anunciam seleção e respeitam o tamanho mínimo de toque.
- [x] **Lista de assistidos** – Cartões indicam a nota dada pelo usuário, data da última atualização e exibem alternativa para
  poster indisponível.
- [x] **Navegação entre abas** – Foco inicial após troca de aba cai em elemento significativo (título ou primeiro item). As tabs
  possuem ícones e rótulos amigáveis para leitor de tela.

## Screen reader regression run

1. Inicie o app (`npm start`) e abra no simulador.
2. Ative o leitor de tela.
3. Fluxo completo:
   - Cadastre um novo usuário com foto de perfil.
   - Faça logout e login novamente para validar a persistência.
   - Busque um filme, abra os detalhes, avalie e salve em “Assistidos”.
   - Retorne à lista “Assistidos”, abra o item salvo, atualize a avaliação e remova-o.
4. Garanta que anúncios de carregamento/erro sejam ouvidos e que nenhum elemento essencial fique inacessível.
5. Desative o leitor de tela e registre feedbacks.

## Smoke test funcional

Execute após mudanças significativas:

1. `npm run lint:check`
2. `npm run typecheck`
3. `npm start` e abra no dispositivo ou simulador.
4. Login com usuário existente ou cadastre um novo.
5. Pesquise um filme, abra detalhes, avalie com estrelas e salve.
6. Verifique se o filme aparece em “Assistidos” com a nota correta.
7. Troque de usuário para garantir que os dados sejam isolados por conta.
