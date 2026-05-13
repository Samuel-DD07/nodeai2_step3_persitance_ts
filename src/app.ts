import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import sensible from '@fastify/sensible';
import { healthRoute } from './routes/health.js';
import { chatRoute } from './routes/chat.js';
import { conversationsRoute } from './routes/conversations.js';
import dbPlugin from './plugins/db.js';

export async function buildApp(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
        : undefined
    },
    ...opts
  });

  await app.register(sensible);
  await app.register(dbPlugin);

  await app.register(healthRoute);
  await app.register(chatRoute);
  await app.register(conversationsRoute);

  return app;
}
