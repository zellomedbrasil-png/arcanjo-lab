import { useAppStore } from '../../../store/useAppStore';
import { formatExamWithCode } from '../../../utils/exames';
import logoIssec from '../../../assets/logo_issec.jpeg';
import logoIssec2 from '../../../assets/logo_issec_2.jpeg';

export default function GuiaISSEC() {
  const { pacienteNome, examesSelecionados, procedimentosSelecionados, tipoGuia, justificativa } = useAppStore();

  // getNomeExame is kept for fallback when procedimentosSelecionados is empty
  // (uses getNomeExame_by_id for the actual rendering)

  const getNomeExame_by_id = (id: string) => {
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
    return PROC_NOMES[id] || id;
  };

  const isLab = tipoGuia === 'LABORATORIO';

  const getLinhas = () => {
    const examesFormatados = examesSelecionados.map(e => formatExamWithCode(e, 'ISSEC'));
    
    const chunkSize = Math.ceil(examesFormatados.length / 3) || 1;
    return [
      examesFormatados.slice(0, chunkSize).join(', '),
      examesFormatados.slice(chunkSize, chunkSize * 2).join(', '),
      examesFormatados.slice(chunkSize * 2).join(', ')
    ];
  };

  const linhas = getLinhas();

  return (
    <div className="p-8 text-[11px] leading-snug font-sans text-black bg-white h-full relative">
      
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-32">
          <img src={logoIssec} alt="ISSEC Logo" className="w-full object-contain" />
        </div>
        <div className="text-center text-lg font-bold tracking-wider mt-4">
          GUIA DE SERVIÇO – I
        </div>
        <div className="w-48 text-right">
          <img src={logoIssec2} alt="Governo Logo" className="w-full object-contain" />
        </div>
      </div>

      <div className="border border-black mb-4">
        <div className="bg-gray-200 border-b border-black text-center font-bold p-1 text-[10px]">
          PROCEDIMENTO
        </div>
        <div className="flex p-2 items-center">
          <div className="font-bold w-16 text-center text-sm">EXAME</div>
          <div className="text-5xl font-light mx-2 leading-none mt-[-10px]">{'\{'}</div>
          <div className="flex-1 grid grid-cols-3 gap-8 px-4 text-[10px]">
            <div className="flex flex-col space-y-2">
              <label className="flex items-center justify-between">
                <span>Laboratório</span>
                <span className="w-8 h-4 border border-black inline-block text-center font-bold">{isLab ? 'X' : ''}</span>
              </label>
              <label className="flex items-center justify-between">
                <span>Cardiológico</span>
                <span className="w-8 h-4 border border-black inline-block text-center font-bold">{procedimentosSelecionados.some(p => ['ECOCARDIOGRAMA','MAPA','HOLTER','ECG','ECODOPPLER'].includes(p)) ? 'X' : ''}</span>
              </label>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center justify-between">
                <span>Ultra-som</span>
                <span className="w-8 h-4 border border-black inline-block text-center font-bold">{tipoGuia.includes('US_') ? 'X' : ''}</span>
              </label>
              <label className="flex items-center justify-between">
                <span>Radiológico</span>
                <span className="w-8 h-4 border border-black inline-block text-center font-bold"></span>
              </label>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center justify-between">
                <span>Endoscópico</span>
                <span className="w-8 h-4 border border-black inline-block text-center font-bold"></span>
              </label>
              <label className="flex items-center justify-between">
                <span>Outros</span>
                <span className="w-8 h-4 border border-black inline-block text-center font-bold"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCO 2: RESERVADO AO MEDICO REQUISITANTE */}
      <div className="border-[1.5px] border-black flex flex-col mb-4">
        <div className="text-center font-bold bg-gray-200 border-b border-black py-1 text-[10px]">
          RESERVADO AO MÉDICO REQUISITANTE
        </div>
        
        {/* Row: Nome + Cartão ISSEC */}
        <div className="flex p-2 items-center min-h-[50px]">
          <div className="flex-1 mr-4">
            <span className="font-bold text-[10px]">Nome do Beneficiário:</span>
            <div className="border-b border-black mt-1 uppercase font-semibold text-[11px] px-2 w-full h-4">
              {pacienteNome}
            </div>
          </div>
          <div className="w-48 border border-black p-1 flex flex-col items-center justify-center relative h-12">
             <div className="absolute -top-3 bg-white px-2 text-[9px]">CARTÃO ISSEC</div>
          </div>
        </div>

        {/* Row: PROCEDIMENTOS SOLICITADOS */}
        <div className="border-t border-black">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black">
                <th className="w-8 border-r border-black text-center font-bold text-[10px] py-1">N.º</th>
                <th className="text-center font-bold text-[10px] py-1">PROCEDIMENTOS SOLICITADOS</th>
              </tr>
            </thead>
            <tbody>
                {[1, 2, 3].map((row) => {
                  let conteudo = '';
                  if (isLab) {
                    conteudo = linhas[row - 1] || '';
                  } else {
                    const procs = procedimentosSelecionados.length > 0 ? procedimentosSelecionados : [tipoGuia];
                    conteudo = row <= procs.length ? (getNomeExame_by_id(procs[row - 1])) : '';
                  }
                  return (
                    <tr key={row} className="border-b border-black h-8">
                      <td className="w-8 border-r border-black text-center font-bold">{String(row).padStart(2, '0')}</td>
                      <td className="p-1 px-2 align-middle text-[10px] uppercase font-semibold leading-tight">
                        {conteudo}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Row: Justificativa e Carimbo */}
        <div className="flex min-h-[120px]">
          <div className="flex-[3] border-r border-black p-1">
            <span className="font-bold text-[10px]">Justificativa:</span>
            <div className="mt-1 text-justify text-[9px] uppercase font-semibold">
              {justificativa}
            </div>
          </div>
          <div className="flex-[2] flex flex-col">
            <div className="flex-1 border-b border-black p-1">
              <span className="font-bold text-[10px]">Senha de Autorização da Consulta</span>
            </div>
            <div className="flex-1 p-1 flex flex-col justify-between">
              <div>
                <span className="font-bold text-[10px]">Data da solicitação:</span> ___/___/______
              </div>
              <div className="text-center">
                <div className="inline-block border-t border-black px-4 mt-8 text-[9px]">Carimbo e Assinatura do Médico</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCO 3: SERVIÇO EXECUTADO */}
      <div className="border-[1.5px] border-black flex flex-col mb-4">
        <div className="text-center font-bold bg-gray-200 border-b border-black py-1 text-[10px]">
          SERVIÇO EXECUTADO
        </div>
        <table className="w-full text-left border-collapse text-[10px]">
          <thead>
            <tr className="border-b border-black">
              <th className="w-8 border-r border-black text-center p-1">N.º</th>
              <th className="border-r border-black text-center p-1">PROCEDIMENTO</th>
              <th className="w-48 border-r border-black text-center p-1">CÓDIGO TABELA</th>
              <th className="w-24 text-center p-1">VALOR R$</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((row) => (
              <tr key={row} className="border-b border-black h-6">
                <td className="border-r border-black text-center font-bold p-1">{String(row).padStart(2, '0')}</td>
                <td className="border-r border-black p-1"></td>
                <td className="border-r border-black p-0">
                   <div className="grid grid-cols-7 h-full">
                     {[1,2,3,4,5,6,7].map(i => <div key={i} className="border-r border-black last:border-r-0"></div>)}
                   </div>
                </td>
                <td className="p-1"></td>
              </tr>
            ))}
            <tr className="border-b border-black h-6">
              <td colSpan={3} className="border-r border-black text-right pr-4 font-bold p-1 bg-gray-100">TOTAL</td>
              <td className="p-1"></td>
            </tr>
          </tbody>
        </table>

        {/* Row: Assinaturas Execução */}
        <div className="flex h-20">
          <div className="flex-[3] border-r border-black p-1 flex flex-col justify-between">
            <div className="text-[10px] font-bold">Data da realização do procedimento: ___/___/______</div>
            <div className="text-center">
              <div className="inline-block border-t border-black px-12 pt-1 text-[9px]">Assinatura do Beneficiário ou Responsável</div>
            </div>
          </div>
          <div className="flex-[2] p-1 flex flex-col justify-end text-center">
             <div className="inline-block pt-1 text-[9px]">Carimbo e Assinatura do Credenciado</div>
          </div>
        </div>
      </div>

      {/* BLOCO 4: RESERVADO PARA AUTORIZAÇÃO */}
      <div className="border-[1.5px] border-black flex flex-col">
        <div className="text-center font-bold bg-gray-200 border-b border-black py-1 text-[10px]">
          RESERVADO PARA AUTORIZAÇÃO
        </div>
        <div className="flex p-2 items-center justify-around h-16">
          <div className="flex flex-col items-center">
            <span className="font-bold text-[10px] mb-1">SENHA DE AUTORIZAÇÃO</span>
            <div className="flex">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="w-6 h-6 border border-black ml-[-1px]"></div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-[10px] mb-2">DATA DA AUTORIZAÇÃO</span>
            <div className="flex items-end space-x-2 font-bold text-[10px]">
               <div className="flex flex-col items-center"><span>__</span><span>dia</span></div>
               <span>/</span>
               <div className="flex flex-col items-center"><span>__</span><span>mês</span></div>
               <span>/</span>
               <div className="flex flex-col items-center"><span>____</span><span>ano</span></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
