const fs = require('fs');

const content = fs.readFileSync('exames_ipm_issec.md', 'utf8');
const lines = content.split('\n');

const categorias = [];
let currentCategoria = null;
let mode = 'CATEGORIES'; // 'CATEGORIES' | 'PANELS'
const panels = {};
let currentPanel = null;

const gastroJustificativa = 'Investigação de queixa dispéptica / dor abdominal / alteração de hábito intestinal com perda ponderal. Hepatograma com perfil ferro (rastreio hemocromatose/esteatose), função pancreática, doença celíaca (anti-gliadina/anti-endomísio), sorologias hepatites A/B/C, H. pylori, perfil nutricional, parasitológico/sangue oculto. Marcadores TGI (CEA, CA 19-9, CA 72-4, AFP)';
const geriatriaJustificativa = 'Avaliação geriátrica ampla. Rastreio de anemias, função renal, tireoidiana e hepática. Investigação de deficiências vitamínicas (B12, D, Ácido fólico), osteoporose e risco cardiovascular. Avaliação prostática e de marcadores tumorais gerais para idade. Rastreio cognitivo metabólico.';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line === '## PAINÉIS CLÍNICOS PRÉ-DEFINIDOS') {
    mode = 'PANELS';
    continue;
  }
  
  if (mode === 'CATEGORIES') {
    if (line.match(/^## \d+\. /)) {
      currentCategoria = {
        nome: line.replace(/^## \d+\. /, ''),
        exames: []
      };
      categorias.push(currentCategoria);
    } else if (currentCategoria && line.startsWith('|') && !line.includes('Marca | Exame') && !line.includes('---|---')) {
      const parts = line.split('|').map(s => s.trim());
      if (parts.length >= 5) {
        const marca = parts[1].replace(/`/g, '');
        const nome = parts[2];
        let codIssec = parts[3];
        let codIpm = parts[4];
        
        if (codIssec.includes('—')) codIssec = '';
        if (codIpm.includes('—')) codIpm = '';
        
        if (nome) {
          currentCategoria.exames.push({
            nome: nome.toUpperCase(),
            marca: marca,
            codIssec: codIssec.replace(/`/g, '').replace(/\*\*IPM/g, '').trim(),
            codIpm: codIpm.replace(/`/g, '').replace(/\*\*IPM/g, '').trim()
          });
        }
      }
    }
  } else if (mode === 'PANELS') {
    if (line.startsWith('### ')) {
      const panelName = line.replace('### ', '');
      currentPanel = panelName;
      let justificativa = '';
      if (panelName.toLowerCase().includes('gastro')) justificativa = gastroJustificativa;
      if (panelName.toLowerCase().includes('geri')) justificativa = geriatriaJustificativa;
      
      panels[panelName] = {
        nome: panelName,
        exames: [],
        justificativa
      };
    } else if (currentPanel && line.startsWith('|') && !line.includes('Exame | Cód.') && !line.includes('---|---')) {
      const parts = line.split('|').map(s => s.trim());
      if (parts.length >= 4) {
        let nome = parts[1];
        nome = nome.replace(/`\*\*IPM`/g, '').trim().toUpperCase();
        if (nome) {
          panels[currentPanel].exames.push(nome);
        }
      }
    }
  }
}

const tsContent = `// Auto-generated from exames_ipm_issec.md
export interface Exame {
  nome: string;
  marca: string;
  codIssec: string;
  codIpm: string;
}

export interface CategoriaExames {
  nome: string;
  exames: Exame[];
}

export const CATEGORIAS_EXAMES: CategoriaExames[] = ${JSON.stringify(categorias, null, 2)};

export const PAINEIS_MARKDOWN: Record<string, { nome: string, exames: string[], justificativa: string }> = ${JSON.stringify(panels, null, 2)};
`;

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/exames.ts', tsContent);
console.log('src/data/exames.ts created successfully!');
