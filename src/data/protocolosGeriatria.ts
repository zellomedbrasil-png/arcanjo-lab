// src/data/protocolosGeriatria.ts
// 30 protocolos de Geriatria. Ver src/data/protocolos.ts para os tipos e a
// convenção das duas versões (padrão-ouro / acessível).
//
// Fio condutor destes protocolos: critérios de Beers 2023, ajuste por função
// renal e prevenção de cascata iatrogênica. Onde a conduta clássica do adulto
// jovem é insegura no idoso, a versão padrão-ouro já traz a alternativa segura.

import type { ProtocoloQueixa } from './protocolos';

export const PROTOCOLOS_GERIATRIA: ProtocoloQueixa[] = [
  {
    id: 'geri-has',
    queixa: 'Hipertensão arterial',
    sinonimos: ['pressão alta', 'has', 'hipertensao'],
    area: 'GERIATRIA',
    cid10: 'I10',
    resumo: 'Anti-hipertensivo de primeira linha no idoso, com meta pressórica individualizada e atenção a hipotensão postural.',
    padraoOuro: {
      nota: 'Primeira escolha: BRA isolado ou associado a bloqueador de canal de cálcio.',
      medicamentos: [
        { medicamentoId: 'losartana-50', posologia: 'Tomar 1 comprimido por via oral pela manhã.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
        { medicamentoId: 'anlodipino-5', posologia: 'Tomar 1 comprimido por via oral pela manhã.', quantidade: '30 comprimidos', duracao: 'Uso contínuo', observacoes: 'Se edema de tornozelo, reduzir a dose antes de associar diurético.' },
      ],
    },
    acessivel: {
      nota: 'Ambos gratuitos na Farmácia Popular, com evidência de desfecho equivalente.',
      medicamentos: [
        { medicamentoId: 'hidroclorotiazida-25', posologia: 'Tomar 1 comprimido por via oral pela manhã.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
        { medicamentoId: 'enalapril-10', posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.', quantidade: '60 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    orientacoes: [
      'Medir a pressão sentado e em pé: queda de 20mmHg sistólica ao levantar indica hipotensão postural e risco de queda.',
      'Reduzir sódio, manter atividade física regular e controlar o peso.',
      'Trazer o registro domiciliar da pressão nas consultas.',
    ],
    alertas: [
      'Meta pressórica no idoso frágil é menos rígida — pressão baixa demais aumenta queda e mortalidade.',
      'Dosar potássio e creatinina 1 a 2 semanas após iniciar ou ajustar IECA/BRA.',
    ],
  },
  {
    id: 'geri-dm2',
    queixa: 'Diabetes tipo 2',
    sinonimos: ['dm2', 'diabetes', 'glicemia alta', 'açúcar alto'],
    area: 'GERIATRIA',
    cid10: 'E11',
    resumo: 'Controle glicêmico com meta relaxada no idoso, priorizando drogas sem hipoglicemia.',
    padraoOuro: {
      nota: 'Metformina + iSGLT2, pelo benefício cardiorrenal e ausência de hipoglicemia.',
      medicamentos: [
        { medicamentoId: 'metformina-850', posologia: 'Tomar 1 comprimido por via oral após o jantar.', quantidade: '60 comprimidos', duracao: 'Uso contínuo', observacoes: 'Iniciar 1x/dia e subir devagar reduz intolerância digestiva.' },
        { medicamentoId: 'dapagliflozina-10', posologia: 'Tomar 1 comprimido por via oral pela manhã.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    acessivel: {
      nota: 'Ambos na Farmácia Popular. Gliclazida é a sulfonilureia de escolha no idoso.',
      medicamentos: [
        { medicamentoId: 'metformina-850', posologia: 'Tomar 1 comprimido por via oral após o jantar.', quantidade: '60 comprimidos', duracao: 'Uso contínuo' },
        { medicamentoId: 'gliclazida-30mr', posologia: 'Tomar 1 comprimido por via oral pela manhã, no café.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    orientacoes: [
      'Meta de HbA1c no idoso é mais frouxa: 7,5–8,0% em quem tem comorbidade ou fragilidade.',
      'Reconhecer hipoglicemia: sudorese, tremor, confusão — no idoso pode se manifestar só como queda ou desorientação.',
      'Atividade física regular e ajuste alimentar seguem sendo a base.',
    ],
    alertas: [
      'Suspender metformina se ClCr < 30 e em qualquer intercorrência aguda com risco de desidratação.',
      'Evitar glibenclamida no idoso (Beers) — risco alto de hipoglicemia prolongada.',
      'Uso crônico de metformina causa deficiência de B12: dosar anualmente.',
    ],
  },
  {
    id: 'geri-insonia',
    queixa: 'Insônia',
    sinonimos: ['não dorme', 'dificuldade para dormir', 'sono ruim'],
    area: 'GERIATRIA',
    cid10: 'G47.0',
    revisar: true,
    resumo: 'Tratamento sem benzodiazepínico, que os critérios de Beers pedem para evitar no idoso.',
    padraoOuro: {
      nota: 'Trazodona em dose baixa — não gera dependência nem tolerância como as drogas Z.',
      medicamentos: [
        { medicamentoId: 'trazodona-50', posologia: 'Tomar 1 comprimido (50mg) por via oral 30 minutos antes de deitar.', quantidade: '30 comprimidos', duracao: 'Uso contínuo', observacoes: 'Iniciar com meio comprimido e subir só se necessário.' },
      ],
    },
    acessivel: {
      nota: 'Mirtazapina quando há também perda de apetite ou humor deprimido associados.',
      medicamentos: [
        { medicamentoId: 'mirtazapina-15', posologia: 'Tomar 1 comprimido por via oral à noite, antes de deitar.', quantidade: '30 comprimidos', duracao: 'Uso contínuo', observacoes: 'A dose de 15mg é MAIS sedativa que a de 30mg.' },
      ],
    },
    orientacoes: [
      'Higiene do sono vem antes do remédio: horário fixo, sem cochilo longo à tarde, sem tela na cama.',
      'Cortar cafeína após as 14h e evitar álcool à noite — o álcool fragmenta o sono.',
      'Exposição à luz natural pela manhã ajuda a reajustar o ciclo.',
    ],
    alertas: [
      'EVITAR benzodiazepínico e zolpidem no idoso (Beers): queda, fratura, delirium e declínio cognitivo.',
      'Investigar apneia do sono, síndrome das pernas inquietas, noctúria e depressão antes de tratar como insônia primária.',
      'Trazodona pode causar hipotensão ortostática — orientar levantar devagar.',
    ],
  },
  {
    id: 'geri-depressao',
    queixa: 'Depressão no idoso',
    sinonimos: ['tristeza', 'humor deprimido', 'desânimo', 'depressao'],
    area: 'GERIATRIA',
    cid10: 'F32',
    resumo: 'ISRS com menor perfil de interação, iniciando em metade da dose do adulto.',
    padraoOuro: {
      nota: 'Sertralina — o ISRS mais estudado no idoso, com baixa interação medicamentosa.',
      medicamentos: [
        { medicamentoId: 'sertralina-50', posologia: 'Tomar 1/2 comprimido por via oral pela manhã por 7 dias; após, 1 comprimido pela manhã.', quantidade: '30 comprimidos', duracao: 'Uso contínuo', observacoes: 'Start low, go slow: iniciar com metade da dose reduz efeito adverso inicial.' },
      ],
    },
    acessivel: {
      nota: 'Fluoxetina é gratuita na UBS, mas interage mais e tem meia-vida longa.',
      medicamentos: [
        { medicamentoId: 'fluoxetina-20', posologia: 'Tomar 1 cápsula por via oral pela manhã.', quantidade: '30 cápsulas', duracao: 'Uso contínuo' },
      ],
    },
    orientacoes: [
      'O efeito pleno leva de 4 a 6 semanas — não interromper antes disso por achar que "não funcionou".',
      'Não suspender por conta própria: a retirada deve ser gradual.',
      'Atividade física e convívio social têm efeito antidepressivo real e somam ao remédio.',
    ],
    alertas: [
      'Vigiar hiponatremia (SIADH) nas primeiras semanas — é causa frequente de confusão no idoso em ISRS.',
      'Investigar ideação suicida ativamente; o risco é alto em homens idosos.',
      'Afastar hipotireoidismo, deficiência de B12 e efeito de medicação antes de fechar o diagnóstico.',
    ],
  },
  {
    id: 'geri-ansiedade',
    queixa: 'Ansiedade',
    sinonimos: ['nervosismo', 'angústia', 'preocupação excessiva', 'tag'],
    area: 'GERIATRIA',
    cid10: 'F41.1',
    revisar: true,
    resumo: 'ISRS como tratamento de base, sem benzodiazepínico de manutenção.',
    padraoOuro: {
      nota: 'Escitalopram, de excelente tolerabilidade e pouquíssimas interações.',
      medicamentos: [
        { medicamentoId: 'escitalopram-10', posologia: 'Tomar 1/2 comprimido por via oral pela manhã por 7 dias; após, 1 comprimido pela manhã.', quantidade: '30 comprimidos', duracao: 'Uso contínuo', observacoes: 'Máximo 10mg/dia acima dos 65 anos, por risco de prolongamento de QT.' },
      ],
    },
    acessivel: {
      nota: 'Sertralina, gratuita na UBS, com perfil igualmente seguro no idoso.',
      medicamentos: [
        { medicamentoId: 'sertralina-50', posologia: 'Tomar 1/2 comprimido (25mg) por via oral pela manhã na 1ª semana; depois 1 comprimido pela manhã.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    orientacoes: [
      'A melhora começa após 2 a 4 semanas; nas primeiras semanas a ansiedade pode até aumentar um pouco.',
      'Técnicas de respiração, atividade física e psicoterapia somam ao tratamento.',
    ],
    alertas: [
      'NÃO prescrever benzodiazepínico de manutenção (Beers) — se já em uso crônico, planejar desmame de 10 a 25% a cada 2 semanas.',
      'Afastar hipertireoidismo, arritmia e uso de estimulantes antes de tratar como ansiedade primária.',
    ],
  },
  {
    id: 'geri-alzheimer',
    queixa: 'Doença de Alzheimer',
    sinonimos: ['demência', 'perda de memória', 'alzheimer', 'esquecimento'],
    area: 'GERIATRIA',
    cid10: 'G30',
    resumo: 'Anticolinesterásico na doença leve a moderada, com memantina associada nas fases mais avançadas.',
    padraoOuro: {
      nota: 'Donepezila titulada, associando memantina a partir do estágio moderado.',
      medicamentos: [
        { medicamentoId: 'donepezila-5', posologia: 'Tomar 1 comprimido por via oral à noite, antes de deitar, por 4 a 6 semanas.', quantidade: '30 comprimidos', duracao: 'Uso contínuo', observacoes: 'Manter 5mg por 4–6 semanas antes de subir para 10mg.' },
        { medicamentoId: 'memantina-10', posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas, após titulação gradual.', quantidade: '60 comprimidos', duracao: 'Uso contínuo', observacoes: 'Titular 5mg por semana até 20mg/dia. Ajustar se ClCr < 30.' },
      ],
    },
    acessivel: {
      nota: 'Ambos são gratuitos pelo Componente Especializado, via LME/PCDT Alzheimer.',
      medicamentos: [
        { medicamentoId: 'donepezila-5', posologia: 'Tomar 1 comprimido por via oral à noite, antes de deitar.', quantidade: '30 comprimidos', duracao: 'Uso contínuo', observacoes: 'Dispensação por LME na farmácia estadual — orientar a família sobre o processo.' },
      ],
    },
    orientacoes: [
      'O tratamento estabiliza e desacelera, não reverte — alinhar expectativa com a família desde o início.',
      'Rotina estável, orientação temporal e atividade cognitiva e física fazem diferença mensurável.',
      'Orientar a família sobre segurança domiciliar: fogão, medicações, direção e risco de perambulação.',
    ],
    alertas: [
      'Vigiar bradicardia, síncope, náusea e pesadelos com o anticolinesterásico.',
      'Piora cognitiva abrupta sugere delirium — procurar infecção, desidratação ou medicação nova, não progressão da demência.',
      'Antipsicótico em demência aumenta mortalidade: usar só se houver risco à segurança e reavaliar a cada 3 meses.',
    ],
  },
  {
    id: 'geri-osteoporose',
    queixa: 'Osteoporose',
    sinonimos: ['osso fraco', 'densitometria alterada', 'fratura por fragilidade'],
    area: 'GERIATRIA',
    cid10: 'M81',
    resumo: 'Bisfosfonato semanal com reposição obrigatória de cálcio e vitamina D.',
    padraoOuro: {
      nota: 'Alendronato semanal, sempre com o suporte mineral corrigido antes.',
      medicamentos: [
        { medicamentoId: 'alendronato-70', posologia: 'Tomar 1 comprimido por via oral uma vez por semana, em jejum, com um copo cheio de água; permanecer em pé ou sentado por 30 minutos.', quantidade: '4 comprimidos', duracao: 'Uso contínuo' },
        { medicamentoId: 'calcio-d3', posologia: 'Tomar 1 comprimido por via oral ao dia, durante uma refeição.', quantidade: '60 comprimidos', duracao: 'Uso contínuo', observacoes: 'Tomar em horário diferente do alendronato — cálcio bloqueia a absorção.' },
      ],
    },
    acessivel: {
      nota: 'Alendronato pela Farmácia Popular e cálcio + D3 pela UBS.',
      medicamentos: [
        { medicamentoId: 'alendronato-70', posologia: 'Tomar 1 comprimido por via oral uma vez por semana, em jejum, com um copo cheio de água; permanecer ereto por 30 minutos.', quantidade: '4 comprimidos', duracao: 'Uso contínuo' },
        { medicamentoId: 'calcio-d3', posologia: 'Tomar 1 comprimido por via oral ao dia, durante uma refeição.', quantidade: '60 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    orientacoes: [
      'O alendronato precisa ser tomado em jejum absoluto, só com água, e sem deitar por 30 minutos.',
      'Exercício com carga e treino de equilíbrio reduzem fratura tanto quanto o remédio.',
      'Revisar a casa: tapetes soltos, iluminação e barras de apoio no banheiro.',
    ],
    alertas: [
      'Corrigir vitamina D ANTES de iniciar o bisfosfonato, sob risco de hipocalcemia.',
      'Contraindicado em esofagopatia ou em quem não consegue permanecer ereto por 30 minutos.',
      'Avaliação odontológica antes de iniciar, pelo risco (baixo) de osteonecrose de mandíbula.',
    ],
  },
  {
    id: 'geri-osteoartrite',
    queixa: 'Osteoartrite / dor articular',
    sinonimos: ['artrose', 'dor no joelho', 'dor nas juntas', 'artrite'],
    area: 'GERIATRIA',
    cid10: 'M19.9',
    resumo: 'Analgesia escalonada poupando AINE sistêmico, que os critérios de Beers desaconselham cronicamente.',
    padraoOuro: {
      nota: 'Paracetamol como base; coxibe por curto período se a dor não ceder.',
      medicamentos: [
        { medicamentoId: 'paracetamol-750', posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas, se dor.', quantidade: '30 comprimidos', duracao: 'Uso conforme dor', observacoes: 'Teto de 3g/dia no idoso.' },
        { medicamentoId: 'celecoxibe-200', posologia: 'Tomar 1 cápsula por via oral ao dia, após o almoço, por até 10 dias.', quantidade: '10 cápsulas', duracao: '10 dias', observacoes: 'Menor risco digestivo que os AINEs tradicionais, mas mantém risco renal e cardiovascular.' },
      ],
    },
    acessivel: {
      nota: 'Paracetamol e dipirona, sem AINE — a combinação mais segura no idoso.',
      medicamentos: [
        { medicamentoId: 'paracetamol-750', posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas, se dor.', quantidade: '30 comprimidos', duracao: 'Uso conforme dor' },
        { medicamentoId: 'dipirona-500', posologia: 'Tomar 1 comprimido por via oral de 6 em 6 horas, se dor forte.', quantidade: '20 comprimidos', duracao: 'Uso conforme dor' },
      ],
    },
    orientacoes: [
      'Fortalecimento muscular e perda de peso têm efeito comparável ao do medicamento na artrose de joelho.',
      'Calor local antes da atividade e frio após a sobrecarga ajudam no controle sintomático.',
      'Bengala do lado oposto ao joelho doloroso reduz a carga articular.',
    ],
    alertas: [
      'AINE sistêmico crônico no idoso (Beers): sangramento digestivo, lesão renal e descompensação de HAS e IC.',
      'Se AINE for inevitável, associar inibidor de bomba de prótons e limitar a duração.',
      'Paracetamol: teto de 2g/dia em hepatopata ou etilista.',
    ],
  },
  {
    id: 'geri-constipacao',
    queixa: 'Constipação intestinal',
    sinonimos: ['intestino preso', 'obstipação', 'não evacua', 'prisão de ventre'],
    area: 'GERIATRIA',
    cid10: 'K59.0',
    resumo: 'Laxante osmótico, sem laxante estimulante crônico, que gera dependência do trânsito.',
    padraoOuro: {
      nota: 'Macrogol — primeira linha nas diretrizes de constipação crônica.',
      medicamentos: [
        { medicamentoId: 'macrogol-3350', posologia: 'Diluir 1 sachê em um copo de água (200mL) e tomar uma vez ao dia, pela manhã.', quantidade: '30 sachês', duracao: 'Uso contínuo' },
      ],
    },
    acessivel: {
      nota: 'Lactulose, gratuita na UBS; causa mais gases nas primeiras semanas.',
      medicamentos: [
        { medicamentoId: 'lactulose', posologia: 'Tomar 15mL por via oral pela manhã, ajustando conforme a resposta.', quantidade: '1 frasco de 120mL', duracao: 'Uso contínuo' },
      ],
    },
    orientacoes: [
      'Aumentar água e fibra gradualmente — fibra sem água piora a constipação.',
      'Caminhar diariamente e respeitar o reflexo evacuatório após as refeições.',
      'Apoiar os pés num banquinho no vaso melhora o ângulo anorretal.',
    ],
    alertas: [
      'Constipação de início recente após os 50 anos exige investigação de câncer colorretal.',
      'Revisar a medicação: opioide, anticolinérgico, ferro e bloqueador de cálcio são causas frequentes.',
      'Evitar laxante estimulante crônico (cáscara, sene) — dependência do trânsito e melanose coli.',
    ],
  },
  {
    id: 'geri-ic',
    queixa: 'Insuficiência cardíaca',
    sinonimos: ['ic', 'falta de ar aos esforços', 'edema de pernas', 'coração fraco'],
    area: 'GERIATRIA',
    cid10: 'I50',
    revisar: true,
    resumo: 'Terapia modificadora de doença na IC com fração de ejeção reduzida, mais diurético para congestão.',
    padraoOuro: {
      nota: 'Quatro pilares com benefício de mortalidade: sacubitril/valsartana (ou IECA/BRA), betabloqueador, antagonista da aldosterona e iSGLT2.',
      medicamentos: [
        { medicamentoId: 'sacubitril-valsartana', apresentacao: 1, posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.', quantidade: '60 comprimidos', duracao: 'Uso contínuo', observacoes: 'Iniciar com 24/26mg no idoso; dobrar a cada 2 a 4 semanas. Suspender IECA 36 horas antes.' },
        { medicamentoId: 'carvedilol-625', posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas, junto às refeições.', quantidade: '60 comprimidos', duracao: 'Uso contínuo', observacoes: 'Titular a cada 2 semanas conforme tolerância.' },
        { medicamentoId: 'espironolactona-25', posologia: 'Tomar 1 comprimido por via oral pela manhã.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
        { medicamentoId: 'dapagliflozina-10', posologia: 'Tomar 1 comprimido por via oral pela manhã.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    acessivel: {
      nota: 'IECA + diurético, ambos gratuitos, quando o esquema completo não é viável.',
      medicamentos: [
        { medicamentoId: 'enalapril-10', posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.', quantidade: '60 comprimidos', duracao: 'Uso contínuo' },
        { medicamentoId: 'furosemida-40', posologia: 'Tomar 1 comprimido por via oral pela manhã.', quantidade: '30 comprimidos', duracao: 'Uso contínuo', observacoes: 'Ajustar pela congestão, não por horário fixo.' },
      ],
    },
    orientacoes: [
      'Pesar-se todos os dias, em jejum: ganho de 2kg em 3 dias indica congestão e exige contato.',
      'Restringir sal; a restrição hídrica só é necessária se houver hiponatremia.',
      'Reconhecer piora: falta de ar deitado, inchaço crescente, cansaço súbito.',
    ],
    alertas: [
      'Monitorar potássio e creatinina em 1 e 4 semanas após iniciar espironolactona.',
      'Evitar AINE — precipita descompensação e lesão renal.',
      'Betabloqueador nunca é iniciado durante descompensação aguda.',
    ],
  },
  {
    id: 'geri-fa',
    queixa: 'Fibrilação atrial — anticoagulação',
    sinonimos: ['fa', 'arritmia', 'coração descompassado', 'anticoagulante'],
    area: 'GERIATRIA',
    cid10: 'I48',
    resumo: 'Anticoagulação para prevenção de AVC, com escolha guiada por função renal e risco de sangramento.',
    padraoOuro: {
      nota: 'Apixabana — melhor perfil de sangramento entre os anticoagulantes diretos no idoso frágil.',
      medicamentos: [
        { medicamentoId: 'apixabana-5', posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.', quantidade: '60 comprimidos', duracao: 'Uso contínuo', observacoes: 'Reduzir para 2,5mg 12/12h se 2 de 3: idade ≥80, peso ≤60kg, creatinina ≥1,5.' },
      ],
    },
    acessivel: {
      nota: 'Varfarina é gratuita e é a única opção em prótese valvar mecânica e ClCr muito baixo.',
      medicamentos: [
        { medicamentoId: 'varfarina-5', posologia: 'Tomar conforme esquema orientado pelo controle de RNI, no fim da tarde.', quantidade: '30 comprimidos', duracao: 'Uso contínuo', observacoes: 'Exige controle periódico de RNI, alvo 2–3.' },
      ],
    },
    orientacoes: [
      'Nunca interromper por conta própria — o risco de AVC volta em poucos dias.',
      'Avisar qualquer dentista ou cirurgião sobre o anticoagulante antes de procedimentos.',
      'Com varfarina, manter consumo constante de verduras verde-escuras, sem cortar nem exagerar.',
    ],
    alertas: [
      'Sangramento com repercussão, fezes escuras ou queda com trauma de crânio exigem avaliação imediata.',
      'Idade avançada e risco de queda NÃO são, isoladamente, contraindicação — o benefício costuma superar.',
      'Rivaroxabana exige ser tomada com alimento para absorver.',
    ],
  },
  {
    id: 'geri-dislipidemia',
    queixa: 'Dislipidemia / prevenção cardiovascular',
    sinonimos: ['colesterol alto', 'ldl alto', 'estatina', 'triglicerides'],
    area: 'GERIATRIA',
    cid10: 'E78.5',
    resumo: 'Estatina com potência ajustada ao risco, priorizando prevenção secundária.',
    padraoOuro: {
      nota: 'Estatina de alta potência com menor interação — importante na polifarmácia do idoso.',
      medicamentos: [
        { medicamentoId: 'rosuvastatina-10', posologia: 'Tomar 1 comprimido por via oral ao dia.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    acessivel: {
      nota: 'Sinvastatina é gratuita na Farmácia Popular.',
      medicamentos: [
        { medicamentoId: 'sinvastatina-40', posologia: 'Tomar 1 comprimido por via oral à noite.', quantidade: '30 comprimidos', duracao: 'Uso contínuo', observacoes: 'Limitar a 20mg se em uso de anlodipino.' },
      ],
    },
    orientacoes: [
      'Dor muscular difusa deve ser relatada — não suspender por conta própria antes de avaliar.',
      'Dieta e atividade física somam ao efeito da estatina, não a substituem.',
    ],
    alertas: [
      'Em prevenção primária no idoso muito frágil ou com expectativa de vida limitada, reavaliar se ainda há benefício.',
      'Dosar transaminases e CPK se houver sintoma muscular.',
      'Sinvastatina + fibrato ou + claritromicina aumentam risco de miopatia.',
    ],
  },
  {
    id: 'geri-hipotireoidismo',
    queixa: 'Hipotireoidismo',
    sinonimos: ['tireoide baixa', 'tsh alto', 'levotiroxina'],
    area: 'GERIATRIA',
    cid10: 'E03.9',
    resumo: 'Reposição iniciada em dose baixa no idoso e cardiopata, titulada pelo TSH.',
    padraoOuro: {
      nota: 'Iniciar baixo e subir devagar — reposição rápida precipita angina e arritmia.',
      medicamentos: [
        { medicamentoId: 'levotiroxina-25', posologia: 'Tomar 1 comprimido por via oral em jejum, 30 a 60 minutos antes do café da manhã.', quantidade: '30 comprimidos', duracao: 'Uso contínuo', observacoes: 'Reavaliar TSH em 6 a 8 semanas antes de ajustar.' },
      ],
    },
    orientacoes: [
      'Tomar em jejum, sempre no mesmo horário, e esperar 30 a 60 minutos para comer.',
      'Afastar 4 horas de cálcio, ferro, omeprazol e suplementos.',
      'Não trocar de marca sem avisar — a potência pode variar entre fabricantes.',
    ],
    alertas: [
      'No idoso, o alvo de TSH é mais alto que no adulto jovem; sobretratar causa fibrilação atrial e perda óssea.',
      'Hipotireoidismo subclínico com TSH abaixo de 10 raramente exige tratamento no idoso.',
    ],
  },
  {
    id: 'geri-anemia-ferropriva',
    queixa: 'Anemia ferropriva',
    sinonimos: ['anemia', 'ferro baixo', 'ferritina baixa', 'fraqueza'],
    area: 'GERIATRIA',
    cid10: 'D50.9',
    revisar: true,
    resumo: 'Reposição de ferro em dias alternados, que absorve mais que o esquema diário.',
    padraoOuro: {
      nota: 'Dose em dias alternados: eleva menos a hepcidina e absorve mais ferro total.',
      medicamentos: [
        { medicamentoId: 'sulfato-ferroso-40', posologia: 'Tomar 1 comprimido por via oral em dias alternados, 1 hora antes do almoço.', quantidade: '45 comprimidos', duracao: '90 dias', observacoes: 'Tomar com suco cítrico melhora a absorção.' },
      ],
    },
    orientacoes: [
      'Afastar de leite, café, chá, antiácido e omeprazol — todos bloqueiam a absorção do ferro.',
      'Fezes escuras são efeito esperado do ferro, não sangramento.',
      'Manter a reposição por 3 meses após normalizar a hemoglobina, para repor o estoque.',
    ],
    alertas: [
      'Anemia ferropriva no idoso EXIGE investigar perda digestiva — pode ser a primeira manifestação de câncer colorretal.',
      'Dosar B12 antes de repor folato isolado, sob risco de mascarar anemia perniciosa.',
    ],
  },
  {
    id: 'geri-deficiencia-b12',
    queixa: 'Deficiência de vitamina B12',
    sinonimos: ['b12 baixa', 'anemia perniciosa', 'formigamento', 'parestesia'],
    area: 'GERIATRIA',
    cid10: 'E53.8',
    resumo: 'Reposição parenteral na má absorção, que é a causa mais comum no idoso.',
    padraoOuro: {
      nota: 'Via intramuscular — garante reposição mesmo com má absorção ou gastrite atrófica.',
      medicamentos: [
        { medicamentoId: 'cianocobalamina-1000', posologia: 'Aplicar 1 ampola por via intramuscular uma vez por semana por 4 semanas; após, 1 ampola por mês.', quantidade: '4 ampolas', duracao: 'Conforme reposição' },
      ],
    },
    orientacoes: [
      'A melhora neurológica é lenta e pode ser incompleta se a deficiência era antiga.',
      'Retornar para as aplicações de manutenção mensais sem interromper.',
    ],
    alertas: [
      'Uso crônico de metformina e de omeprazol é causa frequente e subdiagnosticada.',
      'Repor B12 ANTES do folato — folato isolado corrige a anemia e deixa a lesão neurológica progredir.',
    ],
  },
  {
    id: 'geri-deficiencia-vitd',
    queixa: 'Deficiência de vitamina D',
    sinonimos: ['vitamina d baixa', 'hipovitaminose d'],
    area: 'GERIATRIA',
    cid10: 'E55.9',
    resumo: 'Reposição semanal com redosagem após 8 a 12 semanas.',
    padraoOuro: {
      nota: 'Colecalciferol semanal, mais prático e com boa adesão.',
      medicamentos: [
        { medicamentoId: 'colecalciferol-7000', posologia: 'Tomar 1 cápsula por via oral uma vez por semana, junto a uma refeição.', quantidade: '8 cápsulas', duracao: '8 semanas' },
      ],
    },
    acessivel: {
      nota: 'Cálcio + D3 pela UBS — a vitamina D isolada não consta na RENAME.',
      medicamentos: [
        { medicamentoId: 'calcio-d3', posologia: 'Tomar 1 comprimido por via oral ao dia, durante uma refeição.', quantidade: '60 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    orientacoes: [
      'Tomar junto a uma refeição com gordura melhora a absorção.',
      'Exposição solar de 15 a 20 minutos ao dia, sem protetor nos braços, ajuda a manter o nível.',
    ],
    alertas: ['Redosar 25-OH-vitamina D após 8 a 12 semanas e ajustar; doses altas contínuas causam hipercalcemia.'],
  },
  {
    id: 'geri-itu',
    queixa: 'Infecção urinária',
    sinonimos: ['itu', 'cistite', 'ardência para urinar', 'disúria'],
    area: 'GERIATRIA',
    cid10: 'N39.0',
    resumo: 'Antibiótico de curta duração na cistite não complicada, evitando quinolona no idoso.',
    padraoOuro: {
      nota: 'Fosfomicina em dose única — adesão perfeita e baixo impacto em resistência.',
      medicamentos: [
        { medicamentoId: 'fosfomicina-3g', posologia: 'Diluir 1 sachê em um copo de água e tomar em dose única, à noite, após esvaziar a bexiga.', quantidade: '1 sachê', duracao: 'Dose única' },
      ],
    },
    acessivel: {
      nota: 'Nitrofurantoína, primeira linha clássica, desde que a função renal permita.',
      medicamentos: [
        { medicamentoId: 'nitrofurantoina-100', posologia: 'Tomar 1 cápsula por via oral de 6 em 6 horas, junto às refeições.', quantidade: '20 cápsulas', duracao: '5 dias', observacoes: 'CONTRAINDICADA se ClCr < 30.' },
      ],
    },
    orientacoes: [
      'Aumentar a ingestão de água durante o tratamento.',
      'Procurar atendimento se surgir febre, dor lombar ou vômito — sugere pielonefrite.',
    ],
    alertas: [
      'Bacteriúria assintomática no idoso NÃO deve ser tratada — tratar só piora resistência.',
      'Confusão mental isolada, sem sintoma urinário, raramente é ITU: investigar outras causas.',
      'Evitar ciprofloxacino como primeira linha (Beers): tendinopatia, delirium e aneurisma de aorta.',
    ],
  },
  {
    id: 'geri-dor-neuropatica',
    queixa: 'Dor neuropática',
    sinonimos: ['queimação', 'formigamento', 'neuropatia', 'dor em choque'],
    area: 'GERIATRIA',
    cid10: 'M79.2',
    resumo: 'Gabapentinoide titulado devagar, com ajuste obrigatório pela função renal.',
    padraoOuro: {
      nota: 'Pregabalina, de farmacocinética mais previsível e titulação mais simples.',
      medicamentos: [
        { medicamentoId: 'pregabalina-75', posologia: 'Tomar 1 cápsula por via oral à noite por 7 dias; se boa tolerância, 1 cápsula de 12 em 12 horas.', quantidade: '30 cápsulas', duracao: 'Uso contínuo', observacoes: 'Ajustar pela função renal.' },
      ],
    },
    acessivel: {
      nota: 'Gabapentina ou nortriptilina, alternativas de menor custo.',
      medicamentos: [
        { medicamentoId: 'gabapentina-300', posologia: 'Tomar 1 cápsula por via oral à noite na 1ª semana; depois 1 cápsula de 12 em 12 horas.', quantidade: '60 cápsulas', duracao: 'Uso contínuo' },
        { medicamentoId: 'nortriptilina-25', posologia: 'Tomar 1 cápsula por via oral à noite, antes de deitar.', quantidade: '30 cápsulas', duracao: 'Uso contínuo', observacoes: 'Tricíclico de menor carga anticolinérgica — preferível à amitriptilina no idoso.' },
      ],
    },
    orientacoes: [
      'O efeito aparece em 2 a 4 semanas; sonolência e tontura iniciais tendem a melhorar.',
      'Não interromper abruptamente.',
    ],
    alertas: [
      'Titular devagar no idoso: sonolência e tontura aumentam risco de queda.',
      'EVITAR amitriptilina no idoso (Beers) — carga anticolinérgica alta.',
      'Ajustar gabapentinoide pela função renal, sob risco de acúmulo e sedação.',
    ],
  },
  {
    id: 'geri-pernas-inquietas',
    queixa: 'Síndrome das pernas inquietas',
    sinonimos: ['pernas inquietas', 'inquietação nas pernas à noite'],
    area: 'GERIATRIA',
    cid10: 'G25.8',
    resumo: 'Agonista dopaminérgico após corrigir ferro, que é causa reversível frequente.',
    padraoOuro: {
      nota: 'Pramipexol em dose baixa, tomado antes do horário habitual dos sintomas.',
      medicamentos: [
        { medicamentoId: 'pramipexol-025', posologia: 'Tomar 1 comprimido por via oral à noite, 2 horas antes de deitar.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    orientacoes: [
      'Evitar cafeína e álcool à noite; caminhada leve e alongamento aliviam a crise.',
      'Manter horário regular de sono.',
    ],
    alertas: [
      'Dosar ferritina ANTES: ferritina abaixo de 75 exige reposição de ferro, que muitas vezes resolve sem dopaminérgico.',
      'Vigiar sonolência diurna súbita e transtorno do controle de impulsos (jogo, compras, hipersexualidade).',
      'Antidepressivo, antipsicótico e anti-histamínico podem desencadear ou piorar o quadro.',
    ],
  },
  {
    id: 'geri-agitacao-demencia',
    queixa: 'Agitação e agressividade na demência',
    sinonimos: ['agitação', 'agressividade', 'sintoma comportamental', 'delirium'],
    area: 'GERIATRIA',
    cid10: 'F05',
    revisar: true,
    resumo: 'Antipsicótico apenas quando há risco à segurança, pelo menor tempo possível.',
    padraoOuro: {
      nota: 'Risperidona em dose baixa — a de melhor evidência para agressividade grave na demência.',
      medicamentos: [
        { medicamentoId: 'risperidona-1', posologia: 'Tomar 1/2 comprimido (0,5mg) por via oral à noite.', quantidade: '30 comprimidos', duracao: 'Reavaliar em 12 semanas', observacoes: 'Iniciar com meio comprimido e reavaliar a retirada a cada 3 meses.' },
      ],
    },
    acessivel: {
      nota: 'Quetiapina quando há parkinsonismo ou demência por corpos de Lewy associados.',
      medicamentos: [
        { medicamentoId: 'quetiapina-25', posologia: 'Tomar 1 comprimido (25mg) por via oral à noite.', quantidade: '30 comprimidos', duracao: 'Reavaliar em 12 semanas' },
      ],
    },
    orientacoes: [
      'Medidas não farmacológicas vêm primeiro: rotina, ambiente calmo, música familiar, evitar contenção.',
      'Orientar o cuidador a identificar gatilhos: dor, fome, constipação, bexiga cheia, excesso de estímulo.',
    ],
    alertas: [
      'Alerta de caixa-preta: antipsicótico aumenta mortalidade em idosos com demência.',
      'Agitação de início súbito é delirium até prova em contrário — procurar infecção, dor, retenção urinária ou medicação nova.',
      'Haloperidol é contraindicado no parkinsonismo e na demência por corpos de Lewy.',
    ],
  },
  {
    id: 'geri-hpb',
    queixa: 'Hiperplasia prostática benigna',
    sinonimos: ['próstata aumentada', 'hpb', 'jato fraco', 'noctúria'],
    area: 'GERIATRIA',
    cid10: 'N40',
    revisar: true,
    resumo: 'Alfabloqueador para alívio rápido; inibidor da 5-alfa-redutase quando a próstata é grande.',
    padraoOuro: {
      nota: 'Tansulosina alivia em dias. Somar finasterida se próstata > 30–40 g ou PSA > 1,5 (reduz retenção e cirurgia).',
      medicamentos: [
        { medicamentoId: 'tansulosina-04', posologia: 'Tomar 1 cápsula por via oral ao dia, 30 minutos após o jantar.', quantidade: '30 cápsulas', duracao: 'Uso contínuo' },
        { medicamentoId: 'finasterida-5', posologia: 'Tomar 1 comprimido por via oral uma vez ao dia.', quantidade: '30 comprimidos', duracao: 'Uso contínuo', observacoes: 'Só se próstata aumentada. Efeito em 6 meses; dobrar o PSA ao interpretar.' },
      ],
    },
    orientacoes: [
      'Tomar à noite reduz o risco de tontura pela hipotensão da primeira dose.',
      'Reduzir líquidos nas 2 horas antes de deitar diminui a noctúria.',
      'Avisar o oftalmologista antes de cirurgia de catarata — risco de síndrome da íris flácida.',
    ],
    alertas: [
      'Retenção urinária aguda, hematúria ou infecção de repetição exigem avaliação urológica.',
      'Revisar anticolinérgicos em uso — podem precipitar retenção.',
    ],
  },
  {
    id: 'geri-dpoc',
    queixa: 'DPOC / broncoespasmo',
    sinonimos: ['dpoc', 'enfisema', 'bronquite', 'chiado', 'falta de ar'],
    area: 'GERIATRIA',
    cid10: 'J44',
    revisar: true,
    resumo: 'Broncodilatador de longa ação na manutenção, resgate com salbutamol e corticoide oral só na exacerbação.',
    padraoOuro: {
      nota: 'Tiotrópio na manutenção (reduz exacerbações), salbutamol de resgate; prednisona só na exacerbação.',
      medicamentos: [
        { medicamentoId: 'tiotropio-respimat', posologia: 'Inalar 2 jatos uma vez ao dia, sempre no mesmo horário.', quantidade: '1 frasco (60 doses)', duracao: 'Uso contínuo' },
        { medicamentoId: 'salbutamol-spray', posologia: 'Inalar 2 jatos, se falta de ar ou chiado, até 4 vezes ao dia.', quantidade: '1 frasco (200 doses)', duracao: 'Em caso de sintomas', observacoes: 'Usar sempre com espaçador no idoso.' },
        { medicamentoId: 'prednisona-20', posologia: 'Tomar 1 comprimido por via oral pela manhã, após o café, por 5 dias.', quantidade: '5 comprimidos', duracao: '5 dias' },
      ],
    },
    acessivel: {
      nota: 'Ipratrópio e salbutamol, gratuitos na Farmácia Popular, quando o tiotrópio não é viável.',
      medicamentos: [
        { medicamentoId: 'ipratropio-solucao', apresentacao: 1, posologia: 'Inalar 2 jatos de 6 em 6 horas.', quantidade: '1 frasco (200 doses)', duracao: 'Uso contínuo' },
        { medicamentoId: 'salbutamol-spray', posologia: 'Inalar 2 jatos, se falta de ar ou chiado, até 4 vezes ao dia.', quantidade: '1 frasco (200 doses)', duracao: 'Em caso de sintomas', observacoes: 'Usar sempre com espaçador no idoso.' },
      ],
    },
    orientacoes: [
      'Técnica inalatória correta é o que define o resultado — demonstrar e conferir a cada consulta.',
      'Vacinação anual de influenza e antipneumocócica em dia.',
      'Cessação do tabagismo é a única medida que altera a evolução da doença.',
    ],
    alertas: [
      'Necessidade frequente do resgate indica controle inadequado — reavaliar a manutenção.',
      'Corticoide oral: vigiar glicemia, pressão e agitação no idoso.',
    ],
  },
  {
    id: 'geri-drge',
    queixa: 'Refluxo gastroesofágico',
    sinonimos: ['drge', 'azia', 'queimação', 'refluxo'],
    area: 'GERIATRIA',
    cid10: 'K21.9',
    resumo: 'Inibidor de bomba de prótons por tempo definido, com reavaliação obrigatória.',
    padraoOuro: {
      nota: 'Pantoprazol, o IBP de menor interação — importante na polifarmácia.',
      medicamentos: [
        { medicamentoId: 'pantoprazol-40', posologia: 'Tomar 1 comprimido por via oral em jejum, 30 minutos antes do café da manhã.', quantidade: '28 comprimidos', duracao: '28 dias' },
      ],
    },
    acessivel: {
      nota: 'Omeprazol pela UBS — a Farmácia Popular não cobre IBP.',
      medicamentos: [
        { medicamentoId: 'omeprazol-20', posologia: 'Tomar 1 cápsula por via oral em jejum, 30 minutos antes do café da manhã.', quantidade: '30 cápsulas', duracao: '28 dias', observacoes: 'Reduz a ativação do clopidogrel — preferir pantoprazol nesse caso.' },
      ],
    },
    orientacoes: [
      'Elevar a cabeceira da cama e não deitar nas 3 horas após comer.',
      'Reduzir volume das refeições, álcool, café, frituras e chocolate.',
      'Perder peso tem grande impacto no refluxo.',
    ],
    alertas: [
      'Reavaliar a necessidade a cada 8 semanas — uso crônico associa-se a deficiência de B12, magnésio e fratura.',
      'Disfagia, perda de peso, anemia ou vômito persistente exigem endoscopia.',
    ],
  },
  {
    id: 'geri-enxaqueca-profilaxia',
    queixa: 'Enxaqueca — profilaxia',
    sinonimos: ['enxaqueca', 'migranea', 'dor de cabeça frequente'],
    area: 'GERIATRIA',
    cid10: 'G43',
    resumo: 'Profilaxia quando há mais de 4 crises por mês, com escolha guiada pelas comorbidades.',
    padraoOuro: {
      nota: 'Propranolol, útil quando há também hipertensão ou tremor essencial.',
      medicamentos: [
        { medicamentoId: 'propranolol-40', posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.', quantidade: '60 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    acessivel: {
      nota: 'Topiramato quando o betabloqueador é contraindicado, como na asma.',
      medicamentos: [
        { medicamentoId: 'topiramato-50', posologia: 'Tomar 1 comprimido por via oral à noite.', quantidade: '30 comprimidos', duracao: 'Uso contínuo', observacoes: 'Titular devagar; parestesia e lentificação cognitiva são comuns.' },
      ],
    },
    orientacoes: [
      'Manter diário de crises para avaliar a resposta objetivamente.',
      'Identificar gatilhos: jejum prolongado, privação de sono, álcool, estresse.',
      'A profilaxia leva de 6 a 8 semanas para mostrar efeito.',
    ],
    alertas: [
      'Propranolol é contraindicado na asma e no DPOC broncoespástico.',
      'Cefaleia de início novo após os 50 anos exige investigação, incluindo arterite temporal.',
    ],
  },
  {
    id: 'geri-gota',
    queixa: 'Crise de gota',
    sinonimos: ['gota', 'ácido úrico alto', 'dor no dedão', 'podagra'],
    area: 'GERIATRIA',
    cid10: 'M10',
    revisar: true,
    resumo: 'Colchicina ou corticoide na crise aguda, poupando AINE no idoso.',
    padraoOuro: {
      nota: 'Colchicina em esquema de dose baixa, tão eficaz quanto o esquema antigo e muito melhor tolerada.',
      medicamentos: [
        { medicamentoId: 'colchicina-05', posologia: 'Tomar 2 comprimidos por via oral na primeira dose e 1 comprimido 1 hora depois; a partir do dia seguinte, 1 comprimido 1 a 2 vezes ao dia até a crise ceder.', quantidade: '20 comprimidos', duracao: 'Até resolução da crise', observacoes: 'Reduzir dose na doença renal.' },
      ],
    },
    acessivel: {
      nota: 'Prednisona em curso curto quando a colchicina é contraindicada ou mal tolerada.',
      medicamentos: [
        { medicamentoId: 'prednisona-20', posologia: 'Tomar 1 comprimido por via oral pela manhã, após o café, por 5 dias.', quantidade: '5 comprimidos', duracao: '5 dias' },
      ],
    },
    orientacoes: [
      'Repouso e gelo na articulação durante a crise.',
      'Reduzir álcool (sobretudo cerveja), carne vermelha e frutos do mar.',
      'Manter boa hidratação.',
      'Após 2 crises por ano, tofo ou cálculo: iniciar alopurinol 100mg/dia 2 semanas após a crise, com colchicina 0,5mg/dia de proteção por 3 a 6 meses (ver protocolo de gota crônica).',
    ],
    alertas: [
      'Não iniciar nem suspender alopurinol durante a crise aguda.',
      'Colchicina interage com estatina (miopatia) e claritromicina.',
      'Monoartrite aguda febril exige afastar artrite séptica antes de assumir gota.',
    ],
  },
  {
    id: 'geri-nausea',
    queixa: 'Náuseas e vômitos',
    sinonimos: ['enjoo', 'vômito', 'náusea', 'ânsia'],
    area: 'GERIATRIA',
    cid10: 'R11',
    resumo: 'Antiemético sem efeito extrapiramidal, evitando metoclopramida no idoso.',
    padraoOuro: {
      nota: 'Ondansetrona — sem efeito extrapiramidal e eficaz mesmo com vômito ativo.',
      medicamentos: [
        { medicamentoId: 'ondansetrona-4', posologia: 'Dissolver 1 comprimido na boca de 8 em 8 horas, se náusea ou vômito.', quantidade: '10 comprimidos', duracao: 'Uso conforme sintomas' },
      ],
    },
    acessivel: {
      nota: 'Bromoprida, disponível na UBS, com menos risco extrapiramidal que a metoclopramida.',
      medicamentos: [
        { medicamentoId: 'bromoprida-10', posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas, 30 minutos antes das refeições.', quantidade: '20 comprimidos', duracao: 'Uso conforme sintomas' },
      ],
    },
    orientacoes: [
      'Refeições pequenas e frequentes, evitando gorduras e odores fortes.',
      'Hidratação fracionada, em pequenos goles.',
    ],
    alertas: [
      'EVITAR metoclopramida no idoso (Beers): risco de sintomas extrapiramidais e discinesia tardia.',
      'Vômito persistente com dor abdominal ou distensão exige afastar obstrução.',
      'Ondansetrona prolonga QT e causa constipação.',
    ],
  },
  {
    id: 'geri-rinite',
    queixa: 'Rinite alérgica',
    sinonimos: ['rinite', 'espirros', 'coriza', 'nariz entupido'],
    area: 'GERIATRIA',
    cid10: 'J30.4',
    resumo: 'Corticoide nasal como base, com anti-histamínico não sedativo associado.',
    padraoOuro: {
      nota: 'Corticoide nasal é o tratamento mais eficaz da rinite persistente.',
      medicamentos: [
        { medicamentoId: 'budesonida-nasal', posologia: 'Aplicar 1 jato em cada narina, uma vez ao dia, pela manhã.', quantidade: '1 frasco', duracao: '30 dias', observacoes: 'Direcionar o jato para a parede lateral da narina evita epistaxe.' },
        { medicamentoId: 'desloratadina-5', posologia: 'Tomar 1 comprimido por via oral ao dia.', quantidade: '30 comprimidos', duracao: '30 dias' },
      ],
    },
    acessivel: {
      nota: 'Loratadina, gratuita na UBS e igualmente não sedativa.',
      medicamentos: [
        { medicamentoId: 'loratadina-10', posologia: 'Tomar 1 comprimido por via oral ao dia.', quantidade: '30 comprimidos', duracao: '30 dias' },
      ],
    },
    orientacoes: [
      'Lavagem nasal com soro fisiológico antes do corticoide melhora a distribuição.',
      'Controle ambiental: capa antiácaro, evitar tapete e cortina pesada no quarto.',
      'O corticoide nasal leva 1 a 2 semanas para efeito pleno — não é de alívio imediato.',
    ],
    alertas: [
      'Anti-histamínico de 1ª geração (dexclorfeniramina, hidroxizina) é contraindicado no idoso (Beers): sedação, confusão e queda.',
    ],
  },
  {
    id: 'geri-tremor-essencial',
    queixa: 'Tremor essencial',
    sinonimos: ['tremor', 'tremor nas mãos'],
    area: 'GERIATRIA',
    cid10: 'G25.0',
    resumo: 'Betabloqueador como primeira linha, quando o tremor limita a função.',
    padraoOuro: {
      nota: 'Propranolol — primeira linha, com benefício adicional se houver hipertensão.',
      medicamentos: [
        { medicamentoId: 'propranolol-40', posologia: 'Tomar 1/2 comprimido por via oral de 12 em 12 horas, aumentando conforme resposta.', quantidade: '60 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    orientacoes: [
      'Reduzir cafeína, que amplifica o tremor.',
      'Talheres e utensílios adaptados ajudam na autonomia.',
    ],
    alertas: [
      'Diferenciar de tremor parkinsoniano: o essencial é de ação e melhora com álcool; o parkinsoniano é de repouso.',
      'Propranolol é contraindicado na asma e na bradiarritmia.',
    ],
  },
  {
    id: 'geri-dor-cronica',
    queixa: 'Dor crônica moderada a intensa',
    sinonimos: ['dor forte', 'dor crônica', 'opioide'],
    area: 'GERIATRIA',
    cid10: 'R52.2',
    revisar: true,
    resumo: 'Opioide fraco quando o analgésico simples falhou, sempre com laxante profilático.',
    padraoOuro: {
      nota: 'Codeína associada a paracetamol, iniciando em dose baixa no idoso.',
      medicamentos: [
        { medicamentoId: 'codeina-paracetamol', posologia: 'Tomar 1 comprimido por via oral de 6 em 6 horas, se dor moderada a intensa.', quantidade: '12 comprimidos', duracao: 'Uso conforme dor' },
        { medicamentoId: 'macrogol-3350', posologia: 'Diluir 1 sachê em um copo de água e tomar uma vez ao dia, pela manhã.', quantidade: '30 sachês', duracao: 'Enquanto usar o opioide', observacoes: 'Laxante profilático é obrigatório com opioide — a constipação não desenvolve tolerância.' },
      ],
    },
    acessivel: {
      nota: 'Tramadol, com cautela: reduz limiar convulsivo e interage com antidepressivos.',
      medicamentos: [
        { medicamentoId: 'tramadol-50', posologia: 'Tomar 1 cápsula (50mg) por via oral de 8 em 8 horas, se dor.', quantidade: '15 cápsulas', duracao: '5 dias', observacoes: 'Iniciar com metade da dose no idoso.' },
      ],
    },
    orientacoes: [
      'Sonolência e tontura são comuns no início — não dirigir até se adaptar.',
      'Manter o laxante durante todo o uso do opioide.',
    ],
    alertas: [
      'Tramadol interage com ISRS e tricíclicos (síndrome serotoninérgica) e reduz o limiar convulsivo.',
      'Reavaliar periodicamente se o opioide ainda é necessário.',
    ],
  },
  {
    id: 'geri-prevencao-cv',
    queixa: 'Prevenção cardiovascular secundária',
    sinonimos: ['pós-infarto', 'pós-avc', 'antiagregante', 'prevenção secundária'],
    area: 'GERIATRIA',
    cid10: 'I25.2',
    resumo: 'Antiagregante e estatina de alta potência após evento aterosclerótico.',
    padraoOuro: {
      nota: 'AAS + estatina de alta potência — a base da prevenção secundária.',
      medicamentos: [
        { medicamentoId: 'aas-100', posologia: 'Tomar 1 comprimido por via oral ao dia, após o almoço.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
        { medicamentoId: 'atorvastatina-20', posologia: 'Tomar 1 comprimido por via oral à noite.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    acessivel: {
      nota: 'AAS pela UBS e sinvastatina pela Farmácia Popular.',
      medicamentos: [
        { medicamentoId: 'aas-100', posologia: 'Tomar 1 comprimido por via oral ao dia, após o almoço.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
        { medicamentoId: 'sinvastatina-40', posologia: 'Tomar 1 comprimido por via oral à noite.', quantidade: '30 comprimidos', duracao: 'Uso contínuo' },
      ],
    },
    orientacoes: [
      'Cessação do tabagismo é a medida isolada de maior impacto após um evento.',
      'Atividade física supervisionada e controle de pressão e glicemia completam o tratamento.',
    ],
    alertas: [
      'AAS em prevenção PRIMÁRIA no idoso: o risco de sangramento costuma superar o benefício — reavaliar a indicação.',
      'Se em uso de clopidogrel, preferir pantoprazol ao omeprazol quando houver necessidade de IBP.',
    ],
  },
];
