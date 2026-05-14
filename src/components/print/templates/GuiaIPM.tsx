import { useAppStore } from '../../../store/useAppStore';
import { formatExamWithCode } from '../../../utils/exames';
import logoIpm from '../../../assets/logo_ipm.jpeg';

export default function GuiaIPM() {
  const { pacienteNome, examesSelecionados, procedimentosSelecionados, tipoGuia, justificativa, genero } = useAppStore();

  const isLab = tipoGuia === 'LABORATORIO';

  const PROC_NOMES: Record<string, string> = {
    ECOCARDIOGRAMA:      'Ecocardiograma Transtorácico',
    ECODOPPLER:          'Ecodopplercardiograma',
    MAPA:                'MAPA - Monitoramento Ambulatorial da Pressão Arterial 24h',
    HOLTER:              'Holter - Eletrocardiografia de Longa Duração 24h',
    ECG:                 'Eletrocardiograma (ECG)',
    US_ABD_TOTAL:        'Ultrassonografia do Abdome Total',
    US_PELVICO:          'Ultrassonografia Pélvica',
    US_TRANSVAGINAL:     'Ultrassonografia Transvaginal',
    US_PROSTATA:         'Ultrassonografia de Próstata e Vias Urinárias',
    US_TIREOIDE:         'Ultrassonografia de Tireoide',
    US_VIAS_BILIARES:    'Ultrassonografia de Vias Biliares e Fígado',
    EDA:                 'Esofagogastroduodenoscopia (EDA)',
    COLONOSCOPIA:        'Colonoscopia',
    RETOSSIGMOIDOSCOPIA: 'Retossigmoidoscopia',
    RX_TORAX:            'Radiografia de Tórax (PA e Perfil)',
    RX_COLUNA:           'Radiografia de Coluna',
    TC_ABD:              'Tomografia Computadorizada de Abdome e Pelve com Contraste',
    TC_CRANIO:           'Tomografia Computadorizada de Crânio',
    RM_ABD:              'Ressonância Magnética de Abdome e Pelve',
    RM_CRANIO:           'Ressonância Magnética de Crânio',
    DENSITOMETRIA:       'Densitometria Óssea (DXA)',
  };

  const getLinhas = () => {
    // Aplica o formato Nome (Código) para todos os exames
    const examesFormatados = examesSelecionados.map(e => formatExamWithCode(e, 'IPM'));

    // Fallback: divide os exames em blocos (até 7)
    const limit = 7;
    const chunkSize = Math.ceil(examesFormatados.length / limit) || 1;
    const result = [];
    for (let i = 0; i < limit; i++) {
      const chunk = examesFormatados.slice(i * chunkSize, (i + 1) * chunkSize);
      if (chunk.length > 0) result.push(chunk.join(', '));
    }
    return result;
  };

  const linhas = getLinhas();

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
            <span className="font-semibold text-[11px] uppercase">{pacienteNome}</span>
          </div>
          <div className="flex-1 p-1">
            <span className="font-bold text-[10px]">MATRÍCULA:</span>
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
                <span className="font-bold">{genero === 'M' ? 'X' : ''}</span>
              </div>
              <div className="flex-1 border-r border-black text-center text-[10px] flex flex-col justify-between p-1">
                <span className="font-bold">F</span>
                <span className="font-bold">{genero === 'F' ? 'X' : ''}</span>
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
          <div className="mt-1 px-1 text-justify text-[9.5px] uppercase font-semibold leading-tight">
            {justificativa}
          </div>
        </div>

        {/* Row 8: Procedimentos (Nº DO SERVIÇO ASSISTENCIAL) */}
        <div className="border-b border-black p-1 min-h-[140px]">
          <span className="font-bold text-[10px]">
            Nº DO SERVIÇO ASSISTENCIAL <span className="font-normal text-gray-700 text-[9px]">(conforme quadro)</span>: <span className="font-bold">_______</span>
          </span>
          <div className="mt-2 text-[9px] uppercase leading-tight text-justify">
            {isLab ? (
              <div className="space-y-1">
                {linhas.map((linha, idx) => (
                  <div key={idx}>{linha}</div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {(procedimentosSelecionados.length > 0 ? procedimentosSelecionados : [tipoGuia]).map((id, idx) => (
                  <div key={idx} className="font-bold text-sm">
                    {idx + 1}. {PROC_NOMES[id] || id}
                  </div>
                ))}
              </div>
            )}
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
