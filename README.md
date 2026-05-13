# NodeAI - Step 3

Serveur Fastify avec persistance SQLite et TypeScript. Integration avec Ollama (SSE).

## Architecture

- src/types/ : Interfaces TypeScript
- src/schemas/ : Schemas JSON Fastify
- src/plugins/db.ts : Plugin SQLite
- src/routes/ : Controleurs
- src/app.ts & src/server.ts : Serveur

## Installation

```bash
npm install
npm run dev
npm run build
```

## Endpoints & Tests (cURL)

**GET /health**
```bash
curl -s http://localhost:3000/health
```

**GET /conversations**
```bash
curl -s http://localhost:3000/conversations
```

**POST /conversations**
```bash
curl -s -X POST http://localhost:3000/conversations
```

**GET /conversations/:id**
```bash
curl -s http://localhost:3000/conversations/1
```

**POST /conversations/:id/messages**
```bash
curl -N -X POST http://localhost:3000/conversations/1/messages \
  -H "Content-Type: application/json" \
  -d '{"message":"Salut, qui es-tu ?"}'
```

**POST /chat/stream**
```bash
curl -N -X POST http://localhost:3000/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message":"Raconte une blague courte"}'
```
# nodeai2_step3_persitance_ts
