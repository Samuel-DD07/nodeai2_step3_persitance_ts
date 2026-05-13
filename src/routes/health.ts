import { FastifyInstance, FastifyPluginAsync } from 'fastify';

export const healthRoute: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/health', { 
    schema: { 
      response: { 200: { type: 'object', properties: { status: { type: 'string' } } } } 
    } 
  }, async () => {
    return { status: 'ok' };
  });
};
