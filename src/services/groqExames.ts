import { callGemini } from '../config/gemini';
import { CATEGORIAS_EXAMES } from '../data/exames';

export interface ExameOrganizado {
  nomeOriginal: string;
  nomePadronizado: string;
  codigoTUSS?: string;
  justificativaIndividual: string;
}

export interface ResultadoExamesIA {
  exames: ExameOrganizado[];
  justificativaGlobal: string;
  cid10Sugerido: string;
}

const SYSTEM_PROMPT = `Você é um médico geriatra e gastroenterologista sênior, especialista em gestão de exames complementares no SUS e convênios do Brasil.

TAREFA: Receba uma lista bruta de exames (digitada livremente pelo médico) e organize-a.

RETORNE EXCLUSIVAMENTE um JSON válido (sem markdown, sem explicações, sem blocos de código) com o seguinte formato:
{
  "exames": [
    {
      "nomeOriginal": "nome como foi digitado pelo médico",
      "nomePadronizado": "nome oficial curto e direto (ex: 'HEMOGRAMA COMPLETO', 'GLICOSE', 'INSULINA', 'HEMOGLOBINA GLICADA - HBA1C')",
      "codigoTUSS": "código TUSS se souber (ex: '40304361'), senão string vazia",
      "justificativaIndividual": "breve justificativa clínica do exame no contexto"
    }
  ],
  "justificativaGlobal": "INDICAÇÃO CLÍNICA consolidada em 1-3 frases em MAIÚSCULAS para impressão na guia do convênio. Formato: INVESTIGAÇÃO DE [queixa]. SOLICITO [exames principais] PARA [objetivo diagnóstico]. CID-10: [código].",
  "cid10Sugerido": "código CID-10 mais provável (ex: 'Z00.0 - Exame médico geral')"
}

REGRAS:
- Você deve mapear os exames digitados pelo médico para os nomes correspondentes na lista de EXAMES PERMITIDOS fornecida no prompt do usuário.
- Dê preferência aos nomes exatos da lista de EXAMES PERMITIDOS e EVITE nomes longos ou redundantes como "DOSAGEM DE GLICOSE" (use "GLICOSE"), "DOSAGEM DE INSULINA" (use "INSULINA"), "DOSAGEM DE UREIA" (use "UREIA"), "DOSAGEM DE HEMOGLOBINA GLICADA" (use "HEMOGLOBINA GLICADA - HBA1C").
- Se o médico escreveu abreviações (HMG, GJ, TGO, TGP, etc.), expanda para o nome oficial curto que consta na lista de EXAMES PERMITIDOS.
- Se não reconhecer um exame na lista de EXAMES PERMITIDOS, padronize seu nome de forma curta e direta, sem termos redundantes como "DOSAGEM DE" ou "DETERMINACAO DE", e marque com "(verificar)" (ex: "EXAME RARO (verificar)").
- A justificativa global deve ser profissional, adequada para auditoria de convênio
- Se a queixa for fornecida, use-a para gerar justificativas contextualmente relevantes. Não invente doenças secundárias ou históricos fictícios.
- Se não houver queixa, gere justificativas genéricas baseadas nos exames solicitados, sem alucinar diagnósticos do paciente.
- Retorne exames na mesma ordem em que foram fornecidos.
- REGRA ABSOLUTA DE SEGURANÇA: NÃO adicione novos exames que não foram explicitados na lista bruta fornecida. A quantidade de exames retornada deve ser exatamente igual à quantidade de exames identificáveis na entrada.
- Inclua o CID-10 mais adequado na justificativa global`;

// Auxiliares de normalização e busca
function normalize(text: string): string {
  return text
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^A-Z0-9\s]/g, ' ')   // substitui símbolos por espaço
    .replace(/\s+/g, ' ')           // colapsa múltiplos espaços
    .trim();
}

const VERBOSE_PREFIXES = [
  /^DOSAGEM DE /,
  /^DOSAGEM DO /,
  /^DOSAGEM DA /,
  /^DOSAGENS DE /,
  /^DOSAGENS DO /,
  /^DOSAGENS DA /,
  /^DETERMINACAO DE /,
  /^DETERMINACAO DO /,
  /^DETERMINACAO DA /,
  /^PESQUISA DE /,
  /^PESQUISA DO /,
  /^PESQUISA DA /,
  /^PESQUISA E DOSAGEM DE /,
  /^PESQUISA E DOSAGEM DO /,
  /^PESQUISA E DOSAGEM DA /,
  /^PROVA DE /,
  /^EXAME DE /,
  /^DOSAGEM /,
  /^PESQUISA /,
];

export function cleanVerboseTerms(text: string): string {
  let cleaned = text.toUpperCase().trim();
  let changed = true;
  while (changed) {
    changed = false;
    for (const regex of VERBOSE_PREFIXES) {
      if (regex.test(cleaned)) {
        cleaned = cleaned.replace(regex, '');
        changed = true;
      }
    }
  }
  return cleaned.trim();
}

function getTokens(text: string): string[] {
  return normalize(text).split(' ').filter(Boolean);
}

const EXCLUDED_ACRONYMS = new Set(['DE', 'DO', 'DA', 'E', 'OU', 'COM', 'SEM', 'POR', 'PARA', 'NOS', 'NAS', 'UM', 'UMA', 'A', 'O', 'AS', 'OS']);

function isAcronym(token: string): boolean {
  return /^[A-Z0-9]{3,6}$/.test(token) && !EXCLUDED_ACRONYMS.has(token);
}

export function findMatchingExam(aiName: string) {
  const allExams = CATEGORIAS_EXAMES.flatMap(c => c.exames);
  
  const cleanedAiName = cleanVerboseTerms(aiName);
  const normalizedCleanedAiName = normalize(cleanedAiName);
  const normalizedRawAiName = normalize(aiName);
  
  // 1. Busca exata normalizada pelo nome limpo
  for (const exame of allExams) {
    if (normalize(exame.nome) === normalizedCleanedAiName) {
      return exame;
    }
  }
  
  // 2. Busca exata normalizada pelo nome bruto
  for (const exame of allExams) {
    if (normalize(exame.nome) === normalizedRawAiName) {
      return exame;
    }
  }

  // 3. Substring: se o nome no banco contém o nome limpo da IA
  for (const exame of allExams) {
    const normDb = normalize(exame.nome);
    if (normDb.includes(normalizedCleanedAiName)) {
      return exame;
    }
  }
  
  // 4. Substring: se o nome no banco contém o nome bruto da IA
  for (const exame of allExams) {
    const normDb = normalize(exame.nome);
    if (normDb.includes(normalizedRawAiName)) {
      return exame;
    }
  }

  // 5. Comparação de sigla/acrônimo compartilhada (ex: TGO, TGP, GGT, TSH)
  const aiTokens = getTokens(aiName);
  const aiAcronyms = aiTokens.filter(isAcronym);
  
  if (aiAcronyms.length > 0) {
    const candidates: typeof allExams = [];
    for (const exame of allExams) {
      const dbTokens = getTokens(exame.nome);
      const dbAcronyms = dbTokens.filter(isAcronym);
      
      for (const acr of aiAcronyms) {
        if (dbAcronyms.includes(acr)) {
          candidates.push(exame);
          break;
        }
      }
    }
    
    if (candidates.length > 0) {
      // Retorna o candidato que tiver o menor nome (mais próximo do acrônimo puro)
      candidates.sort((a, b) => a.nome.length - b.nome.length);
      return candidates[0];
    }
  }

  return null;
}

export async function organizarExamesIA(
  textoExames: string,
  queixa: string,
  genero: string,
  idade?: string
): Promise<ResultadoExamesIA> {
  const contextoPaciente = [
    genero === 'M' ? 'Masculino' : 'Feminino',
    idade ? `${idade} anos` : '',
  ]
    .filter(Boolean)
    .join(', ');

  const examesPermitidosList = CATEGORIAS_EXAMES.flatMap(c => c.exames.map(e => e.nome));

  const userMessage = `EXAMES DIGITADOS PELO MÉDICO:
"""
${textoExames.trim()}
"""

${queixa.trim() ? `QUEIXA / CONTEXTO CLÍNICO: "${queixa.trim()}"` : 'QUEIXA: Não informada.'}
${contextoPaciente ? `PACIENTE: ${contextoPaciente}` : ''}

LISTA DE EXAMES PERMITIDOS NO SISTEMA (use exatamente esses nomes caso haja correspondência):
${examesPermitidosList.join(', ')}

Organize os exames e retorne apenas o JSON.`;

  const raw = await callGemini({
    prompt: userMessage,
    systemInstruction: SYSTEM_PROMPT,
    jsonMode: true
  });

  const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let parsed: ResultadoExamesIA;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('Resposta da IA não é um JSON válido. Tente novamente.');
  }

  // Validação mínima
  if (!parsed.exames || !Array.isArray(parsed.exames)) {
    throw new Error('Resposta da IA não contém lista de exames.');
  }

  // Pós-processamento e normalização com o banco local
  parsed.exames = parsed.exames.map((exame) => {
    const originalNomePadronizado = exame.nomePadronizado;
    const nomeLimpoParaBuscar = originalNomePadronizado.replace(/\s*\(verificar\)/gi, '').trim();
    const match = findMatchingExam(nomeLimpoParaBuscar);

    if (match) {
      return {
        ...exame,
        nomePadronizado: match.nome,
        codigoTUSS: match.codIpm || match.codIssec || exame.codigoTUSS || ''
      };
    } else {
      const nomeSemVerbose = cleanVerboseTerms(nomeLimpoParaBuscar);
      const temVerificar = originalNomePadronizado.toLowerCase().includes('(verificar)');
      return {
        ...exame,
        nomePadronizado: temVerificar ? `${nomeSemVerbose} (verificar)` : nomeSemVerbose
      };
    }
  });

  return parsed;
}
