import { useAppStore } from '../../../store/useAppStore';
import { getProcedimentoNome } from '../../../data/procedimentos';
import logoIpm from '../../../assets/logo_ipm.jpeg';

const MEDICO = {
  nome: 'DR. ROBERTO ARCANJO',
  crm: 'CRM/CE 26155',
};

function formatExamNameForPrint(name: string) {
  if (!name) return '';
  const uppercaseAcronyms = new Set([
    'PTH', 'ACTH', 'DHEA', 'SHBG', 'IGF-1', 'BNP', 'PROBNP', 'CKMB-MASSA', 'DHT', 'VDRL',
    'LH', 'FSH', 'TSH', 'TRAB', 'IGG', 'IGM', 'IGA', 'IGD', 'IGE', 'HIV', 'HTLV', 'ASO',
    'CEA', 'CA', 'ADA', 'ECA', 'TGO', 'TGP', 'GGT', 'TAP', 'TTPA', 'VHS', 'HBA1C'
  ]);
  
  return name.split(/(\s+|-|\(|\)|\/|,)/).map(part => {
    const trimmed = part.trim();
    if (!trimmed) return part;
    if (uppercaseAcronyms.has(trimmed.toUpperCase())) {
      if (['IGG', 'IGM', 'IGA', 'IGD', 'IGE'].includes(trimmed.toUpperCase())) {
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
      }
      return trimmed.toUpperCase();
    }
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }).join('');
}

export default function GuiaIPM() {
  const { pacienteNome, numeroBeneficiario, examesSelecionados, procedimentosSelecionados, tipoGuia, justificativa, genero } = useAppStore();

  const isLab = tipoGuia === 'LABORATORIO';

  const itemsList = isLab
    ? examesSelecionados
    : (procedimentosSelecionados.length > 0 ? procedimentosSelecionados : [tipoGuia]);

  return (
    <div className="p-8 text-[11px] leading-snug font-sans text-black bg-white h-full relative">
      
      {/* Cabeçalho IPM Fiel */}
      <div className="relative text-center mb-6">
        <div className="flex justify-center items-center mb-2">
          <img src={logoIpm} alt="IPM e Fortaleza Logo" className="h-12 object-contain" />
        </div>
        <div className="absolute right-0 top-2 font-bold text-xl">
          G1
        </div>
        <div className="font-bold text-[11px] uppercase">
          INSTITUTO DE PREVIDÊNCIA DO MUNICÍPIO DE FORTALEZA – IPM
        </div>
        <div className="font-bold text-[11px] uppercase mt-1">
          PROGRAMA DE ASSISTÊNCIA À SAÚDE DOS SERVIDORES DO MUNICÍPIO DE FORTALEZA - IPM SAÚDE
        </div>
        <div className="mt-4">
          <u className="font-bold text-[12px] uppercase tracking-wide">
            GUIA PARA SOLICITAÇÃO DE PROCEDIMENTOS ELETIVOS AMBULATORIAIS
          </u>
        </div>
      </div>

      <div className="border-[2px] border-black flex flex-col">
        {/* Row 1: QUADRO DE SERVIÇOS ASSISTENCIAIS */}
        <div className="text-center font-bold text-[10px] bg-gray-100 border-b border-black py-1 uppercase">
          QUADRO DE SERVIÇOS ASSISTENCIAIS
        </div>

        {/* Row 2: Lista de 8 itens */}
        <div className="p-2 border-b border-black text-[9px] font-bold leading-tight">
          <div className="grid grid-cols-1 gap-0">
            <div>1. ENCAMINHAMENTO PARA NEUROLOGISTA;</div>
            <div>2. ENCAMINHAMENTO PARA NUTRICIONISTA;</div>
            <div>3. EXAME (SADT);</div>
            <div>4. TERAPIA (Fisioterapia; Fonoaudiologia; Psicoterapia; Terapia Ocupacional; Acupuntura);</div>
            <div>5. QUIMIOTERAPIA;</div>
            <div>6. RADIOTERAPIA;</div>
            <div>7. HEMODIÁLISE/DIÁLISE PERITONEAL;</div>
            <div>8. PEQUENA CIRURGIA (PQA).</div>
          </div>
        </div>

        {/* Row 3: Paciente e Matrícula */}
        <div className="flex border-b border-black">
          <div className="flex-[3] border-r border-black p-1 flex">
            <span className="font-bold mr-2 text-[10px]">PACIENTE:</span>
            <span className="font-normal text-[11px] uppercase">{pacienteNome}</span>
          </div>
          <div className="flex-1 p-1 flex items-baseline">
            <span className="font-bold text-[10px] mr-2">MATRÍCULA:</span>
            <span className="font-normal text-[11.5px] uppercase font-mono">{numeroBeneficiario}</span>
          </div>
        </div>

        {/* Row 4: Nascimento, Gênero e Telefone */}
        <div className="flex border-b border-black">
          <div className="flex-[2] border-r border-black p-1">
            <span className="font-bold text-[10px]">DATA DE NASCIMENTO:</span>
          </div>
          <div className="flex-[2] border-r border-black flex flex-col">
            <div className="text-center font-bold text-[8px] border-b border-black bg-gray-100 uppercase">
              GÊNERO
            </div>
            <div className="flex flex-1">
              <div className="flex-1 border-r border-black text-center text-[10px] flex flex-col justify-between p-1">
                <span className="font-bold">M</span>
                <span className="font-normal">{genero === 'M' ? 'X' : ''}</span>
              </div>
              <div className="flex-1 border-r border-black text-center text-[10px] flex flex-col justify-between p-1">
                <span className="font-bold">F</span>
                <span className="font-normal">{genero === 'F' ? 'X' : ''}</span>
              </div>
              <div className="flex-[2] text-center text-[10px] flex flex-col justify-between p-1">
                <span className="font-bold">OUTRO (ESPECIFICAR)</span>
                <span></span>
              </div>
            </div>
          </div>
          <div className="flex-[2] p-1">
            <span className="font-bold text-[10px]">TELEFONE(S):</span>
          </div>
        </div>

        {/* Row 5: Médico Solicitante e Credenciado */}
        <div className="flex border-b border-black min-h-[50px]">
          <div className="flex-[3] border-r border-black p-1">
            <span className="font-bold text-[10px]">MÉDICO(A) SOLICITANTE:</span><br/>
            <span className="font-normal text-[11px] uppercase">{MEDICO.nome}</span>
          </div>
          <div className="flex-[2] flex flex-col">
            <div className="text-center font-bold text-[8px] border-b border-black bg-gray-100 py-1 uppercase">
              CREDENCIADO(A) IPM?
            </div>
            <div className="p-1 text-[8px] font-bold leading-tight flex-1 flex flex-col justify-center">
              <div>( ) SIM - Nº DO TERMO DE CREDENCIAMENTO: ____________.</div>
              <div>( ) NÃO.</div>
              <div>( ) CORPO CLÍNICO DE PRESTADOR PESSOA JURÍDICA IPM – ESPECIFICAR:</div>
            </div>
          </div>
        </div>

        {/* Row 6: Credenciado Executante */}
        <div className="border-b border-black p-1 bg-gray-100 flex justify-between">
          <span className="font-bold text-[10px]">CREDENCIADO(A) IPM - EXECUTANTE:</span>
        </div>

        {/* Row 7: Justificativa */}
        <div className="border-b border-black p-1 min-h-[90px]">
          <span className="font-bold text-[10px]">INDICAÇÃO CLÍNICA/JUSTIFICATIVA:</span>
          <div className="mt-1 px-1 text-justify text-[9.5px] uppercase font-normal leading-tight">
            {justificativa}
          </div>
        </div>

        {/* Row 8: Procedimentos (Nº DO SERVIÇO ASSISTENCIAL) */}
        <div className="border-b border-black p-2 min-h-[160px] flex flex-col justify-between" style={{ boxSizing: 'border-box' }}>
          <div style={{ marginBottom: '3mm' }}>
            <span className="font-bold text-[10px]">
              Nº DO SERVIÇO ASSISTENCIAL <span className="font-normal text-gray-700 text-[9px]">(conforme quadro)</span>: <span className="font-bold">_______</span>.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2mm', flexGrow: 1 }}>
            {(() => {
              const getGuiaIPMLinhas = () => {
                const finalItems = (() => {
                  if (!isLab) {
                    return itemsList.map(item => formatExamNameForPrint(getProcedimentoNome(item)));
                  }
                  
                  const hasUrinocultura = itemsList.some(e => e.toUpperCase().trim() === 'URINOCULTURA');
                  const hasAntibiograma = itemsList.some(e => e.toUpperCase().trim() === 'ANTIBIOGRAMA');
                  
                  let filtered = itemsList;
                  if (hasUrinocultura && hasAntibiograma) {
                    filtered = itemsList.filter(e => e.toUpperCase().trim() !== 'ANTIBIOGRAMA');
                  }
                  
                  return filtered.map(item => {
                    const upper = item.toUpperCase().trim();
                    if (hasUrinocultura && hasAntibiograma && upper === 'URINOCULTURA') {
                      return formatExamNameForPrint('URINOCULTURA + ANTIBIOGRAMA');
                    }
                    return formatExamNameForPrint(item);
                  });
                })();

                if (!isLab) {
                  const lines = finalItems.slice(0, 3);
                  while (lines.length < 5) {
                    lines.push('');
                  }
                  return lines.map(name => ({ name, code: '' }));
                }

                const MAX_CHARS_PER_LINE = 150;
                const lines: string[] = [];
                let currentLine: string[] = [];
                let currentLen = 0;

                for (const item of finalItems) {
                  if (currentLine.length === 0) {
                    currentLine.push(item);
                    currentLen = item.length;
                  } else if (currentLen + 2 + item.length <= MAX_CHARS_PER_LINE) {
                    currentLine.push(item);
                    currentLen += 2 + item.length;
                  } else {
                    lines.push(currentLine.join(', '));
                    currentLine = [item];
                    currentLen = item.length;
                  }
                }
                
                if (currentLine.length > 0) {
                  lines.push(currentLine.join(', '));
                }

                while (lines.length < 5) {
                  lines.push('');
                }

                return lines.map(name => ({ name, code: '' }));
              };

              return getGuiaIPMLinhas().map((linha, idx) => (
                <div
                  key={idx}
                  className="flex items-end text-[9.5px] leading-tight"
                  style={{
                    minHeight: '5.8mm',
                  }}
                >
                  <div
                    style={{
                      flexGrow: 1,
                      borderBottom: '1px solid black',
                      paddingLeft: '1mm',
                      paddingBottom: '1px',
                      fontSize: '7px',
                      fontWeight: 'normal',
                      color: '#000',
                      minWidth: '50mm',
                      wordBreak: 'break-word',
                      textTransform: 'uppercase',
                    }}
                  >
                    {linha.name || <>&nbsp;</>}
                  </div>
                  <span style={{ fontSize: '7px', margin: '0 2mm', flexShrink: 0, color: '#000', fontWeight: 'normal' }}>
                    CÓDIGO
                  </span>
                  <div
                    style={{
                      width: '20mm',
                      borderBottom: '1px solid black',
                      textAlign: 'center',
                      paddingBottom: '1px',
                      fontSize: '7px',
                      fontWeight: 'normal',
                      color: '#000',
                      flexShrink: 0,
                    }}
                  >
                    {linha.code || <>&nbsp;</>}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Row 9: Assinatura e Data */}
        <div className="flex">
          <div className="flex-[3] border-r border-black p-1 relative h-16">
            <span className="font-bold text-[9px]">ASSINATURA E CARIMBO DO(A) MÉDICO(A) SOLICITANTE (com CREMEC):</span>
          </div>
          <div className="flex-[1] p-1 relative h-16">
            <span className="font-bold text-[10px]">DATA:</span>
          </div>
        </div>
      </div>

    </div>
  );
}
