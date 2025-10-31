# Popcorn Boxd 🍿

Clone inspirado no Letterboxd construído com Expo + React Native. O MVP oferece autenticação local com foto de perfil, busca de
filmes na API do TMDb, tela de detalhes com avaliação personalizada e biblioteca de assistidos persistida por usuário.

## 📋 Principais funcionalidades
- Cadastro e login com validação, hash simples de senha e armazenamento local seguro via AsyncStorage.
- Upload de foto de perfil a partir da câmera ou galeria usando `expo-image-picker`.
- Tela principal de busca com integração TMDb, estado de carregamento acessível e resultados em `FlatList`.
- Tela de detalhes com poster, sinopse, nota média, avaliação por estrelas e salvamento na lista pessoal.
- Aba “Assistidos” listando avaliações do usuário atual com opção de remover ou atualizar a nota.
- Experiência acessível: rótulos claros, anúncios para leitores de tela, foco controlado e alvos ≥ 44×44 pt.

## 🚀 Como executar

### Pré-requisitos
- Node.js LTS
- npm ou yarn
- Expo Go (para testes em dispositivos reais)
- Simulador iOS (Xcode) e/ou emulador Android (Android Studio)

### Configuração do TMDb
1. Crie um arquivo `.env` na raiz do projeto.
2. Adicione sua chave da API do TMDb:
   ```env
   EXPO_PUBLIC_TMDB_API_KEY=coloque_sua_chave_aqui
   ```
3. Reinicie o servidor Expo após qualquer alteração no `.env`.

### Passos
```bash
npm install
npm start           # inicia o servidor Expo
npm run android     # opcional: abre no Android
npm run ios         # opcional: abre no iOS
```

## 🧭 Estrutura do projeto
```
popcorn-boxd/
├── app/
│   ├── (auth)/login.tsx         # Tela de login
│   ├── (auth)/signup.tsx        # Tela de cadastro
│   ├── (tabs)/_layout.tsx       # Abas autenticadas (Buscar, Assistidos, Perfil)
│   ├── (tabs)/index.tsx         # Busca de filmes (home)
│   ├── (tabs)/watched.tsx       # Lista de filmes avaliados
│   ├── (tabs)/profile.tsx       # Perfil do usuário logado
│   └── movie/[id].tsx           # Detalhes e avaliação do filme
├── context/                     # Providers globais
│   ├── AuthContext.tsx
│   └── WatchedMoviesContext.tsx
├── storage/                     # Integrações com AsyncStorage
│   └── auth.ts
├── utils/password.ts            # Funções de hash/validação de senha
├── docs/                        # Documentação (arquitetura, testes)
└── constants/theme.ts           # Paleta de cores light/dark
```

## 🧪 Qualidade
- `npm run lint:check`
- `npm run typecheck`
- `npm test`

Checklist manual recomendado: fluxo de cadastro/login, busca, detalhe + salvamento, lista de assistidos, logout/login de outro
usuário e validação TalkBack/VoiceOver. Veja `docs/testing.md` para o roteiro completo.

## 🔮 Próximos passos sugeridos
- Migrar autenticação para Firebase Authentication ou Supabase Auth.
- Sincronizar a lista de assistidos com Firestore/Supabase para multi-dispositivo.
- Evoluir para feed social com seguidores, curtidas e comentários.
