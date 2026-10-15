import type { MedicamentoReceita, TipoRecomendado } from '../store/useReceitaStore';
import { callAI } from '../config/gemini';
import { classificar } from '../data/regrasReceita';

// ─── Classificação regulatória ───────────────────────────────────
// A IA só sugere. Quem decide o papel é a tabela de substâncias em
// src/data/regrasReceita.ts (Portaria 344/98, RDC 471/2021, RDC 973/2025).

/** Resolve tipo e motivo de um item: tabela primeiro, IA só para nomes fora dela. */
function auditar(nome: string, uso: string, tipoIA: TipoRecomendado, motivoIA: string) {
  const info = classificar(nome, uso, { tipo: tipoIA, motivo: motivoIA });
  const tipoRecomendado: TipoRecomendado = info.modelo === 'SIMPLES' ? 'SIMPLES' : 'ESPECIAL';
  return { tipoRecomendado, motivoEspecial: tipoRecomendado === 'ESPECIAL' ? info.motivo : '' };
}

const SYSTEM_PROMPT = `Atue como um Mecanismo Avançado de Prescrição Médica Inteligente. Sua função é converter entradas rápidas e desestruturadas em receitas médicas de alta precisão, focando em autonomia clínica e velocidade. Siga estas diretrizes funcionais:

1. Processamento Inteligente: Converta abreviações e termos coloquiais em nomenclatura técnica farmacológica correta, expandindo posologias (ex: '1cp 12/12h' vira 'Tomar 01 comprimido por via oral de 12 em 12 horas').
2. Hierarquia de Formatação: As instruções de posologia e observações devem ser formatadas com markdown básico. Utilize negrito (ex: **Losartana 50mg**) para o nome do fármaco e concentração; se houver múltiplos passos ou regras de ingestão, utilize listas com marcadores (usando '*' ou '-') para facilitar a leitura.
3. Autonomia de Decisão: Caso seja fornecido apenas o diagnóstico ou a classe terapêutica, sugira a melhor opção de fármaco baseada em diretrizes atuais, incluindo dose padrão e duração do tratamento para validação médica.
4. Verificação de Segurança: A indicação deve expressar em poucas palavras a função básica do medicamento (ex: "Para controle da pressão", "Para gastrite"). Não coloque alertas longos ou interações medicamentosas nas observações do impresso.
5. Identificação de Suplementos e Fitoterápicos: Identifique corretamente fitoterápicos, suplementos alimentares, polivitamínicos e minerais comuns no Brasil (ex: 'Renovi B Plus', 'Lavitan', 'Centrum', 'Addera D3', etc.). NUNCA invente ou mapeie um suplemento ou vitamina para um medicamento de outra classe (por exemplo, jamais mapeie 'Renovi B Plus' ou qualquer vitamina B para o anti-hipertensivo 'Enalapril + Hidroclorotiazida'). Se o termo fornecido for um suplemento existente, preserve seu nome correto (ex: 'Renovi B Plus') e preencha as chaves com sua posologia usual e classifique como SIMPLES. Se o nome não for reconhecido, em vez de inventar, retorne erro informando que o medicamento não foi identificado.

Dado o nome do medicamento ou diagnóstico/classe, retorne APENAS um JSON válido (sem markdown fora do JSON, sem explicações adicionais) com as seguintes chaves:
{
  "principioAtivo": "Nome do princípio ativo + dosagem padrão (ex: Losartana Potássica 50mg)",
  "formaFarmaceutica": "Forma farmacêutica correta e usual (ex: Comprimidos revestidos, Cápsulas gastrorresistentes, Gotas, Aerossol nasal)",
  "uso": "Uso oral, Uso sublingual, Uso tópico, Uso nasal, Uso ocular, Uso inalatório, Uso vaginal, Uso retal, etc. (use nomenclaturas específicas compreensíveis para o paciente, não use a classificação genérica 'Uso Interno/Externo')",
  "posologia": "Instrução de administração formatada conforme as diretrizes (ex: 'Tomar **01 comprimido** por via oral de 12 em 12 horas.'). Utilize negrito para o fármaco/dosagem e listas se necessário.",
  "quantidade": "Quantidade total a ser dispensada com base na posologia (ex: 30 comprimidos, 1 frasco de 10ml)",
  "duracao": "Duração sugerida do tratamento (ex: 30 dias, uso contínuo, 7 dias)",
  "indicacao": "A função básica do medicamento em poucas palavras (ex: 'Para controle da pressão', 'Para gastrite', 'Para o colesterol', 'Para dormir'). Seja extremamente conciso.",
  "observacoes": "Instruções críticas ao paciente (horários, jejum, etc.). Mantenha extremamente curto e direto (ex: 'Tomar em jejum', 'Pode causar sonolência'). Não insira alertas de Beers ou interações aqui.",
  "tipoReceita": "SIMPLES ou ESPECIAL — ESPECIAL para: (a) substâncias da Portaria ANVISA 344/98 (psicotrópicos, benzodiazepínicos, antidepressivos, opioides, anticonvulsivantes); e (b) ANTIMICROBIANOS (antibióticos e antifúngicos sistêmicos), que pela RDC 471/2021 da ANVISA exigem receita em 2 vias com retenção na farmácia. Todos os demais são SIMPLES.",
  "motivoTipo": "Se ESPECIAL por controle: informe a lista exata da Portaria 344/98 (ex: 'Lista C1', 'Lista B1', 'Lista A1'). Se ESPECIAL por antimicrobiano: 'Antimicrobiano (RDC 471/2021) — receita em 2 vias'. Se SIMPLES: deixe vazio."
}
REGRA DE SEGURANÇA: Não sugira medicamentos extras na posologia. Adote as recomendações de posologia brasileiras vigentes.`;

const BATCH_SYSTEM_PROMPT = `Atue como um Mecanismo Avançado de Prescrição Médica Inteligente. Sua função é converter entradas rápidas e desestruturadas em receitas médicas de alta precisão, focando em autonomia clínica e velocidade. Siga estas diretrizes funcionais:

1. Processamento Inteligente: Converta abreviações e termos coloquiais em nomenclatura técnica farmacológica correta, expandindo posologias (ex: '1cp 12/12h' vira 'Tomar 01 comprimido por via oral de 12 em 12 horas').
2. Hierarquia de Formatação: As instruções de posologia e observações devem ser formatadas com markdown básico. Utilize negrito (ex: **Losartana 50mg**) para o nome do fármaco e concentração; se houver múltiplos passos ou regras, utilize listas com marcadores (usando '*' ou '-') para facilitar a leitura.
3. Autonomia de Decisão: Caso seja fornecido apenas o diagnóstico ou a classe terapêutica, sugira de 1 a 3 das melhores opções de fármacos baseadas em diretrizes atuais, incluindo doses padrão e duração do tratamento para validação médica.
4. Verificação de Segurança: A indicação deve expressar em poucas palavras a função básica do medicamento (ex: "Para controle da pressão", "Para gastrite"). Não coloque alertas longos ou interações medicamentosas nas observações de cada item (esses alertas devem ir apenas no array global "alertas" para visualização na tela do médico).
5. Identificação de Suplementos e Fitoterápicos: Identifique corretamente fitoterápicos, suplementos alimentares, polivitamínicos e minerais comuns no Brasil (ex: 'Renovi B Plus', 'Lavitan', 'Centrum', 'Addera D3', etc.). NUNCA invente ou mapeie um suplemento ou vitamina para um medicamento de outra classe (por exemplo, jamais mapeie 'Renovi B Plus' ou qualquer vitamina B para o anti-hipertensivo 'Enalapril + Hidroclorotiazida'). Se o termo fornecido na lista for um suplemento ou vitamina existente, preserve seu nome correto (ex: 'Renovi B Plus') e classifique como SIMPLES. Se o item não puder ser identificado, em vez de inventar, utilize o nome digitado, classifique como SIMPLES e preencha as chaves com 'Não identificado'.

Mapeie a lista de medicamentos, diagnósticos ou classes terapêuticas fornecida e retorne APENAS um JSON válido contendo a análise completa de cada item, interações e riscos.

FORMATO DO JSON:
{
  "medicamentos": [
    {
      "nomeOriginal": "nome exatamente como digitado pelo médico (ou o diagnóstico/classe caso tenha sido o termo de entrada)",
      "principioAtivo": "Nome do princípio ativo expandido + dosagem (ex: Omeprazol 20mg)",
      "formaFarmaceutica": "Forma farmacêutica completa no padrão nacional",
      "uso": "Uso oral, Uso sublingual, Uso tópico, Uso nasal, Uso ocular, Uso inalatório, Uso vaginal, Uso retal, etc. (use nomenclaturas específicas compreensíveis para o paciente, não use a classificação genérica 'Uso Interno/Externo')",
      "posologia": "Instrução detalhada ao paciente, formatada com negritos e listas conforme as diretrizes (ex: 'Tomar **01 comprimido** por via oral ao dia...').",
      "quantidade": "Quantidade sugerida (ex: 30 comprimidos)",
      "duracao": "Duração do tratamento (ex: 30 dias, uso contínuo)",
      "indicacao": "A função básica do medicamento em poucas palavras (ex: 'Para controle da pressão', 'Para gastrite', 'Para o colesterol', 'Para dormir'). Seja extremamente conciso.",
      "observacoes": "Orientação de administração (horários, jejum, etc.). Mantenha extremamente curto e direto (ex: 'Tomar em jejum', 'Pode causar sonolência'). Não insira alertas de Beers ou interações aqui.",
      "tipoReceita": "SIMPLES ou ESPECIAL — ESPECIAL para substâncias da Portaria ANVISA 344/98 E TAMBÉM para ANTIMICROBIANOS (antibióticos e antifúngicos sistêmicos), que pela RDC 471/2021 exigem receita em 2 vias",
      "motivoTipo": "Especificação da lista regulatória da ANVISA se controlado (ex: 'Lista B1 da Portaria 344/98'), 'Antimicrobiano (RDC 471/2021) — receita em 2 vias' se antibiótico/antifúngico, ou vazio se SIMPLES."
    }
  ],
  "alertas": [
    "Alertas discretos de interações medicamentosas graves detectadas (ex: AINE + ISRS = risco de sangramento gástrico).",
    "Alertas de segurança do idoso (Critérios de Beers 2023 / STOPP-START) caso identifique medicamentos potencialmente inapropriados para idosos (ex: benzodiazepínicos, amitriptilina, AINEs contínuos, metoclopramida prolongada, glimepirida, zolpidem), recomendando alternativas seguras."
  ]
}

REGRAS DE CONFORMIDADE:
- RASTREIO DE SEGURANÇA ATIVO (CRITÉRIOS DE BEERS 2023): Verifique ativamente se algum medicamento inserido apresenta risco para idosos (≥ 60 anos) ou causa interações graves. Insira avisos objetivos no array "alertas". Se não houver riscos, retorne o array vazio.
- Se for digitado um diagnóstico/classe (ex: "gastrite"), a IA deve sugerir os medicamentos ideais correspondentes. A quantidade de medicamentos sugerida deve ser de 1 a 3 conforme o bom senso médico.
- Retorne apenas JSON legível puro, sem blocos markdown fora das chaves.`;

interface GeminiMedResponse {
  principioAtivo: string;
  formaFarmaceutica: string;
  uso: string;
  posologia: string;
  quantidade: string;
  duracao: string;
  indicacao: string;
  observacoes: string;
  tipoReceita: string;
  motivoTipo: string;
}

interface GeminiBatchMedItem {
  nomeOriginal: string;
  principioAtivo: string;
  formaFarmaceutica: string;
  uso: string;
  posologia: string;
  quantidade: string;
  duracao: string;
  indicacao: string;
  observacoes: string;
  tipoReceita: string;
  motivoTipo: string;
}

interface GeminiBatchResponse {
  medicamentos: GeminiBatchMedItem[];
  alertas: string[];
}

export interface MedProcessado {
  nomeOriginal: string;
  principioAtivo: string;
  formaFarmaceutica: string;
  uso: string;
  posologia: string;
  quantidade: string;
  duracao: string;
  indicacao: string;
  observacoes: string;
  tipoRecomendado: TipoRecomendado;
  motivoEspecial: string;
}

import { extractJson } from '../lib/formatters';

export interface ResultadoListaMedicamentos {
  medicamentos: MedProcessado[];
  alertas: string[];
}

export async function gerarPosologia(
  nomeMedicamento: string
): Promise<Omit<MedicamentoReceita, 'id' | 'nomeDigitado' | 'carregando' | 'erro'>> {
  const raw = await callAI({
    prompt: `Medicamento: "${nomeMedicamento}"\n\nRetorne apenas o JSON sem markdown.`,
    systemInstruction: SYSTEM_PROMPT,
    jsonMode: true
  });

  const jsonStr = extractJson(raw);

  let parsed: GeminiMedResponse;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('Resposta da IA não é um JSON válido');
  }

  const tipoRecomendadoBruto: TipoRecomendado =
    parsed.tipoReceita === 'ESPECIAL' ? 'ESPECIAL' : 'SIMPLES';

  const principioFinal = parsed.principioAtivo || nomeMedicamento;
  const { tipoRecomendado, motivoEspecial } = auditar(
    `${principioFinal} ${nomeMedicamento}`, parsed.uso || '', tipoRecomendadoBruto, parsed.motivoTipo || ''
  );

  return {
    principioAtivo: principioFinal,
    formaFarmaceutica: parsed.formaFarmaceutica || '',
    uso: parsed.uso || 'Uso oral',
    posologia: parsed.posologia || '',
    quantidade: parsed.quantidade || '',
    duracao: parsed.duracao || '',
    indicacao: parsed.indicacao || '',
    observacoes: parsed.observacoes || '',
    tipoRecomendado,
    motivoEspecial,
  };
}

// ─── Processar lista de medicamentos (batch) ───────────────────
export async function processarListaMedicamentos(
  textoMedicamentos: string
): Promise<ResultadoListaMedicamentos> {
  const raw = await callAI({
    prompt: `LISTA DE MEDICAMENTOS:\n"""\n${textoMedicamentos.trim()}\n"""\n\nProcesse todos os medicamentos e retorne apenas o JSON.`,
    systemInstruction: BATCH_SYSTEM_PROMPT,
    jsonMode: true
  });

  const jsonStr = extractJson(raw);

  let parsed: GeminiBatchResponse;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('Resposta da IA não é um JSON válido. Tente novamente.');
  }

  if (!parsed.medicamentos || !Array.isArray(parsed.medicamentos)) {
    throw new Error('Resposta da IA não contém lista de medicamentos.');
  }

  const medicamentos: MedProcessado[] = parsed.medicamentos.map((m) => {
    const tipoSugerido = (m.tipoReceita === 'ESPECIAL' ? 'ESPECIAL' : 'SIMPLES') as TipoRecomendado;
    const principioFinal = m.principioAtivo || m.nomeOriginal || '';
    const { tipoRecomendado, motivoEspecial } = auditar(
      `${principioFinal} ${m.nomeOriginal || ''}`, m.uso || '', tipoSugerido, m.motivoTipo || ''
    );
    return {
      nomeOriginal: m.nomeOriginal || '',
      principioAtivo: principioFinal,
      formaFarmaceutica: m.formaFarmaceutica || '',
      uso: m.uso || 'Uso oral',
      posologia: m.posologia || '',
      quantidade: m.quantidade || '',
      duracao: m.duracao || '',
      indicacao: m.indicacao || '',
      observacoes: m.observacoes || '',
      tipoRecomendado,
      motivoEspecial,
    };
  });

  return {
    medicamentos,
    alertas: parsed.alertas || [],
  };
}
