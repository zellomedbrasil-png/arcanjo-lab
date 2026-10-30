// Nome curto das categorias do catálogo, para abas e listas.

export const formatCategoryName = (nome: string) => {
  const mapping: Record<string, string> = {
    'HEMATOLOGIA E COAGULAÇÃO': 'Hematologia e Coagulação',
    'GLICEMIA E METABOLISMO GLICÍDICO': 'Glicemia e Metabolismo',
    'PERFIL LIPÍDICO': 'Perfil Lipídico (Colesterol)',
    'FUNÇÃO RENAL E URINA': 'Função Renal e Urina',
    'FUNÇÃO HEPÁTICA E PANCREÁTICA': 'Função Hepática e Pâncreas',
    'TIREOIDE': 'Tireoide',
    'HORMÔNIOS E ENDOCRINOLOGIA': 'Hormônios e Endocrino',
    'MINERAIS, VITAMINAS E OLIGOELEMENTOS': 'Vitaminas e Minerais',
    'MARCADORES TUMORAIS': 'Marcadores Tumorais',
    'SOROLOGIAS INFECCIOSAS': 'Sorologias e Infecções',
    'AUTOIMUNIDADE E REUMATOLOGIA': 'Autoimunidade e Reuma',
    'IMUNOGLOBULINAS': 'Imunoglobulinas',
    'MARCADORES CARDÍACOS E MUSCULARES': 'Marcadores Cardíacos',
    'PARASITOLOGIA E COPROLÓGICO': 'Parasitologia e Fezes',
    'ANDROLOGIA': 'Andrologia',
    'DOSAGENS URINÁRIAS ESPECIAIS': 'Dosagens Urinárias Esp.',
    'INFLAMAÇÃO E MARCADORES GERAIS': 'Inflamação e Gerais',
    'OUTROS EXAMES': 'Outros Exames'
  };
  return mapping[nome] ?? nome.toLowerCase().replace(/(^\w|\s\w)/g, m => m.toUpperCase());
};
