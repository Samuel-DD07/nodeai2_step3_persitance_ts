import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ChatRequestBody } from '../types/index.js';
import { chatBodySchema } from '../schemas/chat.js';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL ?? 'llama3.2';

export const chatRoute: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post<{ Body: ChatRequestBody }>('/chat', {
    schema: {
      body: chatBodySchema,
      response: {
        200: {
          type: 'object',
          properties: { response: { type: 'string' } }
        }
      }
    }
  }, async (request, reply) => {
    const { message } = request.body;

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: message }],
        stream: false
      })
    });

    if (!res.ok) {
      const text = await res.text();
      request.log.error({ status: res.status, body: text }, 'Ollama error');
      return reply.status(502).send({ error: 'Ollama request failed' });
    }

    const data = await res.json() as import('../types/index.js').OllamaChatResponse;
    return { response: data.message.content };
  });

  app.post<{ Body: ChatRequestBody }>('/chat/stream', {
    schema: { body: chatBodySchema }
  }, async (request, reply) => {
    const { message } = request.body;
    const controller = new AbortController();

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: message }],
        stream: true
      })
    });

    if (!res.ok) {
      const text = await res.text();
      request.log.error({ status: res.status, body: text }, 'Ollama error');
      return reply.status(502).send({ error: 'Ollama request failed' });
    }

    request.raw.once('close', () => {
      request.log.info('Client disconnected — aborting Ollama stream');
      controller.abort();
    });

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    const sendEvent = (payload: import('../types/index.js').SSEPayload) => reply.raw.write(`data: ${JSON.stringify(payload)}\n\n`);

    try {
      if (!res.body) throw new Error('No response body from Ollama');
      
      for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
        const lines = Buffer.from(chunk).toString('utf8').split('\n').filter(Boolean);
        for (const line of lines) {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            sendEvent({ type: 'token', value: parsed.message.content });
          }
          if (parsed.done) {
            sendEvent({ type: 'done' });
          }
        }
      }
    } catch (err) {
      const error = err as Error;
      if (error.name !== 'AbortError') {
        request.log.error(error, 'Streaming error');
        sendEvent({ type: 'error', message: error.message });
      }
    } finally {
      reply.raw.end();
    }
  });
};
