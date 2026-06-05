import Groq from 'groq-sdk';

export function getGroqApiKey(): string {
  return (
    localStorage.getItem('arcanjo_groq_key') ||
    import.meta.env.VITE_GROQ_API_KEY ||
    ''
  );
}

// Proxy dinâmico para interceptar propriedades e instanciar o Groq sob demanda com a chave atualizada
export const groq = new Proxy({} as Groq, {
  get(_target, prop, receiver) {
    const apiKey = getGroqApiKey();
    const instance = new Groq({
      apiKey: apiKey || 'dummy-key-to-prevent-empty-error',
      dangerouslyAllowBrowser: true,
    });
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export function ensureGroqApiKey(): string {
  const key = getGroqApiKey();
  if (!key) {
    throw new Error('Chave de API do Groq não configurada.');
  }
  return key;
}
