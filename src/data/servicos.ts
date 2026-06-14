// Catálogo de Serviços / Terapias — ISSEC × IPM Saúde
// Base: material de apoio "Terapias e Sessões — ISSEC × IPM" (manuais ISSEC 2013–2015; IPM 2021).
// Os tetos mudam por portaria/instrução interna — confirme o número vigente com a auditoria do plano.

export type ServicoGrupo =
  | 'FISIOTERAPIA'
  | 'FONOAUDIOLOGIA'
  | 'PSICOLOGIA'
  | 'NUTRICAO'
  | 'TERAPIA_OCUPACIONAL'
  | 'ACUPUNTURA';

export interface ServicoDef {
  id: string;
  nome: string;
  nomeCurto: string;
  grupo: ServicoGrupo;
  /** Cobertura/teto resumido no ISSEC (vazio = não destacada no manual) */
  coberturaIssec: string;
  /** Cobertura/teto resumido no IPM (vazio = não listada) */
  coberturaIpm: string;
  /** Texto-padrão de justificativa (anti-glosa). Campos entre [colchetes] devem ser preenchidos. */
  justificativaPadrao: string;
}

export const SERVICOS: ServicoDef[] = [
  {
    id: 'FISIO_MOTORA',
    nome: 'Fisioterapia Motora / Ortopédica / Neurofuncional',
    nomeCurto: 'Fisio Motora/Neuro',
    grupo: 'FISIOTERAPIA',
    coberturaIssec: '≈ 30 sessões/ano · máx. 3x/semana',
    coberturaIpm: '12 sessões/mês · até 5x/semana',
    justificativaPadrao:
      'Paciente com [diagnóstico — CID], apresentando [dor / limitação de amplitude de movimento / déficit de marcha e equilíbrio / redução de força]. Indicada fisioterapia [motora/neurofuncional], [nº] sessões, [frequência], visando [ganho funcional / reeducação de marcha / prevenção de imobilismo e quedas]. Reavaliação ao término do ciclo. Na ausência do tratamento, risco de agravamento e sequela funcional irreversível.',
  },
  {
    id: 'FISIO_RESPIRATORIA',
    nome: 'Fisioterapia Respiratória',
    nomeCurto: 'Fisio Respiratória',
    grupo: 'FISIOTERAPIA',
    coberturaIssec: 'Até 5x/semana (respiratória)',
    coberturaIpm: '12 sessões/mês · até 5x/semana',
    justificativaPadrao:
      'Paciente com [DPOC / pneumopatia / pós-internamento], evoluindo com [dispneia / retenção de secreção / hipoxemia]. Indicada fisioterapia respiratória, até 5 sessões/semana, para higiene brônquica, reexpansão pulmonar e prevenção de complicações infecciosas e de reinternação.',
  },
  {
    id: 'FONOAUDIOLOGIA',
    nome: 'Fonoaudiologia',
    nomeCurto: 'Fonoaudiologia',
    grupo: 'FONOAUDIOLOGIA',
    coberturaIssec: 'Coberta via Guia de Serviço II',
    coberturaIpm: 'Coberta · anexar laudos dos exames',
    justificativaPadrao:
      'Paciente com [disfagia / afasia / disartria pós-AVE / distúrbio de linguagem], conforme [laudo de videodeglutograma / avaliação fonoaudiológica anexa]. Necessária fonoterapia para reabilitação da deglutição segura e/ou da comunicação, reduzindo risco de broncoaspiração e pneumonia aspirativa.',
  },
  {
    id: 'PSICOLOGIA',
    nome: 'Psicologia / Psicoterapia',
    nomeCurto: 'Psicoterapia',
    grupo: 'PSICOLOGIA',
    coberturaIssec: 'Teto ≈ 48 sessões/ano (4/mês, até 2x/semana)',
    coberturaIpm: 'Por periodicidade · análise da Auditoria IPM',
    justificativaPadrao:
      'Paciente com [transtorno depressivo / ansioso / quadro F__ / processo de luto], em acompanhamento clínico. Indicada psicoterapia, [frequência], para estabilização do quadro, manejo de sintomas e adesão ao tratamento, com reavaliação periódica do plano terapêutico.',
  },
  {
    id: 'NUTRICAO',
    nome: 'Nutrição',
    nomeCurto: 'Nutrição',
    grupo: 'NUTRICAO',
    coberturaIssec: 'Coberta via Guia de Serviço II',
    coberturaIpm: 'Não listada no teleatendimento IPM',
    justificativaPadrao:
      'Paciente com [DM / DRC / desnutrição / sarcopenia / obesidade], necessitando acompanhamento nutricional individualizado para [controle metabólico / recuperação do estado nutricional], com reavaliações seriadas e ajuste de conduta.',
  },
  {
    id: 'TERAPIA_OCUPACIONAL',
    nome: 'Terapia Ocupacional',
    nomeCurto: 'Terapia Ocupacional',
    grupo: 'TERAPIA_OCUPACIONAL',
    coberturaIssec: 'Não destacada no manual ISSEC',
    coberturaIpm: 'Coberta entre as Terapias do IPM',
    justificativaPadrao:
      'Paciente com [comprometimento funcional/cognitivo — sequela de AVE / demência / fragilidade], necessitando terapia ocupacional para treino de atividades de vida diária (AVDs), estimulação cognitiva e manutenção da independência funcional.',
  },
  {
    id: 'ACUPUNTURA',
    nome: 'Acupuntura',
    nomeCurto: 'Acupuntura',
    grupo: 'ACUPUNTURA',
    coberturaIssec: 'Não destacada no manual ISSEC',
    coberturaIpm: 'Coberta entre as Terapias do IPM',
    justificativaPadrao:
      'Paciente com [dor crônica / lombalgia / cefaleia / osteoartrose], refratária a [tratamento medicamentoso prévio]. Indicada acupuntura como terapia complementar para controle álgico e redução do consumo de analgésicos.',
  },
];

export const SERVICO_POR_ID = Object.fromEntries(
  SERVICOS.map((s) => [s.id, s])
) as Record<string, ServicoDef>;

export function getServicoNome(id: string): string {
  return SERVICO_POR_ID[id]?.nome ?? id;
}

export const GRUPOS_SERVICOS: ServicoGrupo[] = [
  'FISIOTERAPIA',
  'FONOAUDIOLOGIA',
  'PSICOLOGIA',
  'NUTRICAO',
  'TERAPIA_OCUPACIONAL',
  'ACUPUNTURA',
];

export const SERVICOS_POR_GRUPO = GRUPOS_SERVICOS.reduce((acc, grupo) => {
  acc[grupo] = SERVICOS.filter((s) => s.grupo === grupo);
  return acc;
}, {} as Record<ServicoGrupo, ServicoDef[]>);

// ── Regras gerais por convênio (campos da guia, validade, documentos) ──────────
export const SERVICO_REGRAS = {
  ISSEC: {
    guia: 'Guia de Serviço II (campo do médico requisitante)',
    validade: '90 dias (fisio/fono) · 180 dias (psicologia)',
    documentos: 'Cartão Saúde ISSEC válido + documento oficial com foto',
    excedente: 'Processo administrativo com laudo do médico assistente',
  },
  IPM: {
    guia: 'Solicitação médica / relatório do profissional (guia IPM)',
    validade: 'Até 90 dias',
    documentos: 'Carteira do IPM · na Fonoaudiologia, anexar laudos dos exames',
    excedente: 'Não autorizado por periodicidade → Auditoria IPM em até 72h',
  },
} as const;
