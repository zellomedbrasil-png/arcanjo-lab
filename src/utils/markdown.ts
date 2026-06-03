/**
 * Converte trechos de texto com markdown básico (**negrito** e listas com marcadores) em HTML seguro.
 */
export function renderMarkdown(text: string): string {
  if (!text) return '';

  // Escapa tags HTML nativas para segurança XSS antes de aplicar formatação
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Suporte a negrito com **texto** ou __texto__
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Processa listas com marcadores (* ou -) linha por linha
  const lines = html.split('\n');
  let inList = false;
  const processedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const content = trimmed.substring(2).trim();
      if (!inList) {
        processedLines.push('<ul class="list-disc pl-4 my-1 font-normal">');
        inList = true;
      }
      processedLines.push(`<li class="my-0.5 leading-normal text-left">${content}</li>`);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      processedLines.push(line);
    }
  }

  if (inList) {
    processedLines.push('</ul>');
  }

  // Junta as linhas utilizando quebras <br />, limpando quebras redundantes após </ul>
  return processedLines.join('\n')
    .replace(/\n/g, '<br />')
    .replace(/<\/ul><br \/>/g, '</ul>')
    .replace(/<ul(.*?)><br \/>/g, '<ul$1>');
}
