# NeuroMinds · app

Site público de cartas de ações com vídeos. Contexto e decisões em `../wiki/`.

## Rodar
```
npm install
npm run dev
```
Abre em http://localhost:3000.

## Adicionar vídeos (enquanto o admin não existe)
1. Coloque o arquivo em `public/videos/<slug>/`, ex.: `public/videos/chutar/chutar-bola-campo.mp4`.
2. Em `src/data/seed.json`, dentro da ação, adicione:
```json
{ "id": "chutar-bola-campo", "src": "/videos/chutar/chutar-bola-campo.mp4", "caption": "Chutar a bola", "sortOrder": 1, "isActive": true }
```
Spec dos vídeos em `../wiki/06-conteudo-videos.md`.

## Deploy
Importar a pasta `app/` na Vercel. Sem variáveis de ambiente nesta fase.
