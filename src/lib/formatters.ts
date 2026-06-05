export function onlyDigits(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, '');
  return typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits;
}

export function formatCpf(value: string): string {
  return onlyDigits(value, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatCep(value: string): string {
  return onlyDigits(value, 8).replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

export function formatPhone(value: string): string {
  const digits = onlyDigits(value, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }

  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

export function formatDraftTime(value: string | null): string {
  if (!value) return 'Rascunho ainda não salvo';
  return `Rascunho salvo às ${new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))}`;
}

export function formatExamNameForDisplay(nome: string): string {
  if (!nome) return '';
  const prepositions = ['de', 'do', 'da', 'dos', 'das', 'e', 'com', 'sem', 'para', 'o', 'a'];
  return nome
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Always capitalize first word
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      // Keep roman numerals in uppercase
      if (/^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i.test(word)) {
        return word.toUpperCase();
      }
      // Keep short medical acronyms in uppercase (except prepositions)
      if (word.length <= 4 && !prepositions.includes(word)) {
        return word.toUpperCase();
      }
      if (prepositions.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function cleanSoapMarkdown(text: string): string {
  if (!text) return '';
  return text
    // Replace headings formatting: remove hash characters from the beginning of line
    .replace(/^[ \t]*#+[ \t]*/gm, '')
    // Remove all bold/italic markdown characters (* and _)
    .replace(/[\*_]/g, '')
    // Remove emojis and special medical symbols that aren't text
    .replace(/[\u2600-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '')
    // Remove any trailing/leading whitespaces on each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

/**
 * Extrai o bloco JSON de uma string de resposta da IA.
 * Trata casos onde o modelo envia tags como <think> (DeepSeek)
 * ou texto introdutório antes do JSON.
 */
export function extractJson(text: string): string {
  if (!text) return '';

  // 1. Remove qualquer conteúdo dentro de tags <think> e </think>
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  // 2. Busca o primeiro '{' ou '[' e o último '}' ou ']'
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');

  let startIndex = -1;
  let endIndex = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIndex = firstBrace;
    endIndex = lastBrace;
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
    endIndex = lastBracket;
  }

  // 3. Extrai apenas o bloco JSON se as chaves forem encontradas validamente
  if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
    return cleaned.substring(startIndex, endIndex + 1);
  }

  // Fallback: tenta remover os code blocks markdown comuns
  return cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

