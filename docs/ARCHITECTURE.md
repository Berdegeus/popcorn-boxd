# Architecture Documentation

## Overview
Popcorn Boxd is a mobile application built with Expo and React Native that delivers a Letterboxd-inspired experience with fully
offline local persistence. Authentication, user profile data, and watched movie lists live entirely on the device via AsyncStorage,
while remote data is fetched from the TMDb API. Expo Router provides file-based navigation and powers the authenticated vs.
unauthenticated flows through stacked navigators. Accessibility is first-class: every interactive control exposes explicit
labels, touch targets respect the 44×44pt guideline, and dynamic state changes announce updates via the platform screen reader.

## Technology Stack & Rationale

### Runtime & Frameworks
- **Expo SDK 54 + React Native 0.81.5** – Managed workflow with instant reloads, OTA updates, and safe native module usage.
- **React 19.1.0** – Declarative UI with concurrent rendering for responsive screens.
- **TypeScript 5.9** – Strong typing across contexts, storage helpers, and screens to reduce runtime bugs.

### Navigation & State
- **Expo Router 6 / React Navigation** – File-based routing keeps navigation colocated with screens; nested stacks manage
authenticated and unauthenticated flows seamlessly.
- **Context API** – `AuthContext` exposes session state and authentication helpers; `WatchedMoviesContext` manages the
per-user watched catalog with persistence hooks.

### Persistence
- **AsyncStorage** – Stores registered users, the currently authenticated user, and watched movie lists under namespaced keys.
- **In-memory caching** – Context state mirrors the AsyncStorage values to offer instant UI feedback while persisting updates
asynchronously in the background.

### UI & Accessibility
- **Themed primitives** – `ThemedText` and `ThemedView` centralize light/dark palettes defined in `constants/theme.ts`.
- **Expo Image** – Optimized image rendering with caching and accessibility hooks for posters and avatars.
- **Accessibility instrumentation** – Screen reader announcements via `AccessibilityInfo.announceForAccessibility`, `accessibilityLabel`
and `accessibilityRole` everywhere, and explicit minimum touch targets in styles.

## Functional Requirements Mapping

| ID    | Requirement | Implementation |
|-------|-------------|----------------|
| **RF01** | Fluxo de autenticação local com cadastro, login e foto de perfil. | `app/(auth)/signup.tsx`, `app/(auth)/login.tsx`, `context/AuthContext.tsx`, `storage/auth.ts`, `utils/password.ts` |
| **RF02** | Tela de perfil exibindo nome e foto do usuário logado. | `app/(tabs)/profile.tsx` |
| **RF03** | Tela principal de busca de filmes consultando a API do TMDb. | `app/(tabs)/index.tsx` |
| **RF04** | Tela de detalhes com avaliação própria e salvamento. | `app/movie/[id].tsx`, integração com `WatchedMoviesContext` |
| **RF05** | Tela “Meus Filmes Assistidos” por usuário. | `app/(tabs)/watched.tsx`, `context/WatchedMoviesContext.tsx` |
| **RF06** | Persistência local dos dados por usuário autenticado. | `context/WatchedMoviesContext.tsx`, `storage/auth.ts` (chaves namespaced) |
| **RF07** | Requisitos de acessibilidade (rótulos, anúncios, foco, alvos mínimos). | Todos os componentes interativos; destaque para `app/(tabs)/index.tsx`, `app/movie/[id].tsx`, `app/(auth)/*`, `app/(tabs)/watched.tsx` |

## Project Structure

```
popcorn-boxd/
├── app/
│   ├── (auth)/             # Fluxo de autenticação (login/cadastro)
│   ├── (tabs)/             # Abas autenticadas (buscar, assistidos, perfil)
│   │   ├── _layout.tsx     # Configuração do TabNavigator
│   │   ├── index.tsx       # Tela de busca de filmes (home)
│   │   ├── watched.tsx     # Lista de filmes avaliados
│   │   └── profile.tsx     # Perfil do usuário
│   ├── movie/[id].tsx      # Detalhes do filme + avaliação
│   ├── _layout.tsx         # Root layout com providers e stacks
│   └── modal.tsx           # Modal de exemplo (placeholder)
├── components/             # Componentes reutilizáveis
│   ├── themed-text.tsx     # Tipografia com tema
│   ├── themed-view.tsx     # Container com tema
│   └── ui/*                # Ícones, colapsáveis e helpers de UI
├── context/
│   ├── AuthContext.tsx     # Sessão do usuário, cadastro/login/logout
│   └── WatchedMoviesContext.tsx # Filmes avaliados por usuário
├── storage/
│   └── auth.ts             # Helpers de AsyncStorage para contas e sessão
├── utils/
│   └── password.ts         # Hashing simplificado de senha
├── docs/                   # Documentação (arquitetura, testes)
└── constants/
    └── theme.ts            # Tokens de cores claro/escuro
```

## Key Architectural Decisions

### 1. Autenticação Local com AsyncStorage
- **Motivação**: Atender ao requisito de fluxo offline e preparar o terreno para futura migração ao Firebase/Supabase.
- **Implementação**: `AuthContext` coordena cadastro e login validando entradas, aplicando hash simples e persistindo em
AsyncStorage. A sessão atual é carregada na inicialização e exposta às telas através de um provider único.

### 2. Persistência Per-Usuário de Filmes Assistidos
- **Motivação**: RF05/RF06 exigem isolamento dos dados por usuário.
- **Implementação**: `WatchedMoviesContext` deriva a chave de armazenamento do `user.id` (`@storage/watched/<userId>`). As
operações de salvar/remover atualizam o estado imediatamente e persistem em background para oferecer UI responsiva.

### 3. Navegação com Expo Router
- **Motivação**: Simplificar deep links e separação entre fluxo autenticado vs. não autenticado.
- **Implementação**: `_layout.tsx` monta `AuthProvider` + `WatchedMoviesProvider` e decide entre `AuthStack` (login/cadastro)
ou `AppStack` (abas). Rotas dinâmicas (`movie/[id].tsx`) recebem parâmetros diretamente via URL.

### 4. Acessibilidade Como Requisito Base
- **Motivação**: RF07 exige experiência completa via leitores de tela.
- **Implementação**: Todos os botões e inputs possuem `accessibilityLabel`/`Role`; listas informam o estado com
`AccessibilityInfo.announceForAccessibility`; layouts mantêm espaçamento para atingir 44×44pt.

## Data Flow Summary
1. Usuário cadastra/login → `AuthContext` salva `StoredUser` em AsyncStorage e atualiza estado.
2. Tela de busca chama TMDb via `fetch` com debounce de 500 ms → resultado em `FlatList` acessível.
3. Tela de detalhes reutiliza parâmetros da busca ou da lista assistida → usuário avalia → `WatchedMoviesContext.saveWatchedMovie`
persiste em `@storage/watched/<userId>`.
4. Tela “Assistidos” lê contexto e AsyncStorage → lista ordenada por `savedAt`, com remoção e navegação de volta aos detalhes.

## Future Extensions
- Migrar autenticação para Firebase/Supabase mantendo a interface do `AuthContext`.
- Sincronizar filmes assistidos com backend remoto (Firestore/Supabase) substituindo AsyncStorage por drivers remotos.
- Implementar feed social com avaliações públicas e seguidores, consumindo os mesmos contextos como camada local de cache.
