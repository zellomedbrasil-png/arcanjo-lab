export function getRequiredEnv(name: string): string {
  const value = import.meta.env[name];

  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  throw new Error(`Variavel de ambiente obrigatoria nao configurada: ${name}`);
}
