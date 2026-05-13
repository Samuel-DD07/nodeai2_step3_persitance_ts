export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  messageCount?: number;
}

export interface Message {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface ChatRequestBody {
  message: string;
}

export interface IdParams {
  id: number;
}

export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaChatResponse {
  model: string;
  message: OllamaMessage;
  done: boolean;
}

export type SSEPayload = 
  | { type: 'token'; value: string }
  | { type: 'done' }
  | { type: 'error'; message: string };
