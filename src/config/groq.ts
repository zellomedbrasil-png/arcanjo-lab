import Groq from 'groq-sdk';
import { getRequiredEnv } from './env';

export function ensureGroqApiKey(): string {
  return getRequiredEnv('VITE_GROQ_API_KEY');
}

export const groq = new Groq({
  apiKey: getRequiredEnv('VITE_GROQ_API_KEY'),
  dangerouslyAllowBrowser: true,
});
