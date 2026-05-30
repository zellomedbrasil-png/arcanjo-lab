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

const SYSTEM_PROMPT = `Você é um farmacêutico clínico sênior e consultor de receituário médico no Brasil, especializado em geriatria e segurança do paciente.
Dado o nome do medicamento, retorne APENAS um JSON válido (sem markdown, sem explicações adicionais) com as seguintes chaves:
{
  "principioAtivo": "Nome do princípio ativo + dosagem padrão (ex: Losartana Potássica 50mg)",
  "formaFarmaceutica": "Forma farmacêutica correta e usual (ex: Comprimidos revestidos, Cápsulas gastrorresistentes, Gotas, Aerossol nasal)",
  "uso": "Via de administração padrão (ex: Uso oral, Uso subcutâneo, Uso nasal, Uso tópico)",
  "posologia": "Instrução de administração em português brasileiro claro, de fácil entendimento pelo paciente. Para pacientes idosos, certifique-se de usar dosagens iniciais seguras e conservadoras e horários ideais de ingestão.",
  "quantidade": "Quantidade total a ser dispensada com base na posologia (ex: 30 comprimidos, 1 frasco de 10ml)",
  "duracao": "Duração sugerida do tratamento (ex: 30 dias, uso contínuo, 7 dias)",
  "indicacao": "Indicação clínica ou finalidade terapêutica simplificada e clara (ex: Tratamento de hipertensão arterial, controle de refluxo gástrico, etc.)",
  "observacoes": "Instruções críticas ao paciente (horários ideais, com ou sem alimentos). ATENÇÃO GERIÁTRICA (Critérios de Beers): Se o medicamento for potencialmente inapropriado para idosos (ex: benzodiazepínicos como Clonazepam/Diazepam; AINEs como Ibuprofeno/Nimesulida; tricíclicos como Amitriptilina), inclua OBRIGATORIAMENTE um alerta em MAIÚSCULAS iniciando com 'ATENÇÃO (CRITÉRIOS DE BEERS): ...' detalhando os riscos de quedas, sonolência, sangramento gastrointestinal ou disfunção renal.",
  "tipoReceita": "SIMPLES ou ESPECIAL — ESPECIAL estritamente para substâncias controladas pela Portaria ANVISA 344/98 (psicotrópicos, benzodiazepínicos, antidepressivos, opioides, anticonvulsivantes). Todos os demais são SIMPLES.",
  "motivoTipo": "Se ESPECIAL: descreva a classe e a lista de controle (ex: 'Lista C1 (Antidepressivos) da Portaria 344/98'). Se SIMPLES: deixe vazio."
}
REGRA DE SEGURANÇA: Não sugira medicamentos extras na posologia. Adote as recomendações de posologia brasileiras vigentes.`;

const BATCH_SYSTEM_PROMPT = `Você é um farmacêutico clínico sênior, consultor de receituário e especialista em geriatria e polifarmácia no Brasil.
Mapeie a lista de medicamentos fornecida e retorne APENAS um JSON válido contendo a análise completa de cada item, interações e riscos.

FORMATO DO JSON:
{
  "medicamentos": [
    {
      "nomeOriginal": "nome exatamente como digitado",
      "principioAtivo": "Nome do princípio ativo expandido + dosagem (ex: Omeprazol 20mg)",
      "formaFarmaceutica": "Forma farmacêutica completa no padrão nacional",
      "uso": "Via de administração",
      "posologia": "Instrução detalhada ao paciente, incluindo horários preferenciais.",
      "quantidade": "Quantidade sugerida (ex: 30 comprimidos)",
      "duracao": "Duração do tratamento (ex: 30 dias, uso contínuo)",
      "indicacao": "Indicação terapêutica simplificada do medicamento",
      "observacoes": "Orientação de administração e alertas de Beers para idosos se aplicável (ex: risco de quedas em benzodiazepínicos, hiponatremia em diuréticos, etc.)",
      "tipoReceita": "SIMPLES ou ESPECIAL perante a Portaria ANVISA 344/98",
      "motivoTipo": "Especificação da lista regulatória da ANVISA se ESPECIAL, ou vazio se SIMPLES."
    }
  ],
  "alertas": [
    "Alertas de interações medicamentosas graves detectadas (ex: AINE + ISRS = risco de sangramento gástrico; duplo bloqueio do sistema renina-angiotensina).",
    "Alertas de duplicidade terapêutica (ex: uso concomitante de dois ISRS ou dois benzodiazepínicos).",
    "Alertas de segurança do idoso (Critérios de Beers) identificando medicamentos inapropriados e riscos associados (queda de pressão, confusão, retenção urinária)."
  ]
}

REGRAS DE CONFORMIDADE:
- Retorne alertas detalhados baseados em evidência clínica de geriatria. Se não houver alertas, retorne um array vazio.
- Não invente medicamentos extras. O tamanho do array 'medicamentos' deve corresponder exatamente ao número de medicamentos da entrada do médico.
- Retorne apenas JSON legível puro, sem blocos markdown.`;

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
    indicacao: parsed.indicacao || '',
    observacoes: parsed.observacoes || '',
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
      indicacao: m.indicacao || '',
      observacoes: m.observacoes || '',
      tipoRecomendado,
      motivoEspecial: tipoRecomendado === 'ESPECIAL' ? (m.motivoTipo || 'Medicamento de Controle Especial') : '',
    };
  });

  return {
    medicamentos,
    alertas: parsed.alertas || [],
  };
}
