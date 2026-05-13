import { Database, Statement, RunResult } from 'better-sqlite3';
import { Conversation, Message } from './index.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
    stmts: {
      createConv: Statement<[string], Conversation>;
      listConvs: Statement<[], Conversation>;
      getConv: Statement<[number | string], Conversation>;
      deleteConv: Statement<[number | string], RunResult>;
      getMessages: Statement<[number | string], Message>;
      addMessage: Statement<[number | string, string, string], Message>;
    };
  }
}
