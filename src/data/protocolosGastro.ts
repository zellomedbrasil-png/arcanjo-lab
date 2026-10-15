// src/data/protocolosGastro.ts
// Protocolos de Gastroenterologia (ambulatório). Tipos e convenções em
// src/data/protocolos.ts. Todos marcados `revisar` até validação do médico.
//
// `apresentacao` é o índice da dose em dosesDe(): 0 = padrão do catálogo,
// 1 em diante = ordem de `apresentacoes` no catálogo.

import type { ProtocoloQueixa } from './protocolos';

export const PROTOCOLOS_GASTRO: ProtocoloQueixa[] = [
  {
    id: 'gastro-drge',
    queixa: 'Refluxo / DRGE',
    sinonimos: ['refluxo', 'azia', 'queimação', 'drge', 'pirose', 'esofagite'],
    area: 'GASTRO',
    cid10: 'K21',
    revisar: true,
    resumo: 'IBP em dose plena por 8 semanas, com alginato para escape pós-prandial.',
    padraoOuro: {
      nota: 'Pantoprazol em jejum por 8 semanas; alginato sob demanda.',
      medicamentos: [
        { medicamentoId: 'pantoprazol-40', posologia: 'Tomar 1 comprimido por via oral em jejum, 30 minutos antes do café da manhã.', quantidade: '56 comprimidos', duracao: '8 semanas' },
        { medicamentoId: 'alginato-antiacido', posologia: 'Tomar 10ml por via oral após as refeições e ao deitar, se azia.', quantidade: '1 frasco de 150ml', duracao: 'Em caso de sintomas' },
      ],
    },
    acessivel: {
      nota: 'Omeprazol na UBS.',
      medicamentos: [
        { medicamentoId: 'omeprazol-20', posologia: 'Tomar 1 cápsula por via oral em jejum, 30 minutos antes do café da manhã.', quantidade: '56 cápsulas', duracao: '8 semanas' },
      ],
    },
    orientacoes: [
      'Elevar a cabeceira da cama 15 a 20 cm.',
      'Não deitar nas 3 horas após o jantar.',
      'Perder peso se houver sobrepeso; reduzir álcool e tabaco.',
    ],
    alertas: [
      'Disfagia, emagrecimento, anemia, vômitos persistentes ou início após 60 anos: endoscopia antes de tratar.',
      'Sem resposta em 8 semanas: dobrar o IBP (12/12h) ou trocar por vonoprazana e indicar endoscopia.',
    ],
  },
  {
    id: 'gastro-dispepsia',
    queixa: 'Dispepsia funcional',
    sinonimos: ['dispepsia', 'má digestão', 'empachamento', 'dor no estômago', 'gastrite'],
    area: 'GASTRO',
    cid10: 'K30',
    revisar: true,
    resumo: 'Testar e tratar H. pylori; IBP por 4 semanas para dor epigástrica.',
    padraoOuro: {
      nota: 'IBP em dose padrão por 4 semanas; procinético se plenitude pós-prandial predominar.',
      medicamentos: [
        { medicamentoId: 'omeprazol-20', posologia: 'Tomar 1 cápsula por via oral em jejum, 30 minutos antes do café da manhã.', quantidade: '28 cápsulas', duracao: '28 dias' },
        { medicamentoId: 'domperidona-10', posologia: 'Tomar 1 comprimido por via oral 15 a 30 minutos antes do almoço e do jantar.', quantidade: '28 comprimidos', duracao: '14 dias', observacoes: 'Só se plenitude/saciedade precoce. Prolonga QT.' },
      ],
    },
    orientacoes: [
      'Refeições menores e mais frequentes; evitar gordura e grandes volumes à noite.',
      'Pesquisar H. pylori (antígeno fecal ou teste respiratório) e tratar se positivo.',
    ],
    alertas: ['Sinais de alarme (perda de peso, anemia, disfagia, vômitos, > 60 anos): endoscopia.'],
  },
  {
    id: 'gastro-hpylori',
    queixa: 'H. pylori — erradicação (1ª linha)',
    sinonimos: ['h pylori', 'helicobacter', 'hpylori', 'erradicação'],
    area: 'GASTRO',
    cid10: 'B96.8',
    revisar: true,
    resumo: 'Quádrupla com bismuto por 14 dias, independente da resistência à claritromicina.',
    padraoOuro: {
      nota: 'Quádrupla com bismuto (Maastricht VI): IBP + bismuto + tetraciclina + metronidazol, 14 dias.',
      medicamentos: [
        { medicamentoId: 'omeprazol-20', apresentacao: 1, posologia: 'Tomar 1 cápsula por via oral de 12 em 12 horas, 30 minutos antes do café e do jantar.', quantidade: '28 cápsulas', duracao: '14 dias' },
        { medicamentoId: 'bismuto-120', posologia: 'Tomar 2 comprimidos por via oral de 12 em 12 horas, 30 minutos antes do café e do jantar.', quantidade: '56 comprimidos', duracao: '14 dias' },
        { medicamentoId: 'tetraciclina-500', posologia: 'Tomar 1 cápsula por via oral de 6 em 6 horas, 1 hora antes ou 2 horas após as refeições.', quantidade: '56 cápsulas', duracao: '14 dias' },
        { medicamentoId: 'metronidazol-400', posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas, junto às refeições.', quantidade: '42 comprimidos', duracao: '14 dias', observacoes: 'Sem álcool durante e por 3 dias após.' },
      ],
    },
    acessivel: {
      nota: 'Tripla clássica (IBP + amoxicilina + claritromicina) por 14 dias, se a quádrupla não for viável.',
      medicamentos: [
        { medicamentoId: 'omeprazol-20', posologia: 'Tomar 1 cápsula por via oral de 12 em 12 horas, 30 minutos antes do café e do jantar.', quantidade: '28 cápsulas', duracao: '14 dias' },
        { medicamentoId: 'amoxicilina-500', posologia: 'Tomar 2 cápsulas (1g) por via oral de 12 em 12 horas.', quantidade: '56 cápsulas', duracao: '14 dias' },
        { medicamentoId: 'claritromicina-500', posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.', quantidade: '28 comprimidos', duracao: '14 dias' },
      ],
    },
    orientacoes: [
      'Tomar todos os remédios até o fim, mesmo sem sintomas.',
      'Bismuto escurece fezes e língua; é esperado.',
      'Controle de cura 4 semanas após o fim, com 2 semanas sem IBP.',
    ],
    alertas: ['Alergia à penicilina: a quádrupla com bismuto já não usa amoxicilina.'],
  },
  {
    id: 'gastro-hpylori-resgate',
    queixa: 'H. pylori — resgate (falha prévia)',
    sinonimos: ['h pylori resgate', 'falha erradicação', 'helicobacter resistente'],
    area: 'GASTRO',
    cid10: 'B96.8',
    revisar: true,
    resumo: 'Após falha da 1ª linha: esquema com levofloxacino por 14 dias.',
    padraoOuro: {
      nota: 'IBP + amoxicilina + levofloxacino, 14 dias.',
      medicamentos: [
        { medicamentoId: 'omeprazol-20', apresentacao: 1, posologia: 'Tomar 1 cápsula por via oral de 12 em 12 horas, 30 minutos antes do café e do jantar.', quantidade: '28 cápsulas', duracao: '14 dias' },
        { medicamentoId: 'amoxicilina-500', posologia: 'Tomar 2 cápsulas (1g) por via oral de 12 em 12 horas.', quantidade: '56 cápsulas', duracao: '14 dias' },
        { medicamentoId: 'levofloxacino-500', posologia: 'Tomar 1 comprimido por via oral uma vez ao dia.', quantidade: '14 comprimidos', duracao: '14 dias' },
      ],
    },
    orientacoes: ['Controle de cura 4 semanas após o fim, com 2 semanas sem IBP.'],
    alertas: ['Levofloxacino: risco de tendinite e QT longo, maior no idoso.'],
  },
  {
    id: 'gastro-sii-c',
    queixa: 'Intestino irritável com constipação (SII-C)',
    sinonimos: ['sii', 'intestino irritável', 'cólon irritável', 'intestino preso com dor'],
    area: 'GASTRO',
    cid10: 'K58.1',
    revisar: true,
    resumo: 'Fibra solúvel + antiespasmódico para dor; macrogol se a constipação persistir.',
    padraoOuro: {
      nota: 'Psyllium e pinavério por 30 dias, reavaliar.',
      medicamentos: [
        { medicamentoId: 'psyllium', posologia: 'Diluir 1 sachê em 240ml de água e tomar uma vez ao dia.', quantidade: '30 sachês', duracao: '30 dias' },
        { medicamentoId: 'pinaverio-100', posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas, durante a refeição.', quantidade: '60 comprimidos', duracao: '30 dias' },
      ],
    },
    orientacoes: [
      'Aumentar água para 2 litros/dia e atividade física.',
      'Teste de dieta pobre em FODMAP por 4 a 6 semanas se distensão importante.',
    ],
    alertas: ['Sangue nas fezes, emagrecimento, anemia ou início após 50 anos: colonoscopia.'],
  },
  {
    id: 'gastro-sii-d',
    queixa: 'Intestino irritável com diarreia (SII-D)',
    sinonimos: ['sii diarreia', 'intestino solto', 'diarreia funcional'],
    area: 'GASTRO',
    cid10: 'K58.0',
    revisar: true,
    resumo: 'Modulador da motilidade + loperamida de resgate.',
    padraoOuro: {
      nota: 'Trimebutina contínua por 30 dias; loperamida sob demanda.',
      medicamentos: [
        { medicamentoId: 'trimebutina-200', posologia: 'Tomar 1 cápsula por via oral de 8 em 8 horas, antes das refeições.', quantidade: '90 cápsulas', duracao: '30 dias' },
        { medicamentoId: 'loperamida-2', posologia: 'Tomar 1 cápsula por via oral após evacuação líquida, no máximo 4 ao dia.', quantidade: '12 cápsulas', duracao: 'Em caso de diarreia' },
      ],
    },
    orientacoes: ['Dieta pobre em FODMAP; reduzir café, álcool e adoçantes (sorbitol).'],
    alertas: ['Diarreia noturna, sangue, febre ou perda de peso: investigar causa orgânica (DII, celíaca).'],
  },
  {
    id: 'gastro-constipacao',
    queixa: 'Constipação crônica',
    sinonimos: ['intestino preso', 'constipação', 'prisão de ventre'],
    area: 'GASTRO',
    cid10: 'K59.0',
    revisar: true,
    resumo: 'Macrogol diário; estimulante só de resgate.',
    padraoOuro: {
      nota: 'Macrogol 1 sachê/dia, ajustar pela consistência; bisacodil de resgate após 3 dias sem evacuar.',
      medicamentos: [
        { medicamentoId: 'macrogol-3350', posologia: 'Diluir 1 sachê em um copo de água (200ml) e tomar uma vez ao dia, pela manhã.', quantidade: '30 sachês', duracao: '30 dias' },
        { medicamentoId: 'bisacodil-5', posologia: 'Tomar 2 drágeas por via oral à noite, se 3 dias sem evacuar.', quantidade: '10 drágeas', duracao: 'Em caso de constipação' },
      ],
    },
    acessivel: {
      nota: 'Lactulose (UBS) + fibra.',
      medicamentos: [
        { medicamentoId: 'lactulose', posologia: 'Tomar 15ml por via oral uma vez ao dia, pela manhã.', quantidade: '1 frasco de 120ml', duracao: '30 dias' },
      ],
    },
    orientacoes: ['Ir ao banheiro após o café da manhã (reflexo gastrocólico), com os pés apoiados num banquinho.', 'Fibra e 2 litros de água ao dia.'],
    alertas: ['Mudança recente do hábito, sangue ou anemia após 45 anos: colonoscopia.'],
  },
  {
    id: 'gastro-diarreia-aguda',
    queixa: 'Diarreia aguda',
    sinonimos: ['diarreia', 'gastroenterite', 'virose intestinal', 'intestino solto'],
    area: 'GASTRO',
    cid10: 'A09',
    revisar: true,
    resumo: 'Hidratação oral, antissecretor e probiótico; sem antibiótico na maioria.',
    padraoOuro: {
      nota: 'Racecadotrila + S. boulardii, com soro de reidratação oral.',
      medicamentos: [
        { medicamentoId: 'racecadotrila-100', posologia: 'Tomar 1 cápsula por via oral de 8 em 8 horas, até a diarreia parar.', quantidade: '15 cápsulas', duracao: '5 dias' },
        { medicamentoId: 'saccharomyces-200', posologia: 'Tomar 1 cápsula por via oral de 12 em 12 horas.', quantidade: '10 cápsulas', duracao: '5 dias' },
      ],
    },
    acessivel: {
      nota: 'Loperamida de resgate (só sem febre e sem sangue).',
      medicamentos: [
        { medicamentoId: 'loperamida-2', posologia: 'Tomar 1 cápsula por via oral após evacuação líquida, no máximo 4 ao dia.', quantidade: '12 cápsulas', duracao: 'Em caso de diarreia' },
      ],
    },
    orientacoes: ['Soro de reidratação oral (UBS/farmácia): 1 copo após cada evacuação.', 'Alimentação leve, sem jejum.'],
    alertas: ['Febre alta, sangue nas fezes, desidratação ou idoso frágil: avaliar presencialmente; não usar loperamida.'],
  },
  {
    id: 'gastro-giardiase',
    queixa: 'Giardíase / Amebíase',
    sinonimos: ['giardia', 'giardíase', 'ameba', 'amebíase', 'verme'],
    area: 'GASTRO',
    cid10: 'A07.1',
    revisar: true,
    resumo: 'Nitroimidazólico em dose única.',
    padraoOuro: {
      nota: 'Secnidazol 2g em dose única.',
      medicamentos: [
        { medicamentoId: 'secnidazol-1g', posologia: 'Tomar 2 comprimidos por via oral em dose única, após uma refeição.', quantidade: '2 comprimidos', duracao: 'Dose única' },
      ],
    },
    acessivel: {
      nota: 'Metronidazol (UBS) por 5 dias.',
      medicamentos: [
        { medicamentoId: 'metronidazol-400', posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas, junto às refeições.', quantidade: '15 comprimidos', duracao: '5 dias' },
      ],
    },
    orientacoes: ['Sem álcool durante e por 3 dias após.', 'Tratar contactantes sintomáticos; lavar bem alimentos crus.'],
  },
  {
    id: 'gastro-parasitose',
    queixa: 'Parasitose intestinal (helmintos)',
    sinonimos: ['verminose', 'lombriga', 'oxiúro', 'parasita', 'estrongiloides'],
    area: 'GASTRO',
    cid10: 'B82.0',
    revisar: true,
    resumo: 'Albendazol em dose única, repetido em 14 dias; ivermectina se estrongiloidíase.',
    padraoOuro: {
      nota: 'Albendazol 400mg dose única, repetir em 14 dias.',
      medicamentos: [
        { medicamentoId: 'albendazol-400', posologia: 'Tomar 1 comprimido por via oral em dose única, junto a uma refeição; repetir em 14 dias.', quantidade: '2 comprimidos', duracao: '14 dias' },
      ],
    },
    orientacoes: ['Higiene das mãos, unhas curtas, lavar roupa de cama em água quente (oxiúros).'],
    alertas: ['Antes de corticoide ou imunossupressor, tratar estrongiloidíase com ivermectina.'],
  },
  {
    id: 'gastro-hemorroida',
    queixa: 'Doença hemorroidária',
    sinonimos: ['hemorroida', 'hemorróida', 'sangramento anal', 'dor anal'],
    area: 'GASTRO',
    cid10: 'K64',
    revisar: true,
    resumo: 'Fibra para amolecer as fezes é o tratamento central; analgesia na crise.',
    padraoOuro: {
      nota: 'Psyllium contínuo + dipirona se dor.',
      medicamentos: [
        { medicamentoId: 'psyllium', posologia: 'Diluir 1 sachê em 240ml de água e tomar uma vez ao dia.', quantidade: '30 sachês', duracao: '30 dias' },
        { medicamentoId: 'dipirona-500', posologia: 'Tomar 1 comprimido por via oral de 6 em 6 horas, se dor.', quantidade: '20 comprimidos', duracao: 'Em caso de dor' },
      ],
    },
    orientacoes: ['Banho de assento morno 2 a 3 vezes ao dia na crise.', 'Não ficar muito tempo sentado no vaso; evitar esforço evacuatório.'],
    alertas: ['Sangramento retal após 45 anos ou com anemia: colonoscopia — não atribuir à hemorroida sem investigar.'],
  },
  {
    id: 'gastro-nausea',
    queixa: 'Náuseas e vômitos',
    sinonimos: ['náusea', 'enjoo', 'vômito', 'vomito'],
    area: 'GASTRO',
    cid10: 'R11',
    revisar: true,
    resumo: 'Ondansetrona sublingual sob demanda.',
    padraoOuro: {
      nota: 'Ondansetrona 8mg se necessário.',
      medicamentos: [
        { medicamentoId: 'ondansetrona-4', apresentacao: 1, posologia: 'Dissolver 1 comprimido na boca de 8 em 8 horas, se náuseas ou vômitos.', quantidade: '10 comprimidos', duracao: 'Em caso de sintomas' },
      ],
    },
    acessivel: {
      nota: 'Bromoprida pelo menor tempo possível.',
      medicamentos: [
        { medicamentoId: 'bromoprida-10', posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas, se náuseas.', quantidade: '15 comprimidos', duracao: '5 dias' },
      ],
    },
    orientacoes: ['Fracionar a dieta e hidratar em pequenos goles.'],
    alertas: ['Vômitos persistentes, dor abdominal intensa ou desidratação: avaliação presencial.'],
  },
  {
    id: 'gastro-rcu-leve',
    queixa: 'Retocolite ulcerativa leve a moderada',
    sinonimos: ['retocolite', 'rcu', 'colite ulcerativa', 'proctite', 'dii'],
    area: 'GASTRO',
    cid10: 'K51',
    revisar: true,
    resumo: 'Mesalazina oral + retal: a combinação é superior a cada uma isolada.',
    padraoOuro: {
      nota: 'Mesalazina 2,4 g/dia oral + supositório 1g à noite (CEAF via LME).',
      medicamentos: [
        { medicamentoId: 'mesalazina-800', posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas.', quantidade: '90 comprimidos', duracao: 'Uso contínuo' },
        { medicamentoId: 'mesalazina-supositorio-1g', posologia: 'Aplicar 1 supositório por via retal à noite, ao deitar.', quantidade: '30 supositórios', duracao: '30 dias' },
      ],
    },
    orientacoes: ['Preencher LME/APAC para retirada gratuita na farmácia estadual.', 'Não suspender na melhora: a mesalazina mantém a remissão.'],
    alertas: ['Mais de 6 evacuações com sangue, febre ou taquicardia: colite grave — internação.', 'Dosar creatinina e urina tipo 1 a cada 6–12 meses (nefrite intersticial).'],
  },
  {
    id: 'gastro-colica-biliar',
    queixa: 'Cólica biliar / Colelitíase sintomática',
    sinonimos: ['pedra na vesícula', 'colelitíase', 'cólica biliar', 'vesícula'],
    area: 'GASTRO',
    cid10: 'K80.2',
    revisar: true,
    resumo: 'Analgesia na crise e encaminhamento para colecistectomia.',
    padraoOuro: {
      nota: 'Butilescopolamina + dipirona sob demanda até a cirurgia.',
      medicamentos: [
        { medicamentoId: 'escopolamina-dipirona', posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas, se cólica.', quantidade: '20 comprimidos', duracao: 'Em caso de dor' },
      ],
    },
    orientacoes: ['Evitar refeições gordurosas.', 'Encaminhar para colecistectomia eletiva.'],
    alertas: ['Febre, icterícia ou dor > 6 horas: colecistite ou coledocolitíase — emergência.'],
  },
  {
    id: 'gastro-distensao',
    queixa: 'Gases e distensão abdominal',
    sinonimos: ['gases', 'flatulência', 'distensão', 'estufamento', 'barriga inchada'],
    area: 'GASTRO',
    cid10: 'R14',
    revisar: true,
    resumo: 'Antiespasmódico com simeticona na crise; investigar intolerâncias.',
    padraoOuro: {
      nota: 'Alverina + simeticona por 10 dias.',
      medicamentos: [
        { medicamentoId: 'alverina-simeticona', posologia: 'Tomar 1 cápsula por via oral de 8 em 8 horas, antes das refeições.', quantidade: '30 cápsulas', duracao: '10 dias' },
      ],
    },
    acessivel: {
      nota: 'Simeticona gotas.',
      medicamentos: [
        { medicamentoId: 'simeticona-75', posologia: 'Tomar 30 gotas por via oral de 8 em 8 horas, se distensão.', quantidade: '1 frasco', duracao: 'Em caso de sintomas' },
      ],
    },
    orientacoes: ['Comer devagar, evitar refrigerante, chiclete e adoçantes (sorbitol).', 'Considerar intolerância à lactose e SIBO.'],
  },
  {
    id: 'gastro-insuf-pancreatica',
    queixa: 'Insuficiência pancreática exócrina',
    sinonimos: ['esteatorreia', 'pancreatite crônica', 'fezes gordurosas', 'insuficiência pancreática'],
    area: 'GASTRO',
    cid10: 'K86.8',
    revisar: true,
    resumo: 'Enzima pancreática nas refeições; IBP melhora a ação da enzima.',
    padraoOuro: {
      nota: 'Pancreatina 50.000 U por refeição principal + omeprazol.',
      medicamentos: [
        { medicamentoId: 'pancreatina-25000', posologia: 'Tomar 2 cápsulas por via oral no início de cada refeição principal e 1 cápsula com cada lanche.', quantidade: '200 cápsulas', duracao: '30 dias' },
        { medicamentoId: 'omeprazol-20', posologia: 'Tomar 1 cápsula por via oral em jejum, 30 minutos antes do café da manhã.', quantidade: '30 cápsulas', duracao: '30 dias' },
      ],
    },
    orientacoes: ['Não mastigar as cápsulas.', 'Repor vitaminas lipossolúveis (A, D, E, K) se deficiência.'],
  },
  {
    id: 'gastro-encefalopatia',
    queixa: 'Encefalopatia hepática (prevenção)',
    sinonimos: ['encefalopatia', 'cirrose', 'confusão no cirrótico', 'amônia'],
    area: 'GASTRO',
    cid10: 'K72.9',
    revisar: true,
    resumo: 'Lactulose para 2 a 3 evacuações pastosas/dia; rifaximina após recorrência.',
    padraoOuro: {
      nota: 'Lactulose titulada + rifaximina 550mg 12/12h.',
      medicamentos: [
        { medicamentoId: 'lactulose', posologia: 'Tomar 20ml por via oral de 8 em 8 horas, ajustando para 2 a 3 evacuações pastosas por dia.', quantidade: '3 frascos de 120ml', duracao: '30 dias' },
        { medicamentoId: 'rifaximina-550', posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.', quantidade: '60 comprimidos', duracao: '30 dias' },
      ],
    },
    acessivel: {
      nota: 'Lactulose isolada (UBS).',
      medicamentos: [
        { medicamentoId: 'lactulose', posologia: 'Tomar 20ml por via oral de 8 em 8 horas, ajustando para 2 a 3 evacuações pastosas por dia.', quantidade: '3 frascos de 120ml', duracao: '30 dias' },
      ],
    },
    orientacoes: ['Não restringir proteína; fazer lanche noturno.', 'Evitar benzodiazepínicos e sedativos.'],
    alertas: ['Confusão aguda no cirrótico: buscar desencadeante (infecção, sangramento, constipação, distúrbio eletrolítico).'],
  },
  {
    id: 'gastro-ascite',
    queixa: 'Ascite (cirrose)',
    sinonimos: ['ascite', 'barriga d água', 'cirrose com ascite'],
    area: 'GASTRO',
    cid10: 'R18',
    revisar: true,
    resumo: 'Espironolactona + furosemida na proporção 100:40, com restrição de sódio.',
    padraoOuro: {
      nota: 'Espironolactona 100mg + furosemida 40mg pela manhã.',
      medicamentos: [
        { medicamentoId: 'espironolactona-25', apresentacao: 2, posologia: 'Tomar 1 comprimido por via oral pela manhã.', quantidade: '30 comprimidos', duracao: '30 dias' },
        { medicamentoId: 'furosemida-40', posologia: 'Tomar 1 comprimido por via oral pela manhã.', quantidade: '30 comprimidos', duracao: '30 dias' },
      ],
    },
    orientacoes: ['Sal até 2 g de sódio/dia (≈ 5 g de sal).', 'Pesar-se diariamente: meta de perda de 0,5 kg/dia sem edema.'],
    alertas: ['Dosar sódio, potássio e creatinina em 1 semana.', 'Febre ou dor abdominal: paracentese para afastar peritonite bacteriana.'],
  },
];
