import { useReceitaStore, type MedicamentoReceita } from '../../../store/useReceitaStore';
import { renderMarkdown } from '../../../utils/markdown';

const MEDICO = {
  nome: 'Dr. Roberto Arcanjo',
  crm: 'CRM/CE: 26.155',
  endereco: 'R. João Lobo Filho, 250 - AllMed',
  cidade: 'Fortaleza/Ceará',
};

export default function ReceitaBranca({ medicamentosOverride, textoLivre }: { medicamentosOverride?: MedicamentoReceita[]; textoLivre?: string } = {}) {
  const store = useReceitaStore();
  const medicamentos = medicamentosOverride || store.medicamentos;
  const { pacienteNome, pacienteCpf, local, data } = store;
  const dataFormatada = data || new Date().toLocaleDateString('pt-BR');

  // Modo texto livre: a prescrição é impressa exatamente como digitada (bloco único)
  const isTextoLivre = !!(textoLivre && textoLivre.trim());

  const medsValidos = medicamentos.filter((m) => m.principioAtivo || m.nomeDigitado);
  const count = medsValidos.length;

  const cfg = {
    padding: 'p-10',
    spaceY: 'space-y-6',
    itemMb: 'mb-4',
    groupMb: 'mb-3',
    headerPbMb: 'pb-3 mb-5',
    patientMb: 'mb-5 pb-3',
    footerPt: 'pt-6',
    
    // font sizes
    numSize: 'text-[12px]',
    titleSize: 'text-[12px]',
    subSize: 'text-[9px]',
    qtdSize: 'text-[9.5px]',
    posoSize: 'text-[10px]',
    durSize: 'text-[9.5px]',
    obsSize: 'text-[9.5px]',
    groupTitleSize: 'text-[11px]',
    pacienteNameSize: 'text-[12px]',
    pacienteLabelSize: 'text-[8px]',
    pacienteValSize: 'text-[10px]',
  };

  if (count === 5) {
    cfg.padding = 'p-8';
    cfg.spaceY = 'space-y-5';
    cfg.itemMb = 'mb-3';
    cfg.groupMb = 'mb-2';
    cfg.headerPbMb = 'pb-2 mb-4';
    cfg.patientMb = 'mb-4 pb-2';
    cfg.footerPt = 'pt-4';
    cfg.numSize = 'text-[11.5px]';
    cfg.titleSize = 'text-[11.5px]';
    cfg.subSize = 'text-[8.5px]';
    cfg.qtdSize = 'text-[9px]';
    cfg.posoSize = 'text-[9.5px]';
    cfg.durSize = 'text-[9px]';
    cfg.obsSize = 'text-[9px]';
    cfg.groupTitleSize = 'text-[10.5px]';
    cfg.pacienteNameSize = 'text-[11.5px]';
    cfg.pacienteLabelSize = 'text-[7.5px]';
    cfg.pacienteValSize = 'text-[9.5px]';
  } else if (count === 6) {
    cfg.padding = 'p-7';
    cfg.spaceY = 'space-y-4';
    cfg.itemMb = 'mb-2.5';
    cfg.groupMb = 'mb-2';
    cfg.headerPbMb = 'pb-2 mb-3';
    cfg.patientMb = 'mb-3 pb-2';
    cfg.footerPt = 'pt-3';
    cfg.numSize = 'text-[11px]';
    cfg.titleSize = 'text-[11px]';
    cfg.subSize = 'text-[8px]';
    cfg.qtdSize = 'text-[8.5px]';
    cfg.posoSize = 'text-[9px]';
    cfg.durSize = 'text-[8.5px]';
    cfg.obsSize = 'text-[8.5px]';
    cfg.groupTitleSize = 'text-[10px]';
    cfg.pacienteNameSize = 'text-[11px]';
    cfg.pacienteLabelSize = 'text-[7px]';
    cfg.pacienteValSize = 'text-[9px]';
  } else if (count === 7) {
    cfg.padding = 'p-6';
    cfg.spaceY = 'space-y-3';
    cfg.itemMb = 'mb-2';
    cfg.groupMb = 'mb-1.5';
    cfg.headerPbMb = 'pb-1.5 mb-2.5';
    cfg.patientMb = 'mb-2.5 pb-1.5';
    cfg.footerPt = 'pt-2';
    cfg.numSize = 'text-[10px]';
    cfg.titleSize = 'text-[10px]';
    cfg.subSize = 'text-[7.5px]';
    cfg.qtdSize = 'text-[8px]';
    cfg.posoSize = 'text-[8.5px]';
    cfg.durSize = 'text-[8px]';
    cfg.obsSize = 'text-[8px]';
    cfg.groupTitleSize = 'text-[9.5px]';
    cfg.pacienteNameSize = 'text-[10px]';
    cfg.pacienteLabelSize = 'text-[7px]';
    cfg.pacienteValSize = 'text-[8.5px]';
  } else if (count === 8) {
    cfg.padding = 'p-5';
    cfg.spaceY = 'space-y-2';
    cfg.itemMb = 'mb-1.5';
    cfg.groupMb = 'mb-1';
    cfg.headerPbMb = 'pb-1 mb-2';
    cfg.patientMb = 'mb-2 pb-1';
    cfg.footerPt = 'pt-1';
    cfg.numSize = 'text-[9.5px]';
    cfg.titleSize = 'text-[9.5px]';
    cfg.subSize = 'text-[7.5px]';
    cfg.qtdSize = 'text-[7.5px]';
    cfg.posoSize = 'text-[8px]';
    cfg.durSize = 'text-[7.5px]';
    cfg.obsSize = 'text-[7.5px]';
    cfg.groupTitleSize = 'text-[9px]';
    cfg.pacienteNameSize = 'text-[9.5px]';
    cfg.pacienteLabelSize = 'text-[6.5px]';
    cfg.pacienteValSize = 'text-[8px]';
  } else if (count >= 9) {
    cfg.padding = 'p-4';
    cfg.spaceY = 'space-y-1.5';
    cfg.itemMb = 'mb-1';
    cfg.groupMb = 'mb-0.5';
    cfg.headerPbMb = 'pb-0.5 mb-1.5';
    cfg.patientMb = 'mb-1.5 pb-0.5';
    cfg.footerPt = 'pt-0.5';
    cfg.numSize = 'text-[9px]';
    cfg.titleSize = 'text-[9px]';
    cfg.subSize = 'text-[7.5px]';
    cfg.qtdSize = 'text-[7px]';
    cfg.posoSize = 'text-[7.5px]';
    cfg.durSize = 'text-[7px]';
    cfg.obsSize = 'text-[7px]';
    cfg.groupTitleSize = 'text-[8.5px]';
    cfg.pacienteNameSize = 'text-[9px]';
    cfg.pacienteLabelSize = 'text-[6.5px]';
    cfg.pacienteValSize = 'text-[7.5px]';
  }

  const normalizarUso = (uso: string): string => {
    const u = (uso || '').trim().toLowerCase();
    if (!u) return 'Uso Oral';
    if (u.includes('sublingual')) return 'Uso Sublingual';
    if (u.includes('oral')) return 'Uso Oral';
    if (u.includes('tópico') || u.includes('topico')) return 'Uso Tópico';
    if (u.includes('nasal')) return 'Uso Nasal';
    if (u.includes('ocular') || u.includes('oftálmico') || u.includes('oftalmico')) return 'Uso Ocular';
    if (u.includes('inalatório') || u.includes('inalatorio') || u.includes('inalação') || u.includes('inalacao')) return 'Uso Inalatório';
    if (u.includes('vaginal')) return 'Uso Vaginal';
    if (u.includes('retal')) return 'Uso Retal';
    return uso.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const gruposUso = Array.from(new Set(medsValidos.map(m => normalizarUso(m.uso))));
  gruposUso.sort((a, b) => {
    if (a === 'Uso Oral') return -1;
    if (b === 'Uso Oral') return 1;
    return a.localeCompare(b);
  });

  const renderMedListItem = (med: typeof medicamentos[0], indexGlobal: number) => {
    return (
      <div key={med.id} className={`${cfg.itemMb} flex gap-2 break-inside-avoid text-left`}>
        <div className={`font-bold ${cfg.numSize} text-gray-400 w-4 pt-0.5 shrink-0`}>
          {indexGlobal + 1}.
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-3 justify-between mb-0.5">
            <div>
              <p className={`font-bold ${cfg.titleSize} text-gray-900 uppercase`}>
                {med.principioAtivo || med.nomeDigitado}
              </p>
              <div className="flex gap-2 items-center ml-0.5 mt-0.5 flex-wrap">
                {med.formaFarmaceutica && (
                  <p className={`${cfg.subSize} text-gray-500 italic`}>{med.formaFarmaceutica}</p>
                )}
                {med.indicacao && (
                  <p className={`${cfg.subSize} text-gray-400 font-medium`}>
                    ({med.indicacao.toLowerCase().startsWith('para') ? med.indicacao : `Para ${med.indicacao.toLowerCase()}`})
                  </p>
                )}
              </div>
            </div>
            {med.quantidade && (
              <p className={`${cfg.qtdSize} text-gray-700 shrink-0 font-bold bg-gray-50 border border-gray-200/50 px-2 py-0.5 rounded`}>
                Qtd.: {med.quantidade}
              </p>
            )}
          </div>
          <div className={`${cfg.posoSize} text-gray-800 leading-normal pl-0.5 mt-0.5`}>
            <span className="font-semibold text-gray-700">Posologia:</span>{' '}
            <div
              className={`inline-block ${cfg.posoSize} text-gray-800`}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(med.posologia) }}
            />
          </div>
          {med.duracao && (
            <p className={`${cfg.durSize} text-gray-700 mt-0.5 pl-0.5 font-medium`}>
              <span className="font-semibold text-gray-500">Duração:</span> {med.duracao}
            </p>
          )}

          {med.observacoes && (
            <div className={`${cfg.obsSize} text-gray-700 mt-0.5 pl-0.5 border-l-2 border-indigo-100 bg-indigo-50/10 py-0.5 px-2 rounded-r`}>
              <span className="font-bold text-indigo-750">Orientação:</span>{' '}
              <div
                className={`inline-block ${cfg.obsSize} text-gray-750`}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(med.observacoes) }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${cfg.padding} text-black bg-white font-sans text-[11px] leading-relaxed relative flex flex-col justify-between`}
      style={{
        width: '210mm',
        height: '297mm',
        maxWidth: '210mm',
        maxHeight: '297mm',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div>
        {/* === CABEÇALHO === */}
        <div className={`border-b-2 border-gray-900 ${cfg.headerPbMb}`}>
          <div className="flex justify-between items-start">
            <div className="text-left">
              <p className={`${count >= 7 ? 'text-[13px]' : 'text-[15px]'} font-bold uppercase tracking-wider text-gray-900`}>
                {MEDICO.nome}
              </p>
              <p className={`${count >= 7 ? 'text-[8px]' : 'text-[9px]'} text-gray-600 mt-0.5`}>{MEDICO.crm}</p>
              <p className={`${count >= 7 ? 'text-[8px]' : 'text-[9px]'} text-gray-600`}>{MEDICO.endereco} — {MEDICO.cidade}</p>
            </div>
            <div className="text-right">
              <p
                className={`font-black uppercase text-gray-900 border-2 border-gray-900 ${count >= 7 ? 'px-2 py-1' : 'px-3 py-1.5'}`}
                style={{ fontSize: count >= 7 ? '13px' : '16px', letterSpacing: '0.1em' }}
              >
                Receita Médica
              </p>
            </div>
          </div>
        </div>

        {/* === PACIENTE === */}
        <div className={`border-b border-gray-300 ${cfg.patientMb}`}>
          <div className="flex gap-6">
            <div className="flex-[3] text-left">
              <span className={`${cfg.pacienteLabelSize} font-bold uppercase text-gray-600 tracking-wide`}>Paciente</span>
              <p className={`${cfg.pacienteNameSize} font-bold text-gray-900 mt-0.5 border-b border-dotted border-gray-500 pb-0.5`}>
                {pacienteNome || '________________________________________________'}
              </p>
            </div>
            {pacienteCpf && (
              <div className="flex-1 text-left">
                <span className={`${cfg.pacienteLabelSize} font-bold uppercase text-gray-600 tracking-wide`}>CPF</span>
                <p className={`${cfg.pacienteValSize} font-normal text-gray-800 mt-0.5 border-b border-dotted border-gray-500 pb-0.5`}>
                  {pacienteCpf}
                </p>
              </div>
            )}
            <div className="flex-1 text-right">
              <span className={`${cfg.pacienteLabelSize} font-bold uppercase text-gray-600 tracking-wide`}>Data</span>
              <p className={`${cfg.pacienteValSize} font-normal text-gray-800 mt-0.5`}>{dataFormatada}</p>
            </div>
          </div>
        </div>

        {/* === MEDICAMENTOS === */}
        <div className={`mb-6 ${cfg.spaceY}`}>
          {isTextoLivre ? (
            <div
              className="text-left text-gray-900 text-[12px] leading-relaxed"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {textoLivre}
            </div>
          ) : (
          gruposUso.map((grupo, gIdx) => {
            const medsDoGrupo = medsValidos.filter(m => normalizarUso(m.uso) === grupo);
            let indexAcumulado = 0;
            for (let i = 0; i < gIdx; i++) {
              indexAcumulado += medsValidos.filter(m => normalizarUso(m.uso) === gruposUso[i]).length;
            }
            return (
              <div key={grupo}>
                <h3 className={`font-bold ${cfg.groupTitleSize} text-indigo-700 uppercase tracking-wider border-b border-indigo-100 pb-1 ${cfg.groupMb} text-left`}>
                  {grupo}
                </h3>
                <div className={cfg.spaceY}>
                  {medsDoGrupo.map((med, idx) => renderMedListItem(med, indexAcumulado + idx))}
                </div>
              </div>
            );
          })
          )}

          {/* Linhas em branco se não houver exames suficientes */}
          {!isTextoLivre && medsValidos.length === 0 && (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`blank-${i}`} className="border-b border-dotted border-gray-300 h-8" />
            ))
          )}
        </div>
      </div>

      {/* === RODAPÉ / ASSINATURA === */}
      <div className={`mt-auto ${cfg.footerPt}`}>
        <div className="flex justify-between items-end">
          <div className={`${count >= 7 ? 'text-[8.5px]' : 'text-[10px]'} text-gray-500 text-left`}>
            <p>{local || 'Fortaleza-CE'}, {dataFormatada}</p>
          </div>
          <div className="text-center">
            <div className={`border-t border-gray-800 ${count >= 7 ? 'pt-1.5 w-56' : 'pt-2 w-64'}`}>
              <p className={`${count >= 7 ? 'text-[10px]' : 'text-[11px]'} font-bold text-gray-900`}>{MEDICO.nome}</p>
              <p className={`${count >= 7 ? 'text-[8px]' : 'text-[9px]'} text-gray-500`}>{MEDICO.crm}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
