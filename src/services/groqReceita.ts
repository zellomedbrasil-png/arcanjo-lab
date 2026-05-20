import type { MedicamentoReceita, TipoRecomendado } from '../store/useReceitaStore';
import { callGemini } from '../config/gemini';

// ─── Auditor Clínico Determinístico (Evita Falsos Positivos da IA) ───
export function auditarTipoReceita(principioAtivo: string, tipoSugerido: TipoRecomendado): TipoRecomendado {
  const nomeLower = principioAtivo.toLowerCase();

  // Lista de termos/princípios ativos que são ABSOLUTAMENTE SIMPLES (nunca controlados pela Portaria 344/98)
  const termosSimples = [
    // Anti-hipertensivos
    'losartana', 'enalapril', 'captopril', 'amlodipino', 'anlodipino', 'atenolol', 'propranolol', 
    'carvedilol', 'valsartana', 'telmisartana', 'hidroclorotiazida', 'indapamida', 'espironolactona', 
    'furosemida', 'ramipril', 'metildopa', 'clonidina', 'nebivolol', 'nifedipino',
    // Anti-diabéticos
    'metformina', 'gliclazida', 'glimepirida', 'glibenclamida', 'dapagliflozina', 'empagliflozina', 
    'sitagliptina', 'vildagliptina', 'linagliptina', 'liraglutida', 'semaglutida', 'ozempic', 
    'rybelsus', 'victoza', 'insulina', 'nph', 'regular', 'glargina', 'asparte', 'pioglitazona',
    // Estatinas / Dislipidemia
    'sinvastatina', 'atorvastatina', 'rosuvastatina', 'ezetimiba', 'ciprofibrato', 'fenofibrato', 
    'colestiramina', 'pitavastatina', 'pravastatina',
    // Protetores Gástricos / Digestivos
    'omeprazol', 'pantoprazol', 'esomeprazol', 'lansoprazol', 'rabeprazol', 'domperidona', 
    'metoclopramida', 'bromoprida', 'ondansetrona', 'ranitidina', 'famotidina', 'simeticona', 
    'lactulose', 'macrogol', 'alverina', 'mebeverina', 'hialuronato', 'pancreatina',
    // Analgésicos / Anti-inflamatórios comuns / Sintomas
    'paracetamol', 'dipirona', 'ibuprofeno', 'nimesulida', 'cetoprofeno', 'diclofenaco', 
    'meloxicam', 'piroxicam', 'celecoxibe', 'naproxeno', 'aas', 'ácido acetilsalicílico', 
    'tenoxicam', 'indometacina', 'flurbiprofeno',
    // Antialérgicos / Corticoides
    'loratadina', 'desloratadina', 'fexofenadina', 'cetirizina', 'dexclorfeniramina', 
    'prednisona', 'prednisolona', 'dexametasona', 'budesonida', 'fluticasona', 'montelucaste', 
    'levocetirizina', 'bilastina', 'rupatadina', 'hidroxizina',
    // Antibióticos / Antifúngicos comuns (usam receita de controle de antimicrobianos, mas NÃO Portaria 344)
    'amoxicilina', 'clavulanato', 'azitromicina', 'claritromicina', 'cefalexina', 'ceftriaxona', 
    'ciprofloxacino', 'levofloxacino', 'norfloxacino', 'sulfametoxazol', 'trimetoprima', 
    'nitrofurantoína', 'doxiciclina', 'eritromicina', 'clindamicina', 'metronidazol', 
    'fluconazol', 'itraconazol', 'cetoconazol', 'nistatina',
    // Tireoide
    'levotiroxina', 'puran', 'synthroid', 'tiamazol', 'propiltiuracil',
    // Vitaminas / Suplementos / Fitoterápicos
    'colecalciferol', 'vitamina', 'carbonato de cálcio', 'sulfato ferroso', 'ácido fólico', 
    'cobalamina', 'metilcobalamina', 'magnésio', 'zinco', 'ômega', 'coenzima', 'b12', 'ácido ascórbico',
    // Outros comuns
    'donepezila', 'galantamina', 'memantina', 'ginkgo', 'isoflavona', 'fitoterápico', 'colágeno'
  ];

  // Lista de termos/princípios ativos que são estritamente de controle especial (Portaria 344/98)
  const termosEspeciais = [
    // Benzodiazepínicos e Z-drugs
    'clonazepam', 'diazepam', 'alprazolam', 'lorazepam', 'midazolam', 'clobazam', 'bromazepam', 
    'zolpidem', 'zopiclona', 'eszopiclona', 'flunitrazepam', 'nitrazepam', 'estazolam',
    // Opioides
    'morfina', 'codeina', 'codeína', 'tramadol', 'metadona', 'fentanil', 'oxicodona', 'buprenorfina', 'tapentadol',
    // Antidepressivos
    'sertralina', 'fluoxetina', 'escitalopram', 'citalopram', 'paroxetina', 'duloxetina', 
    'venlafaxina', 'desvenlafaxina', 'amitriptilina', 'nortriptilina', 'imipramina', 'clomipramina', 
    'mirtazapina', 'bupropiona', 'trazodona', 'agomelatina', 'vortioxetina', 'trancilpromina', 'selegilina',
    // Antipsicóticos
    'risperidona', 'quetiapina', 'olanzapina', 'aripiprazol', 'haloperidol', 'clorpromazina', 
    'levomepromazina', 'sulpirida', 'clozapina', 'ziprasidona', 'pimozida', 'zuclopentixol', 'periciazina',
    // Anticonvulsivantes e Estabilizadores de Humor
    'gabapentina', 'pregabalina', 'carbamazepina', 'oxcarbazepina', 'valproato', 'ácido valpróico', 
    'ácido valproico', 'divalproato', 'topiramato', 'lamotrigina', 'fenitoína', 'fenitoina', 
    'fenobarbital', 'lítio', 'litio', 'carbonato de lítio', 'primidona', 'vigabatrina',
    // Estimulantes / TDAH
    'metilfenidato', 'ritalina', 'concerta', 'lisdexanfetamina', 'venvanse', 'atomoxetina', 'modafinila',
    // Outros controlados Portaria 344
    'sibutramina', 'biperideno'
  ];

  // 1. Prioridade absoluta para termos estritamente controlados
  if (termosEspeciais.some(termo => nomeLower.includes(termo))) {
    return 'ESPECIAL';
  }

  // 2. Se contiver termos estritamente simples, força a receita a ser SIMPLES
  if (termosSimples.some(termo => nomeLower.includes(termo))) {
    return 'SIMPLES';
  }

  // 3. Fallback para a sugestão da IA
  return tipoSugerido;
}

const SYSTEM_PROMPT = `Você é um farmacêutico clínico sênior e consultor de receituário médico no Brasil, com expertise em geriatria.
Dado o nome de um medicamento, retorne APENAS um JSON válido (sem markdown, sem explicações) com:
{
  "principioAtivo": "Nome do princípio ativo + dosagem (ex: Omeprazol 20mg)",
  "formaFarmaceutica": "Forma farmacêutica completa (ex: Cápsulas gastrorresistentes)",
  "uso": "Via de administração (Uso oral | Uso tópico | Uso nasal | Uso sublingual | etc.)",
  "posologia": "Instrução completa em português brasileiro claro e formal para o paciente. Para idosos (≥60 anos), prefira doses mais baixas quando aplicável e inclua orientações especiais (ex: tomar com água, evitar jejum prolongado).",
  "quantidade": "Quantidade total com unidade (ex: 30 cápsulas, 1 frasco de 120ml)",
  "duracao": "Duração do tratamento (ex: 30 dias, uso contínuo, 7 dias)",
  "tipoReceita": "SIMPLES ou ESPECIAL — ESPECIAL somente para: psicotrópicos (benzodiazepínicos como Clonazepam, Diazepam, Alprazolam; anfetamínicos; barbitúricos), opioides controlados (morfina, codeína acima de 30mg, tramadol em algumas apresentações), e demais sujeitos à Portaria SVS/MS 344/98 e suas locais B1, B2, A1-A5. Todos os demais são SIMPLES.",
  "motivoTipo": "Se ESPECIAL: explique brevemente qual lista da Portaria 344/98 enquadra o medicamento (ex: 'Benzodiazepínico — Lista B1 da Portaria SVS/MS 344/98'). Se SIMPLES: deixe vazio."
}
REGRA ABSOLUTA DE SEGURANÇA: Não adicione medicamentos adicionais na posologia ou nas orientações. Limite-se estritamente ao princípio ativo informado. Não invente dosagens ou frequências se forem omitidas e não houver um padrão seguro óbvio.
Use a posologia padrão mais comum e segura para adultos/idosos. Seja preciso e profissional.`;

// ─── Prompt para processar listas inteiras ──────────────────────
const BATCH_SYSTEM_PROMPT = `Você é um farmacêutico clínico sênior e consultor de receituário médico no Brasil, com expertise em geriatria e polifarmácia.

TAREFA: Receba uma lista de medicamentos e retorne APENAS um JSON válido com o formato:
{
  "medicamentos": [
    {
      "nomeOriginal": "como o médico digitou",
      "principioAtivo": "Nome do princípio ativo + dosagem (ex: Losartana Potássica 50mg)",
      "formaFarmaceutica": "Forma farmacêutica (ex: Comprimidos revestidos)",
      "uso": "Via de administração (Uso oral | Uso tópico | etc.)",
      "posologia": "Instrução completa e clara para o paciente, com horários quando relevante. Para idosos, prefira doses conservadoras.",
      "quantidade": "Quantidade total (ex: 30 comprimidos)",
      "duracao": "Duração (ex: 30 dias, uso contínuo)",
      "tipoReceita": "SIMPLES ou ESPECIAL — ESPECIAL somente para psicotrópicos, benzodiazepínicos, opioides controlados, antidepressivos, antipsicóticos, anticonvulsivantes/estabilizadores de humor e outros sujeitos à Portaria SVS/MS 344/98. Todos os demais medicamentos comuns (como anti-hipertensivos, antidiabéticos, estatinas, protetores gástricos, analgésicos e anti-inflamatórios comuns) são estritamente SIMPLES.",
      "motivoTipo": "Se ESPECIAL: qual lista da Portaria 344/98 enquadra o medicamento. Se SIMPLES: vazio."
    }
  ],
  "alertas": [
    "Alertas de interação medicamentosa ou duplicidade detectados (se houver). Se não houver, array vazio."
  ]
}

REGRAS IMPORTANTES:
- Se o médico escreveu abreviações ou nomes comerciais, expanda para princípio ativo + dosagem.
- Inclua alertas de interação medicamentosa entre os medicamentos da lista.
- Alerte sobre duplicidades terapêuticas (mesma classe).
- Para perfil geriátrico, alerte sobre medicamentos potencialmente inapropriados (Critérios de Beers).
- REGRA ABSOLUTA DE SEGURANÇA: NÃO adicione medicamentos adicionais que não foram descritos pelo médico na lista de entrada. Se a lista de entrada contiver apenas N medicamentos, a lista final de medicamentos do JSON deve conter exatamente N itens. A invenção de medicamentos adicionais é estritamente proibida.
- Mantenha a ordem original.
- Retorne APENAS JSON válido, sem markdown.`;

interface GeminiMedResponse {
  principioAtivo: string;
  formaFarmaceutica: string;
  uso: string;
  posologia: string;
  quantidade: string;
  duracao: string;
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
  tipoRecomendado: TipoRecomendado;
  motivoEspecial: string;
}

export interface ResultadoListaMedicamentos {
  medicamentos: MedProcessado[];
  alertas: string[];
}

export async function gerarPosologia(
  nomeMedicamento: string
): Promise<Omit<MedicamentoReceita, 'id' | 'nomeDigitado' | 'carregando' | 'erro'>> {
  const raw = await callGemini({
    prompt: `Medicamento: "${nomeMedicamento}"\n\nRetorne apenas o JSON sem markdown.`,
    systemInstruction: SYSTEM_PROMPT,
    jsonMode: true
  });

  const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let parsed: GeminiMedResponse;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('Resposta da IA não é um JSON válido');
  }

  const tipoRecomendadoBruto: TipoRecomendado =
    parsed.tipoReceita === 'ESPECIAL' ? 'ESPECIAL' : 'SIMPLES';

  const tipoRecomendado = auditarTipoReceita(parsed.principioAtivo || nomeMedicamento, tipoRecomendadoBruto);

  return {
    principioAtivo: parsed.principioAtivo || nomeMedicamento,
    formaFarmaceutica: parsed.formaFarmaceutica || '',
    uso: parsed.uso || 'Uso oral',
    posologia: parsed.posologia || '',
    quantidade: parsed.quantidade || '',
    duracao: parsed.duracao || '',
    tipoRecomendado,
    motivoEspecial: tipoRecomendado === 'ESPECIAL' ? (parsed.motivoTipo || 'Medicamento de Controle Especial') : '',
  };
}

// ─── Processar lista de medicamentos (batch) ───────────────────
export async function processarListaMedicamentos(
  textoMedicamentos: string
): Promise<ResultadoListaMedicamentos> {
  const raw = await callGemini({
    prompt: `LISTA DE MEDICAMENTOS:\n"""\n${textoMedicamentos.trim()}\n"""\n\nProcesse todos os medicamentos e retorne apenas o JSON.`,
    systemInstruction: BATCH_SYSTEM_PROMPT,
    jsonMode: true
  });

  const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

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
    const tipoRecomendado = auditarTipoReceita(m.principioAtivo || m.nomeOriginal || '', tipoSugerido);
    return {
      nomeOriginal: m.nomeOriginal || '',
      principioAtivo: m.principioAtivo || m.nomeOriginal || '',
      formaFarmaceutica: m.formaFarmaceutica || '',
      uso: m.uso || 'Uso oral',
      posologia: m.posologia || '',
      quantidade: m.quantidade || '',
      duracao: m.duracao || '',
      tipoRecomendado,
      motivoEspecial: tipoRecomendado === 'ESPECIAL' ? (m.motivoTipo || 'Medicamento de Controle Especial') : '',
    };
  });

  return {
    medicamentos,
    alertas: parsed.alertas || [],
  };
}
