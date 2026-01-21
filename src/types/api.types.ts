import { AI_MODELS } from '../utils/constants';

// AI Model type
export type AIModel = typeof AI_MODELS[number];

// OpenAI Message
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// OpenAI Request
export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  response_format?: { type: 'json_object' };
}

// OpenAI Response
export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

// AI Generation Parameters
export interface GenerateParams {
  prompt: string;
  apiKey: string;
  model: AIModel;
}
