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

