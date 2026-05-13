import fp from 'fastify-plugin';
import Database, { Database as DBType } from 'better-sqlite3';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';

const DATA_DIR = join(process.cwd(), 'data');
mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = process.env.DB_PATH ?? join(DATA_DIR, 'data.db');

const dbPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  const db: DBType = new Database(DB_PATH);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      title     TEXT    NOT NULL,
      createdAt TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      conversationId INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role           TEXT    NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
      content        TEXT    NOT NULL,
      createdAt      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );
  `);

  const stmts = {
    createConv:   db.prepare('INSERT INTO conversations (title) VALUES (?) RETURNING *') as import('better-sqlite3').Statement<[string], import('../types/index.js').Conversation>,
    listConvs:    db.prepare(`
      SELECT c.id, c.title, c.createdAt,
             COUNT(m.id) AS messageCount
      FROM conversations c
      LEFT JOIN messages m ON m.conversationId = c.id
      GROUP BY c.id ORDER BY c.createdAt DESC
    `) as import('better-sqlite3').Statement<[], import('../types/index.js').Conversation>,
    getConv:      db.prepare('SELECT * FROM conversations WHERE id = ?') as import('better-sqlite3').Statement<[number | string], import('../types/index.js').Conversation>,
    deleteConv:   db.prepare('DELETE FROM conversations WHERE id = ?') as import('better-sqlite3').Statement<[number | string], import('better-sqlite3').RunResult>,
    getMessages:  db.prepare('SELECT * FROM messages WHERE conversationId = ? ORDER BY id') as import('better-sqlite3').Statement<[number | string], import('../types/index.js').Message>,
    addMessage:   db.prepare('INSERT INTO messages (conversationId, role, content) VALUES (?, ?, ?) RETURNING *') as import('better-sqlite3').Statement<[number | string, string, string], import('../types/index.js').Message>,
  };

  app.decorate('db', db);
  app.decorate('stmts', stmts);

  app.addHook('onClose', () => db.close());
};

export default fp(dbPlugin, { name: 'db' });
