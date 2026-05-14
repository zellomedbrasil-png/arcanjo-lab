import Anthropic from '@anthropic-ai/sdk';

// Configuração do Anthropic para rodar no frontend. 
// AVISO: Isso expõe a chave no lado do cliente. Use apenas para protótipos/MVP interno.
// dangerouslyAllowBrowser: true é necessário para o SDK rodar no frontend.
const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

export const anthropic = new Anthropic({
  apiKey: apiKey || 'dummy-key-to-prevent-crash', 
  dangerouslyAllowBrowser: true, 
});

export const SYSTEM_PROMPT = `Você é um assistente médico especialista em Geriatria e Gastroenterologia.
Sua tarefa é receber os dados do paciente, seus exames solicitados e sua queixa clínica, e gerar uma nota estruturada no formato SOAP (Subjetivo, Objetivo, Avaliação, Plano) em português.
A nota deve ser concisa, profissional e focar na indicação clínica que justifica os exames solicitados.
A seção "Plano" ou "Avaliação" deve conter uma frase curta e direta que servirá como "Indicação Clínica / Justificativa" para a guia de exames.`;
