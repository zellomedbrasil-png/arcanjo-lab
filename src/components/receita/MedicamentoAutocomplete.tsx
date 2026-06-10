import { useState, useEffect, useRef, useMemo } from 'react';
import { Pill, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { TipoRecomendado } from '../../store/useReceitaStore';

interface MedicamentoSugestao {
  nome: string;
  principioAtivo: string;
  formaFarmaceutica: string;
  uso: string;
  posologia: string;
  quantidade: string;
  duracao: string;
  tipoRecomendado: TipoRecomendado;
  indicacao: string;
  observacoes?: string;
  motivoEspecial?: string;
}

const DATABASE_MEDICAMENTOS: MedicamentoSugestao[] = [
  {
    nome: 'Dipirona Monoidratada 500mg',
    principioAtivo: 'Dipirona Monoidratada 500mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 6 em 6 horas se dor ou febre.',
    quantidade: '10 comprimidos',
    duracao: 'Em caso de dor',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Dor e febre',
  },
  {
    nome: 'Paracetamol 750mg',
    principioAtivo: 'Paracetamol 750mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas em caso de dor ou febre (máximo 4 comprimidos/dia).',
    quantidade: '12 comprimidos',
    duracao: 'Em caso de dor',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Dor e febre',
  },
  {
    nome: 'Losartana Potássica 50mg',
    principioAtivo: 'Losartana Potássica 50mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral uma vez ao dia, preferencialmente pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Hipertensão Arterial (HAS)',
  },
  {
    nome: 'Omeprazol 20mg',
    principioAtivo: 'Omeprazol 20mg',
    formaFarmaceutica: 'Cápsulas gastrorresistentes',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral em jejum, 30 minutos antes do café da manhã.',
    quantidade: '30 cápsulas',
    duracao: '30 dias',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Refluxo / Gastrite (DRGE)',
  },
  {
    nome: 'Metformina 850mg',
    principioAtivo: 'Metformina Cloridrato 850mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral junto com o café da manhã ou jantar.',
    quantidade: '60 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Diabetes Mellitus Tipo 2',
  },
  {
    nome: 'Sinvastatina 20mg',
    principioAtivo: 'Sinvastatina 20mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, antes de deitar.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Colesterol alto / Dislipidemia',
  },
  {
    nome: 'Rivaroxabana 20mg',
    principioAtivo: 'Rivaroxabana 20mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia, com uma refeição.',
    quantidade: '28 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Anticoagulante / Trombose',
  },
  {
    nome: 'Clonazepam 2mg',
    principioAtivo: 'Clonazepam 2mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1/2 comprimido (1mg) por via oral à noite, antes de dormir.',
    quantidade: '30 comprimidos',
    duracao: '60 dias',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Ansiedade / Insônia (B1)',
  },
  {
    nome: 'Diazepam 10mg',
    principioAtivo: 'Diazepam 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, antes de deitar.',
    quantidade: '30 comprimidos',
    duracao: '30 dias',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Ansiedade / Espasmos (B1)',
  },
  {
    nome: 'Sertralina 50mg',
    principioAtivo: 'Sertralina Cloridrato 50mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã, com ou sem alimentos.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Depressão / Ansiedade / TOC (C1)',
  },
  {
    nome: 'AAS 100mg (Ácido Acetilsalicílico)',
    principioAtivo: 'Ácido Acetilsalicílico 100mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia, após o almoço.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Cardioproteção / Antiagregante',
  },
  {
    nome: 'Atorvastatina 20mg',
    principioAtivo: 'Atorvastatina Cálcica 20mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia, a qualquer hora do dia.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Colesterol alto / Dislipidemia',
  },
  {
    nome: 'Amoxicilina 500mg',
    principioAtivo: 'Amoxicilina 500mg',
    formaFarmaceutica: 'Cápsulas',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral de 8 em 8 horas.',
    quantidade: '21 cápsulas',
    duracao: '7 dias',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Antibiótico / Infecções bacterianas (2 vias — RDC 471/2021)',
    motivoEspecial: 'Antimicrobiano (RDC 471/2021 ANVISA) — exige receita em 2 vias, com retenção da 1ª via na farmácia.',
  },
  {
    nome: 'Zolpidem 10mg',
    principioAtivo: 'Hemitartarato de Zolpidem 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, imediatamente antes de deitar.',
    quantidade: '30 comprimidos',
    duracao: '30 dias',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Insônia / Sono (B1)',
  },
  {
    nome: 'Escitalopram 10mg',
    principioAtivo: 'Oxalato de Escitalopram 10mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Depressão / Ansiedade (C1)',
  },
  {
    nome: 'Pregabalina 75mg',
    principioAtivo: 'Pregabalina 75mg',
    formaFarmaceutica: 'Cápsulas',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral à noite, antes de deitar.',
    quantidade: '30 cápsulas',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Dor neuropática / Ansiedade (C1)',
  },
  {
    nome: 'Ibuprofeno 600mg',
    principioAtivo: 'Ibuprofeno 600mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas após as refeições.',
    quantidade: '10 comprimidos',
    duracao: '5 dias',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Dor / Anti-inflamatório',
  },
  {
    nome: 'Rosuvastatina 10mg',
    principioAtivo: 'Rosuvastatina Cálcica 10mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Colesterol alto / Dislipidemia',
  },
  {
    nome: 'Fluoxetina 20mg',
    principioAtivo: 'Cloridrato de Fluoxetina 20mg',
    formaFarmaceutica: 'Cápsulas',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral pela manhã.',
    quantidade: '30 cápsulas',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Depressão / Ansiedade / Bulimia (C1)',
  },
  {
    nome: 'Pantoprazol 40mg',
    principioAtivo: 'Pantoprazol Magnésico 40mg',
    formaFarmaceutica: 'Comprimidos gastrorresistentes',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã, em jejum.',
    quantidade: '28 comprimidos',
    duracao: '28 dias',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Refluxo / Gastrite (DRGE)',
  },
  {
    nome: 'Alprazolam 0,5mg',
    principioAtivo: 'Alprazolam 0,5mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, antes de deitar.',
    quantidade: '30 comprimidos',
    duracao: '30 dias',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Ansiedade / Pânico (B1)',
  },
  {
    nome: 'Furosemida 40mg',
    principioAtivo: 'Furosemida 40mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã.',
    quantidade: '20 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Diurético / Retenção de Líquidos',
  },
  {
    nome: 'Loratadina 10mg',
    principioAtivo: 'Loratadina 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia.',
    quantidade: '10 comprimidos',
    duracao: '10 dias',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Antialérgico / Rinite',
  },
  {
    nome: 'Carvedilol 6,25mg',
    principioAtivo: 'Carvedilol 6,25mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas, junto com alimentos.',
    quantidade: '60 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Hipertensão / Insuficiência Cardíaca',
  },
  {
    nome: 'Quetiapina 25mg',
    principioAtivo: 'Hemifumarato de Quetiapina 25mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, antes de deitar.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Esquizofrenia / Sono / Bipolaridade (C1)',
  },
  {
    nome: 'Levotiroxina Sódica 50mcg',
    principioAtivo: 'Levotiroxina Sódica 50mcg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral em jejum, 30 a 60 minutos antes do café da manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Hipotireoidismo / Tireoide',
  },
  {
    nome: 'Enalapril Maleato 20mg',
    principioAtivo: 'Enalapril Maleato 20mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.',
    quantidade: '60 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Hipertensão / Insuficiência Cardíaca',
  },
  {
    nome: 'Captopril 25mg',
    principioAtivo: 'Captopril 25mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas.',
    quantidade: '90 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Hipertensão / Crise Hipertensiva',
  },
  {
    nome: 'Atenolol 50mg',
    principioAtivo: 'Atenolol 50mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Hipertensão / Arritmia / Angina',
  },
  {
    nome: 'Propranolol Cloridrato 40mg',
    principioAtivo: 'Propranolol Cloridrato 40mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.',
    quantidade: '60 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Hipertensão / Profilaxia de Enxaqueca / Temores',
  },
  {
    nome: 'Espironolactona 25mg',
    principioAtivo: 'Espironolactona 25mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Hipertensão / Insuficiência Cardíaca / Diurético',
  },
  {
    nome: 'Clopidogrel 75mg',
    principioAtivo: 'Bisulfato de Clopidogrel 75mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Antiagregante / Prevenção AVC/Infarto',
  },
  {
    nome: 'Marevan 5mg (Warfarina)',
    principioAtivo: 'Warfarina Sódica 5mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar conforme esquema de controle de RNI, de preferência no final da tarde.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Anticoagulante / Trombose / Fibrilação Atrial',
  },
  {
    nome: 'Eliquis 5mg (Apixabana)',
    principioAtivo: 'Apixabana 5mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.',
    quantidade: '60 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Anticoagulante / Prevenção de AVC / Fibrilação Atrial',
  },
  {
    nome: 'Forxiga 10mg (Dapagliflozina)',
    principioAtivo: 'Dapagliflozina 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Diabetes Mellitus / Insuficiência Cardíaca',
  },
  {
    nome: 'Jardiance 25mg (Empagliflozina)',
    principioAtivo: 'Empagliflozina 25mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Diabetes Mellitus / Insuficiência Cardíaca',
  },
  {
    nome: 'Gliclazida MR 60mg',
    principioAtivo: 'Gliclazida MR 60mg',
    formaFarmaceutica: 'Comprimidos de liberação modificada',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral no café da manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Diabetes Mellitus Tipo 2',
  },
  {
    nome: 'Glimepirida 2mg',
    principioAtivo: 'Glimepirida 2mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral junto ao café da manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Diabetes Mellitus Tipo 2',
  },
  {
    nome: 'Januvia 100mg (Sitagliptina)',
    principioAtivo: 'Fosfato de Sitagliptina 100mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Diabetes Mellitus Tipo 2',
  },
  {
    nome: 'Trayenta 5mg (Linagliptina)',
    principioAtivo: 'Linagliptina 5mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Diabetes Mellitus Tipo 2',
  },
  {
    nome: 'Esomeprazol 40mg',
    principioAtivo: 'Esomeprazol Magnésico 40mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral em jejum pela manhã.',
    quantidade: '28 comprimidos',
    duracao: '28 dias',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Refluxo / Gastrite / Protetor Gástrico (DRGE)',
  },
  {
    nome: 'Ondansetrona 4mg',
    principioAtivo: 'Cloridrato de Ondansetrona 4mg',
    formaFarmaceutica: 'Comprimidos orodispersíveis',
    uso: 'Uso oral',
    posologia: 'Dissolver 1 comprimido na boca de 8 em 8 horas em caso de náusea.',
    quantidade: '10 comprimidos',
    duracao: 'Em caso de náusea',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Náuseas e Vômitos / Antiemético',
  },
  {
    nome: 'Bromoprida 10mg',
    principioAtivo: 'Bromoprida 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas antes das refeições em caso de náuseas.',
    quantidade: '20 comprimidos',
    duracao: 'Em caso de sintomas',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Náuseas / Antiemético / Dispepsia',
  },
  {
    nome: 'Buscopan Composto',
    principioAtivo: 'Butilbrometo de Escopolamina 10mg + Dipirona Monoidratada 500mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas se dor abdominal ou cólica.',
    quantidade: '20 comprimidos',
    duracao: 'Em caso de cólica',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Cólicas / Dor Abdominal / Antiespasmódico',
  },
  {
    nome: 'Macrogol 3350 Sachê',
    principioAtivo: 'Macrogol 3350 puro',
    formaFarmaceutica: 'Sachês',
    uso: 'Uso oral',
    posologia: 'Diluir 1 sachê em 200ml de água ou suco e tomar pela manhã.',
    quantidade: '30 sachês',
    duracao: '30 dias',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Constipação Intestinal / Laxante',
  },
  {
    nome: 'Lactulose Xarope',
    principioAtivo: 'Lactulose 667mg/ml',
    formaFarmaceutica: 'Xarope',
    uso: 'Uso oral',
    posologia: 'Tomar 15ml por via oral pela manhã, ajustando a dose conforme trânsito intestinal.',
    quantidade: '1 frasco de 120ml',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Constipação / Laxante Fisiológico',
  },
  {
    nome: 'Cetoprofeno 100mg',
    principioAtivo: 'Cetoprofeno 100mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas após as refeições.',
    quantidade: '10 comprimidos',
    duracao: '5 dias',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Dor / Anti-inflamatório / Artrite',
  },
  {
    nome: 'Diclofenaco Sódico 50mg',
    principioAtivo: 'Diclofenaco Sódico 50mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas após as refeições.',
    quantidade: '10 comprimidos',
    duracao: '5 dias',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Dor / Anti-inflamatório Osteoarticular',
  },
  {
    nome: 'Meloxicam 15mg',
    principioAtivo: 'Meloxicam 15mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia, após o almoço.',
    quantidade: '10 comprimidos',
    duracao: '7 dias',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Dor Osteoarticular / Artrite / Artrose',
  },
  {
    nome: 'Celecoxibe 200mg (Celebra)',
    principioAtivo: 'Celecoxibe 200mg',
    formaFarmaceutica: 'Cápsulas',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral ao dia, após as refeições.',
    quantidade: '10 cápsulas',
    duracao: '10 dias',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Anti-inflamatório / Dor Articular / Osteoartrite',
  },
  {
    nome: 'Nimesulida 100mg',
    principioAtivo: 'Nimesulida 100mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas após as refeições.',
    quantidade: '12 comprimidos',
    duracao: '5 dias',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Dor de Garganta / Febre / Anti-inflamatório',
  },
  {
    nome: 'Tylex 30mg (Codeína + Paracetamol)',
    principioAtivo: 'Fosfato de Codeína 30mg + Paracetamol 500mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 6 em 6 horas se dor moderada a forte.',
    quantidade: '12 comprimidos',
    duracao: 'Em caso de dor forte',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Dor Moderada a Forte / Analgésico Opioide (A2/C1)',
  },
  {
    nome: 'Tramadol Cloridrato 50mg',
    principioAtivo: 'Cloridrato de Tramadol 50mg',
    formaFarmaceutica: 'Cápsulas',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral de 8 em 8 horas em caso de dor moderada a forte.',
    quantidade: '10 cápsulas',
    duracao: '5 dias',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Dor Moderada a Forte / Opioide (A2/C1)',
  },
  {
    nome: 'Amitriptilina 25mg',
    principioAtivo: 'Cloridrato de Amitriptilina 25mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, antes de deitar.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Depressão / Enxaqueca / Dor Crônica (C1)',
  },
  {
    nome: 'Nortriptilina 25mg (Pamelor)',
    principioAtivo: 'Cloridrato de Nortriptilina 25mg',
    formaFarmaceutica: 'Cápsulas',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral à noite, antes de deitar.',
    quantidade: '30 cápsulas',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Depressão / Dor Neuropática / Enxaqueca (C1)',
  },
  {
    nome: 'Mirtazapina 30mg',
    principioAtivo: 'Mirtazapina 30mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, antes de deitar.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Depressão / Ansiedade / Insônia (C1)',
  },
  {
    nome: 'Bupropiona 150mg',
    principioAtivo: 'Cloridrato de Bupropiona 150mg',
    formaFarmaceutica: 'Comprimidos de ação prolongada',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Depressão / Tabagismo (C1)',
  },
  {
    nome: 'Trazodona 50mg (Donaren)',
    principioAtivo: 'Cloridrato de Trazodona 50mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, antes de dormir.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Depressão / Insônia / Ansiedade (C1)',
  },
  {
    nome: 'Risperidona 2mg',
    principioAtivo: 'Risperidona 2mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Esquizofrenia / Autismo / Antipsicótico (C1)',
  },
  {
    nome: 'Olanzapina 5mg',
    principioAtivo: 'Olanzapina 5mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, antes de deitar.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Transtorno Bipolar / Antipsicótico (C1)',
  },
  {
    nome: 'Aripiprazol 15mg',
    principioAtivo: 'Aripiprazol 15mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã, junto com a refeição.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Transtorno Bipolar / Depressão / Antipsicótico (C1)',
  },
  {
    nome: 'Haloperidol 5mg',
    principioAtivo: 'Haloperidol 5mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Esquizofrenia / Delírios / Agitação (C1)',
  },
  {
    nome: 'Lorazepam 2mg',
    principioAtivo: 'Lorazepam 2mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1/2 a 1 comprimido por via oral à noite, se necessário.',
    quantidade: '30 comprimidos',
    duracao: '30 dias',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Ansiedade / Espasmos / Insônia (B1)',
  },
  {
    nome: 'Bromazepam 3mg',
    principioAtivo: 'Bromazepam 3mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, antes de deitar.',
    quantidade: '30 comprimidos',
    duracao: '30 dias',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Ansiedade / Tensão Emocional (B1)',
  },
  {
    nome: 'Eszopiclona 3mg',
    principioAtivo: 'Eszopiclona 3mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, imediatamente antes de deitar.',
    quantidade: '30 comprimidos',
    duracao: '30 dias',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Insônia / Sono (B1)',
  },
  {
    nome: 'Gabapentina 300mg',
    principioAtivo: 'Gabapentina 300mg',
    formaFarmaceutica: 'Cápsulas',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral de 8 em 8 horas.',
    quantidade: '90 cápsulas',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Dor neuropática / Anticonvulsivante (C1)',
  },
  {
    nome: 'Carbamazepina 200mg',
    principioAtivo: 'Carbamazepina 200mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.',
    quantidade: '60 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Epilepsia / Dor no Trigêmeo (C1)',
  },
  {
    nome: 'Valproato de Sódio 500mg',
    principioAtivo: 'Valproato de Sódio 500mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.',
    quantidade: '60 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Epilepsia / Bipolaridade / Enxaqueca (C1)',
  },
  {
    nome: 'Topiramato 50mg',
    principioAtivo: 'Topiramato 50mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.',
    quantidade: '60 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Epilepsia / Enxaqueca / Ansiedade (C1)',
  },
  {
    nome: 'Lamotrigina 100mg',
    principioAtivo: 'Lamotrigina 100mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Transtorno Bipolar / Anticonvulsivante (C1)',
  },
  {
    nome: 'Gardenal 100mg (Fenobarbital)',
    principioAtivo: 'Fenobarbital 100mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Epilepsia / Anticonvulsivante (B1)',
  },
  {
    nome: 'Lítio 300mg (Carbolitium)',
    principioAtivo: 'Carbonato de Lítio 300mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas, após as refeições.',
    quantidade: '60 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Transtorno Bipolar / Bipolaridade (C1)',
  },
  {
    nome: 'Ritalina 10mg (Metilfenidato)',
    principioAtivo: 'Cloridrato de Metilfenidato 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã e 1 comprimido ao meio-dia.',
    quantidade: '60 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'TDAH / Narcolepsia / Estimulante (A3)',
  },
  {
    nome: 'Venvanse 30mg',
    principioAtivo: 'Dimesilato de Lisdexanfetamina 30mg',
    formaFarmaceutica: 'Cápsulas',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral pela manhã.',
    quantidade: '30 cápsulas',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'TDAH / Transtorno de Compulsão Alimentar (A3)',
  },
  {
    nome: 'Donepezila 10mg',
    principioAtivo: 'Cloridrato de Donepezila 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral à noite, antes de deitar.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Alzheimer / Demência (C1)',
  },
  {
    nome: 'Memantina 10mg',
    principioAtivo: 'Cloridrato de Memantina 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Alzheimer / Demência (C1)',
  },
  {
    nome: 'Galantamina 16mg',
    principioAtivo: 'Bromidrato de Galantamina 16mg',
    formaFarmaceutica: 'Cápsulas de liberação prolongada',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral pela manhã, com alimentos.',
    quantidade: '30 cápsulas',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Alzheimer / Demência (C1)',
  },
  {
    nome: 'Desloratadina 5mg',
    principioAtivo: 'Desloratadina 5mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia.',
    quantidade: '10 comprimidos',
    duracao: '10 dias',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Antialérgico / Rinite / Alergias',
  },
  {
    nome: 'Allegra 120mg (Fexofenadina)',
    principioAtivo: 'Cloridrato de Fexofenadina 120mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia.',
    quantidade: '10 comprimidos',
    duracao: '10 dias',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Antialérgico / Rinite Alérgica / Urticária',
  },
  {
    nome: 'Prednisona 20mg',
    principioAtivo: 'Prednisona 20mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral pela manhã, após refeição.',
    quantidade: '10 comprimidos',
    duracao: '7 dias',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Corticoide / Anti-inflamatório / Asma',
  },
  {
    nome: 'Budesonida Spray Nasal 64mcg',
    principioAtivo: 'Budesonida 64mcg/dose',
    formaFarmaceutica: 'Frasco spray',
    uso: 'Uso nasal',
    posologia: 'Aplicar 1 a 2 jatos em cada narina uma vez ao dia.',
    quantidade: '1 frasco',
    duracao: '30 dias',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Rinite Alérgica / Antialérgico',
  },
  {
    nome: 'Amoxicilina + Clavulanato 875mg+125mg',
    principioAtivo: 'Amoxicilina 875mg + Clavulanato de Potássio 125mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.',
    quantidade: '14 comprimidos',
    duracao: '7 dias',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Antibiótico / Infecções de Pele/Respiratórias (2 vias — RDC 471/2021)',
    motivoEspecial: 'Antimicrobiano (RDC 471/2021 ANVISA) — exige receita em 2 vias, com retenção da 1ª via na farmácia.',
  },
  {
    nome: 'Azitromicina 500mg',
    principioAtivo: 'Azitromicina 500mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia.',
    quantidade: '3 comprimidos',
    duracao: '3 dias',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Antibiótico / Infecções Respiratórias/Garganta (2 vias — RDC 471/2021)',
    motivoEspecial: 'Antimicrobiano (RDC 471/2021 ANVISA) — exige receita em 2 vias, com retenção da 1ª via na farmácia.',
  },
  {
    nome: 'Ciprofloxacino 500mg',
    principioAtivo: 'Cloridrato de Ciprofloxacino 500mg',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 12 em 12 horas.',
    quantidade: '14 comprimidos',
    duracao: '7 dias',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Antibiótico / Infecção Urinária/ITU (2 vias — RDC 471/2021)',
    motivoEspecial: 'Antimicrobiano (RDC 471/2021 ANVISA) — exige receita em 2 vias, com retenção da 1ª via na farmácia.',
  },
  {
    nome: 'Nitrofurantoína 100mg',
    principioAtivo: 'Nitrofurantoína 100mg',
    formaFarmaceutica: 'Cápsulas',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral de 6 em 6 horas.',
    quantidade: '28 cápsulas',
    duracao: '7 dias',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Antibiótico / Infecção Urinária / Cistite (2 vias — RDC 471/2021)',
    motivoEspecial: 'Antimicrobiano (RDC 471/2021 ANVISA) — exige receita em 2 vias, com retenção da 1ª via na farmácia.',
  },
  {
    nome: 'Puran T4 75mcg (Levotiroxina)',
    principioAtivo: 'Levotiroxina Sódica 75mcg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral em jejum, 30 minutos antes do café da manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Hipotireoidismo / Tireoide',
  },
  {
    nome: 'Vitamina D3 7.000 UI',
    principioAtivo: 'Colecalciferol 7.000 UI',
    formaFarmaceutica: 'Cápsulas',
    uso: 'Uso oral',
    posologia: 'Tomar 1 cápsula por via oral uma vez por semana, com refeição.',
    quantidade: '8 cápsulas',
    duracao: '8 semanas',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Suplementação de Vitamina D / Osteoporose',
  },
  {
    nome: 'Anlodipino 5mg',
    principioAtivo: 'Anlodipino 5mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia, pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Hipertensão Arterial / Angina',
  },
  {
    nome: 'Selozok 50mg (Metoprolol)',
    principioAtivo: 'Succinato de Metoprolol 50mg',
    formaFarmaceutica: 'Comprimidos de liberação prolongada',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia pela manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Hipertensão / Insuficiência Cardíaca',
  },
  {
    nome: 'Aldactone 25mg (Espironolactona)',
    principioAtivo: 'Espironolactona 25mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Hipertensão / Diurético Poupador de Potássio',
  },
  {
    nome: 'Buscopan Simples',
    principioAtivo: 'Butilbrometo de Escopolamina 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 8 em 8 horas se cólica ou dor.',
    quantidade: '20 comprimidos',
    duracao: 'Em caso de dor',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Cólica Intestinal / Espasmos',
  },
  {
    nome: 'Dimorf 10mg (Morfina)',
    principioAtivo: 'Sulfato de Morfina 10mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral de 4 em 4 horas se dor intensa.',
    quantidade: '20 comprimidos',
    duracao: 'Em caso de dor intensa',
    tipoRecomendado: 'ESPECIAL',
    indicacao: 'Dor Intensa / Analgésico Opioide Forte (A1)',
  },
  {
    nome: 'Ozempic 0,5mg (Semaglutida)',
    principioAtivo: 'Semaglutida 0,5mg',
    formaFarmaceutica: 'Caneta injetável',
    uso: 'Uso subcutâneo',
    posologia: 'Aplicar 1 dose por via subcutânea uma vez por semana, no mesmo dia da semana.',
    quantidade: '1 caneta',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Diabetes Mellitus Tipo 2 / Controle de Peso',
  },
  {
    nome: 'Marevan 5mg',
    principioAtivo: 'Warfarina Sódica 5mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar conforme esquema de controle de RNI, de preferência no final da tarde.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Anticoagulante / Trombose / Fibrilação Atrial',
  },
  {
    nome: 'Puran T4 25mcg (Levotiroxina)',
    principioAtivo: 'Levotiroxina Sódica 25mcg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral em jejum, 30 minutos antes do café da manhã.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Hipotireoidismo / Tireoide',
  },
  {
    nome: 'Sulfato Ferroso 40mg',
    principioAtivo: 'Sulfato Ferroso 40mg (Ferro Elementar)',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral 1 hora antes do almoço.',
    quantidade: '60 comprimidos',
    duracao: '60 dias',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Anemia Ferropriva / Reposição de Ferro',
  },
  {
    nome: 'Ácido Fólico 5mg',
    principioAtivo: 'Ácido Fólico 5mg',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia.',
    quantidade: '30 comprimidos',
    duracao: '30 dias',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Suplementação de Folato / Anemia Megaloblástica',
  },
  {
    nome: 'Renovi B Plus',
    principioAtivo: 'Renovi B Plus (Vitamina B12 + Vitaminas do Complexo B)',
    formaFarmaceutica: 'Comprimidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Suplementação de Vitaminas do Complexo B',
  },
  {
    nome: 'Complexo B',
    principioAtivo: 'Complexo B (Vitaminas B1, B2, B3, B5, B6, B12)',
    formaFarmaceutica: 'Comprimidos revestidos',
    uso: 'Uso oral',
    posologia: 'Tomar 1 comprimido por via oral ao dia.',
    quantidade: '30 comprimidos',
    duracao: 'Uso contínuo',
    tipoRecomendado: 'SIMPLES',
    indicacao: 'Suplementação de Vitaminas do Complexo B',
  }
];

interface AutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (med: Omit<MedicamentoSugestao, 'nome'>) => void;
  onEnterPress: () => void;
  placeholder: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function MedicamentoAutocomplete({
  value,
  onChange,
  onSelect,
  onEnterPress,
  placeholder,
  disabled = false,
  autoFocus = false,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const sugestoes = useMemo(() => {
    if (!value.trim() || !isOpen) return [];
    const query = value.toLowerCase();
    return DATABASE_MEDICAMENTOS.filter((m) =>
      m.nome.toLowerCase().includes(query) ||
      m.principioAtivo.toLowerCase().includes(query) ||
      m.indicacao.toLowerCase().includes(query)
    ).slice(0, 5); // Limitado a 5 sugestões para ser compacto
  }, [value, isOpen]);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (sugestoes.length === 0) {
      if (e.key === 'Enter') {
        onEnterPress();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < sugestoes.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : sugestoes.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < sugestoes.length) {
        selectItem(sugestoes[activeIndex]);
      } else {
        onEnterPress();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const selectItem = (med: MedicamentoSugestao) => {
    onSelect({
      principioAtivo: med.principioAtivo,
      formaFarmaceutica: med.formaFarmaceutica,
      uso: med.uso,
      posologia: med.posologia,
      quantidade: med.quantidade,
      duracao: med.duracao,
      tipoRecomendado: med.tipoRecomendado,
      indicacao: med.indicacao,
      observacoes: med.observacoes || '',
    });
    onChange(med.nome);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <div className="relative flex items-center">
        <Pill className="absolute left-3 text-gray-400 pointer-events-none" size={14} />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className="w-full text-sm bg-transparent border-none outline-none pl-9 pr-3 py-2 text-gray-800 placeholder-gray-400 font-medium"
        />
      </div>

      {isOpen && sugestoes.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-gray-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
          {sugestoes.map((med, index) => {
            const isEspecial = med.tipoRecomendado === 'ESPECIAL';
            const isActive = index === activeIndex;
            return (
              <button
                key={med.nome}
                type="button"
                onClick={() => selectItem(med)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs transition-colors ${
                  isActive ? 'bg-indigo-50/70 text-indigo-900' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-semibold text-gray-800 truncate">{med.nome}</p>
                    {med.indicacao && (
                      <span className="text-[9px] bg-slate-100 border border-slate-200/60 text-slate-500 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                        {med.indicacao}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 truncate mt-1">{med.posologia}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  {isEspecial ? (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded px-1 py-0.5 uppercase tracking-wide">
                      <ShieldAlert size={8} />
                      Controle
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-green-600 bg-green-50 border border-green-100 rounded px-1 py-0.5 uppercase tracking-wide">
                      <CheckCircle2 size={8} />
                      Simples
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
