// src/data/protocolosClinica.ts
// Protocolos de Clínica Médica (adulto, ambulatório). Tipos e convenções em
// src/data/protocolos.ts. Todos marcados `revisar` até validação do médico.
//
// `apresentacao` é o índice da dose em dosesDe(): 0 = padrão do catálogo,
// 1 em diante = ordem de `apresentacoes` no catálogo.

import type { ProtocoloQueixa } from './protocolos';

export const PROTOCOLOS_CLINICA: ProtocoloQueixa[] = [
  {
    id: 'clin-has',
    queixa: 'Hipertensão arterial (adulto)',
    sinonimos: ['pressão alta', 'has', 'hipertensao', 'hipertensão'],
    area: 'CLINICA_GERAL',
    cid10: 'I10',
    revisar: true,
    resumo: 'Combinação inicial de BRA + bloqueador de canal de cálcio na maioria dos hipertensos.',
    padraoOuro: {
      nota: 'Losartana + anlodipino, meta < 130/80 mmHg.',
      medicamentos: [
        { medicamentoId: 'losartana-50', posologia: 'Tomar 1 comprimido por via oral pela manhã.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
        { medicamentoId: 'anlodipino-5', posologia: 'Tomar 1 comprimido por via oral pela manhã.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    acessivel: {
      nota: 'Losartana + hidroclorotiazida, ambos gratuitos na Farmácia Popular.',
      medicamentos: [
        { medicamentoId: 'losartana-50', posologia: 'Tomar 1 comprimido por via oral pela manhã.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
        { medicamentoId: 'hidroclorotiazida-25', posologia: 'Tomar 1 comprimido por via oral pela manhã.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    orientacoes: ['Reduzir sal para menos de 5 g/dia; atividade física 150 min/semana.', 'Medir a pressão em casa e trazer o registro.'],
    alertas: ['Dosar potássio e creatinina 2 a 4 semanas após iniciar BRA.'],
  },
  {
    id: 'clin-dm2',
    queixa: 'Diabetes tipo 2 (adulto)',
    sinonimos: ['diabetes', 'dm2', 'glicemia alta', 'açúcar alto'],
    area: 'CLINICA_GERAL',
    cid10: 'E11',
    revisar: true,
    resumo: 'Metformina + iSGLT2 quando há risco cardiovascular ou renal.',
    padraoOuro: {
      nota: 'Metformina XR + empagliflozina 10mg.',
      medicamentos: [
        { medicamentoId: 'metformina-xr-500', posologia: 'Tomar 2 comprimidos por via oral após o jantar.', quantidade: '60 comprimidos', duracao: 'Uso contínuo' },
        { medicamentoId: 'empagliflozina-25', apresentacao: 1, posologia: 'Tomar 1 comprimido por via oral pela manhã.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    acessivel: {
      nota: 'Metformina (FP) + gliclazida (UBS).',
      medicamentos: [
        { medicamentoId: 'metformina-850', posologia: 'Tomar 1 comprimido por via oral após o almoço e 1 comprimido após o jantar.', quantidade: '60 comprimidos', duracao: 'Uso contínuo' },
        { medicamentoId: 'gliclazida-30mr', posologia: 'Tomar 1 comprimido por via oral pela manhã, junto ao café.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    orientacoes: ['Meta de HbA1c < 7% na maioria dos adultos.', 'Fundo de olho, microalbuminúria e exame dos pés anuais.'],
    alertas: ['iSGLT2: suspender 3 dias antes de cirurgia ou em jejum prolongado (cetoacidose euglicêmica).'],
  },
  {
    id: 'clin-dislipidemia',
    queixa: 'Dislipidemia / LDL alto',
    sinonimos: ['colesterol alto', 'ldl alto', 'dislipidemia', 'triglicerídeos'],
    area: 'CLINICA_GERAL',
    cid10: 'E78.5',
    revisar: true,
    resumo: 'Estatina de alta intensidade conforme o risco; ezetimiba se não atingir a meta.',
    padraoOuro: {
      nota: 'Rosuvastatina 20mg (alta intensidade).',
      medicamentos: [
        { medicamentoId: 'rosuvastatina-10', apresentacao: 2, posologia: 'Tomar 1 comprimido por via oral uma vez ao dia.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    acessivel: {
      nota: 'Sinvastatina 40mg, gratuita na Farmácia Popular.',
      medicamentos: [
        { medicamentoId: 'sinvastatina-40', posologia: 'Tomar 1 comprimido por via oral à noite.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    orientacoes: ['Repetir perfil lipídico em 6 a 8 semanas.', 'Dieta pobre em gordura saturada; atividade física.'],
    alertas: ['Dor muscular intensa ou urina escura: suspender e dosar CPK.'],
  },
  {
    id: 'clin-itu',
    queixa: 'Cistite não complicada (mulher)',
    sinonimos: ['itu', 'infecção urinária', 'cistite', 'ardência para urinar', 'disúria'],
    area: 'CLINICA_GERAL',
    cid10: 'N30.0',
    revisar: true,
    resumo: 'Fosfomicina dose única ou nitrofurantoína 5 dias; evitar quinolona na cistite simples.',
    padraoOuro: {
      nota: 'Fosfomicina 3 g em dose única.',
      medicamentos: [
        { medicamentoId: 'fosfomicina-3g', posologia: 'Diluir 1 sachê em um copo de água e tomar em dose única, à noite, após esvaziar a bexiga.', quantidade: '1 sachê', duracao: 'Dose única' },
      ],
    },
    acessivel: {
      nota: 'Sulfametoxazol-trimetoprima na UBS, se resistência local < 20%.',
      medicamentos: [
        { medicamentoId: 'smx-tmp', posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.', quantidade: '6 comprimidos', duracao: '3 dias' },
      ],
    },
    orientacoes: ['Aumentar a ingestão de água; não segurar a urina.'],
    alertas: ['Febre, dor lombar ou gestante: não é cistite simples — urocultura e esquema de pielonefrite.'],
  },
  {
    id: 'clin-sinusite',
    queixa: 'Rinossinusite bacteriana aguda',
    sinonimos: ['sinusite', 'rinossinusite', 'secreção nasal', 'dor na face'],
    area: 'CLINICA_GERAL',
    cid10: 'J01',
    revisar: true,
    resumo: 'Antibiótico só se > 10 dias, piora após melhora ou febre alta com secreção purulenta.',
    padraoOuro: {
      nota: 'Amoxicilina 875mg 12/12h por 7 dias + corticoide nasal.',
      medicamentos: [
        { medicamentoId: 'amoxicilina-500', apresentacao: 1, posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.', quantidade: '14 comprimidos', duracao: '7 dias' },
        { medicamentoId: 'budesonida-nasal', apresentacao: 1, posologia: 'Aplicar 2 jatos em cada narina, uma vez ao dia, pela manhã.', quantidade: '1 frasco', duracao: '30 dias' },
      ],
    },
    orientacoes: ['Lavagem nasal com soro fisiológico 3 a 4 vezes ao dia.'],
    alertas: ['Edema periorbitário, alteração visual ou cefaleia intensa: complicação — avaliação urgente.'],
  },
  {
    id: 'clin-amigdalite',
    queixa: 'Faringoamigdalite bacteriana',
    sinonimos: ['amigdalite', 'dor de garganta', 'faringite', 'placa na garganta'],
    area: 'CLINICA_GERAL',
    cid10: 'J03.9',
    revisar: true,
    resumo: 'Amoxicilina por 10 dias quando o escore de Centor sugere estreptococo.',
    padraoOuro: {
      nota: 'Amoxicilina 500mg 8/8h por 10 dias.',
      medicamentos: [
        { medicamentoId: 'amoxicilina-500', posologia: 'Tomar 1 cápsula por via oral de 8 em 8 horas.', quantidade: '30 cápsulas', duracao: '10 dias' },
        { medicamentoId: 'dipirona-500', posologia: 'Tomar 1 comprimido por via oral de 6 em 6 horas, se dor ou febre.', quantidade: '20 comprimidos', duracao: 'Em caso de dor ou febre' },
      ],
    },
    orientacoes: ['Penicilina benzatina 1.200.000 UI IM dose única é alternativa se baixa adesão.'],
    alertas: ['Trismo, voz abafada ou desvio da úvula: abscesso periamigdaliano — avaliação urgente.'],
  },
  {
    id: 'clin-pac',
    queixa: 'Pneumonia comunitária (ambulatorial)',
    sinonimos: ['pneumonia', 'pac', 'infecção pulmonar'],
    area: 'CLINICA_GERAL',
    cid10: 'J18.9',
    revisar: true,
    resumo: 'CURB-65 0–1: tratamento oral; comorbidade pede betalactâmico + macrolídeo.',
    padraoOuro: {
      nota: 'Com comorbidade: amoxicilina-clavulanato + azitromicina.',
      medicamentos: [
        { medicamentoId: 'amoxicilina-clavulanato', posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas, no início das refeições.', quantidade: '14 comprimidos', duracao: '7 dias' },
        { medicamentoId: 'azitromicina-500', posologia: 'Tomar 1 comprimido por via oral uma vez ao dia.', quantidade: '3 comprimidos', duracao: '3 dias' },
      ],
    },
    acessivel: {
      nota: 'Sem comorbidade: amoxicilina (UBS).',
      medicamentos: [
        { medicamentoId: 'amoxicilina-500', posologia: 'Tomar 1 cápsula por via oral de 8 em 8 horas.', quantidade: '21 cápsulas', duracao: '7 dias' },
      ],
    },
    orientacoes: ['Retorno em 48 a 72 horas para reavaliar.'],
    alertas: ['CURB-65 ≥ 2, saturação < 92% ou confusão: internação.'],
  },
  {
    id: 'clin-gota-cronica',
    queixa: 'Gota crônica (hipouricemiante)',
    sinonimos: ['gota', 'ácido úrico alto', 'hiperuricemia', 'tofo'],
    area: 'CLINICA_GERAL',
    cid10: 'M10.9',
    revisar: true,
    resumo: 'Alopurinol titulado até ácido úrico < 6 mg/dl, com colchicina de proteção.',
    padraoOuro: {
      nota: 'Alopurinol 100mg (subir 100mg a cada 2–4 semanas) + colchicina 0,5mg/dia por 3–6 meses.',
      medicamentos: [
        { medicamentoId: 'alopurinol-100', posologia: 'Tomar 1 comprimido por via oral uma vez ao dia, após uma refeição.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
        { medicamentoId: 'colchicina-05', posologia: 'Tomar 1 comprimido por via oral uma vez ao dia.', quantidade: '30 comprimidos', duracao: '90 dias' },
      ],
    },
    orientacoes: ['Iniciar 2 semanas após a crise.', 'Reduzir cerveja, carne vermelha, frutos do mar e bebidas com frutose.'],
    alertas: ['Rash cutâneo com alopurinol: suspender imediatamente (risco de reação grave).'],
  },
  {
    id: 'clin-lombalgia',
    queixa: 'Lombalgia aguda',
    sinonimos: ['dor lombar', 'lombalgia', 'dor nas costas', 'lumbago'],
    area: 'CLINICA_GERAL',
    cid10: 'M54.5',
    revisar: true,
    resumo: 'AINE por curto prazo e manter-se ativo; relaxante muscular só à noite e por poucos dias.',
    padraoOuro: {
      nota: 'Naproxeno 5 dias + ciclobenzaprina à noite.',
      medicamentos: [
        { medicamentoId: 'naproxeno-500', posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas, após as refeições.', quantidade: '10 comprimidos', duracao: '5 dias' },
        { medicamentoId: 'ciclobenzaprina-5', posologia: 'Tomar 1 comprimido por via oral à noite.', quantidade: '7 comprimidos', duracao: '7 dias' },
      ],
    },
    acessivel: {
      nota: 'Dipirona (UBS) + ibuprofeno.',
      medicamentos: [
        { medicamentoId: 'dipirona-500', posologia: 'Tomar 1 comprimido por via oral de 6 em 6 horas, se dor.', quantidade: '20 comprimidos', duracao: 'Em caso de dor' },
        { medicamentoId: 'ibuprofeno-600', posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas, após as refeições.', quantidade: '15 comprimidos', duracao: '5 dias' },
      ],
    },
    orientacoes: ['Evitar repouso no leito; caminhar dentro do tolerado.', 'Calor local.'],
    alertas: ['Déficit neurológico, retenção urinária, febre, câncer prévio ou trauma: investigar (bandeiras vermelhas).'],
  },
  {
    id: 'clin-enxaqueca',
    queixa: 'Enxaqueca — crise',
    sinonimos: ['enxaqueca', 'migrânea', 'dor de cabeça', 'cefaleia'],
    area: 'CLINICA_GERAL',
    cid10: 'G43.9',
    revisar: true,
    resumo: 'AINE no início da dor; profilaxia se 4 ou mais crises por mês.',
    padraoOuro: {
      nota: 'Naproxeno no início da crise; dipirona de resgate.',
      medicamentos: [
        { medicamentoId: 'naproxeno-500', posologia: 'Tomar 1 comprimido por via oral no início da dor; pode repetir em 12 horas.', quantidade: '10 comprimidos', duracao: 'Em caso de dor' },
        { medicamentoId: 'dipirona-500', apresentacao: 1, posologia: 'Tomar 1 comprimido por via oral de 6 em 6 horas, se dor.', quantidade: '10 comprimidos', duracao: 'Em caso de dor' },
      ],
    },
    orientacoes: ['Diário de cefaleia: gatilhos, frequência e remédios usados.', 'Usar analgésico no máximo 10 dias por mês (cefaleia por abuso).'],
    alertas: ['Pior dor da vida, início súbito, déficit focal ou febre com rigidez de nuca: emergência.'],
  },
  {
    id: 'clin-rinite',
    queixa: 'Rinite alérgica',
    sinonimos: ['rinite', 'alergia', 'espirro', 'coriza', 'nariz entupido'],
    area: 'CLINICA_GERAL',
    cid10: 'J30.4',
    revisar: true,
    resumo: 'Corticoide nasal é o tratamento mais eficaz; anti-histamínico para crise.',
    padraoOuro: {
      nota: 'Budesonida nasal 32mcg (FP) + cetirizina.',
      medicamentos: [
        { medicamentoId: 'budesonida-nasal', apresentacao: 1, posologia: 'Aplicar 2 jatos em cada narina, uma vez ao dia, pela manhã.', quantidade: '1 frasco', duracao: '30 dias' },
        { medicamentoId: 'cetirizina-10', posologia: 'Tomar 1 comprimido por via oral à noite.', quantidade: '10 comprimidos', duracao: '10 dias' },
      ],
    },
    acessivel: {
      nota: 'Beclometasona nasal (FP) + loratadina (UBS).',
      medicamentos: [
        { medicamentoId: 'beclometasona-nasal-50', posologia: 'Aplicar 2 jatos em cada narina de 12 em 12 horas.', quantidade: '1 frasco', duracao: '30 dias' },
        { medicamentoId: 'loratadina-10', posologia: 'Tomar 1 comprimido por via oral uma vez ao dia.', quantidade: '10 comprimidos', duracao: '10 dias' },
      ],
    },
    orientacoes: ['Lavagem nasal com soro fisiológico.', 'Controle de ácaros: capa no travesseiro, sem tapete e bicho de pelúcia.'],
  },
  {
    id: 'clin-asma',
    queixa: 'Asma (manutenção)',
    sinonimos: ['asma', 'bronquite', 'chiado', 'falta de ar'],
    area: 'CLINICA_GERAL',
    cid10: 'J45',
    revisar: true,
    resumo: 'GINA: budesonida-formoterol como manutenção e alívio; sem SABA isolado.',
    padraoOuro: {
      nota: 'Budesonida-formoterol 200/6 de 12/12h + dose extra se sintomas (MART).',
      medicamentos: [
        { medicamentoId: 'budesonida-formoterol', posologia: 'Inalar 1 dose de 12 em 12 horas e enxaguar a boca; pode usar 1 dose extra se falta de ar.', quantidade: '1 dispositivo (60 doses)', duracao: 'Uso contínuo' },
      ],
    },
    acessivel: {
      nota: 'Beclometasona + salbutamol, ambos gratuitos na Farmácia Popular.',
      medicamentos: [
        { medicamentoId: 'beclometasona-inalatoria-250', posologia: 'Inalar 1 jato de 12 em 12 horas e enxaguar a boca em seguida.', quantidade: '1 frasco (200 doses)', duracao: 'Uso contínuo' },
        { medicamentoId: 'salbutamol-spray', posologia: 'Inalar 2 jatos, se falta de ar ou chiado, até 4 vezes ao dia.', quantidade: '1 frasco (200 doses)', duracao: 'Em caso de sintomas' },
      ],
    },
    orientacoes: ['Conferir a técnica inalatória a cada consulta; usar espaçador com spray.'],
    alertas: ['Resgate mais de 2 vezes por semana ou despertar noturno: asma não controlada — subir a etapa.'],
  },
  {
    id: 'clin-hipotireoidismo',
    queixa: 'Hipotireoidismo (adulto)',
    sinonimos: ['hipotireoidismo', 'tireoide', 'tsh alto', 'hashimoto'],
    area: 'CLINICA_GERAL',
    cid10: 'E03.9',
    revisar: true,
    resumo: 'Levotiroxina em jejum; dose plena ≈ 1,6 mcg/kg no adulto sem cardiopatia.',
    padraoOuro: {
      nota: 'Levotiroxina 50 mcg, ajustar pelo TSH em 6 a 8 semanas.',
      medicamentos: [
        { medicamentoId: 'levotiroxina-50', posologia: 'Tomar 1 comprimido por via oral em jejum, 30 a 60 minutos antes do café da manhã.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    orientacoes: ['Tomar sempre no mesmo horário, só com água.', 'Afastar 4 horas de cálcio, ferro e omeprazol.'],
    alertas: ['Idoso ou coronariopata: começar com 25 mcg.'],
  },
  {
    id: 'clin-anemia-ferropriva',
    queixa: 'Anemia ferropriva (adulto)',
    sinonimos: ['anemia', 'ferro baixo', 'ferritina baixa'],
    area: 'CLINICA_GERAL',
    cid10: 'D50.9',
    revisar: true,
    resumo: 'Ferro em dias alternados por 3 meses; sempre investigar a causa.',
    padraoOuro: {
      nota: 'Sulfato ferroso em dias alternados.',
      medicamentos: [
        { medicamentoId: 'sulfato-ferroso-40', posologia: 'Tomar 1 comprimido por via oral em dias alternados, 1 hora antes do almoço.', quantidade: '45 comprimidos', duracao: '90 dias' },
      ],
    },
    orientacoes: ['Tomar com suco cítrico; longe de leite, café e antiácido.'],
    alertas: ['Homem ou mulher pós-menopausa: investigar perda digestiva (endoscopia e colonoscopia).'],
  },
  {
    id: 'clin-herpes-zoster',
    queixa: 'Herpes zoster',
    sinonimos: ['zoster', 'cobreiro', 'herpes zóster'],
    area: 'CLINICA_GERAL',
    cid10: 'B02.9',
    revisar: true,
    resumo: 'Antiviral nas primeiras 72 horas reduz dor aguda e duração.',
    padraoOuro: {
      nota: 'Valaciclovir 1 g de 8/8h por 7 dias + analgesia.',
      medicamentos: [
        { medicamentoId: 'valaciclovir-500', posologia: 'Tomar 2 comprimidos (1g) por via oral de 8 em 8 horas.', quantidade: '42 comprimidos', duracao: '7 dias' },
        { medicamentoId: 'dipirona-500', apresentacao: 1, posologia: 'Tomar 1 comprimido por via oral de 6 em 6 horas, se dor.', quantidade: '20 comprimidos', duracao: 'Em caso de dor' },
      ],
    },
    acessivel: {
      nota: 'Aciclovir (UBS), 5 tomadas ao dia.',
      medicamentos: [
        { medicamentoId: 'aciclovir-400', posologia: 'Tomar 2 comprimidos (800mg) por via oral 5 vezes ao dia.', quantidade: '70 comprimidos', duracao: '7 dias' },
      ],
    },
    orientacoes: ['Manter as lesões limpas e secas; evitar contato com gestantes e imunossuprimidos até crostas.'],
    alertas: ['Zoster oftálmico (ponta do nariz, olho): oftalmologista no mesmo dia.'],
  },
  {
    id: 'clin-candidiase-vaginal',
    queixa: 'Candidíase vaginal',
    sinonimos: ['candidíase', 'corrimento', 'coceira vaginal', 'monilíase'],
    area: 'CLINICA_GERAL',
    cid10: 'B37.3',
    revisar: true,
    resumo: 'Fluconazol 150 mg em dose única.',
    padraoOuro: {
      nota: 'Fluconazol dose única (UBS).',
      medicamentos: [
        { medicamentoId: 'fluconazol-150', posologia: 'Tomar 1 cápsula por via oral em dose única.', quantidade: '1 cápsula', duracao: 'Dose única' },
      ],
    },
    orientacoes: ['Roupa íntima de algodão; evitar duchas vaginais.'],
    alertas: ['4 ou mais episódios no ano: candidíase recorrente — investigar diabetes e tratar por 6 meses.'],
  },
];
