import { useReceitaStore, type MedicamentoReceita } from '../../../store/useReceitaStore';
import { renderMarkdown } from '../../../utils/markdown';

// ── Dados fixos do médico ──────────────────────────────────────
const MEDICO = {
  nome: 'Dr. Roberto Arcanjo',
  crm: 'CRM/CE: 26.155',
  endereco: 'R. João Lobo Filho, 250 - AllMed',
  cidade: 'Fortaleza/Ceará',
};

// ── Uma via (bloco que se repete 2x) ──────────────────────────
function ViaReceita({ rotulo, medicamentosOverride, textoLivre }: { rotulo: '1ª VIA — FARMÁCIA' | '2ª VIA — PACIENTE'; medicamentosOverride?: MedicamentoReceita[]; textoLivre?: string }) {
  const store = useReceitaStore();
  const medicamentos = medicamentosOverride || store.medicamentos;
  const isTextoLivre = !!(textoLivre && textoLivre.trim());
  const {
    pacienteNome, pacienteEndereco, pacienteCep, pacienteCidade, pacienteUf,
    pacienteCpf, pacienteTelefone, data
  } = store;

  const enderecoCompleto = [
    pacienteEndereco,
    pacienteCep ? `CEP: ${pacienteCep}` : '',
  ].filter(Boolean).join(' — ');

  const medsComConteudo = medicamentos.filter((m) => m.principioAtivo || m.nomeDigitado);
  const count = medsComConteudo.length;

  const cfg = {
    px: 'px-8',
    py: 'py-5',
    titleMb: 'mb-2',
    headerMb: 'mb-2',
    contentSpaceY: 'space-y-1',
    itemMb: 'mb-1',
    prescricaoLabelSize: 'text-[9px]',
    medTitleSize: 'text-[9px]',
    medSubSize: 'text-[7.5px]',
    posoSize: 'text-[8px]',
    obsSize: 'text-[7.5px]',
    bottomAssinatura: '135px',
    maxHeight: '5.5cm',
  };

  if (count === 4) {
    cfg.py = 'py-4';
    cfg.titleMb = 'mb-1.5';
    cfg.headerMb = 'mb-1.5';
    cfg.contentSpaceY = 'space-y-0.5';
    cfg.itemMb = 'mb-0.5';
    cfg.medTitleSize = 'text-[8.5px]';
    cfg.medSubSize = 'text-[7px]';
    cfg.posoSize = 'text-[7.5px]';
    cfg.obsSize = 'text-[7px]';
    cfg.bottomAssinatura = '130px';
    cfg.maxHeight = '5.8cm';
  } else if (count === 5) {
    cfg.px = 'px-6';
    cfg.py = 'py-3.5';
    cfg.titleMb = 'mb-1';
    cfg.headerMb = 'mb-1';
    cfg.contentSpaceY = 'space-y-0.5';
    cfg.itemMb = 'mb-0.5';
    cfg.medTitleSize = 'text-[8px]';
    cfg.medSubSize = 'text-[6.5px]';
    cfg.posoSize = 'text-[7px]';
    cfg.obsSize = 'text-[6.5px]';
    cfg.bottomAssinatura = '125px';
    cfg.maxHeight = '6.0cm';
  } else if (count >= 6) {
    cfg.px = 'px-6';
    cfg.py = 'py-3';
    cfg.titleMb = 'mb-0.5';
    cfg.headerMb = 'mb-0.5';
    cfg.contentSpaceY = 'space-y-0.5';
    cfg.itemMb = 'mb-0';
    cfg.medTitleSize = 'text-[7.5px]';
    cfg.medSubSize = 'text-[6px]';
    cfg.posoSize = 'text-[6.5px]';
    cfg.obsSize = 'text-[6px]';
    cfg.bottomAssinatura = '120px';
    cfg.maxHeight = '6.2cm';
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

  const gruposUso = Array.from(new Set(medsComConteudo.map(m => normalizarUso(m.uso))));
  gruposUso.sort((a, b) => {
    if (a === 'Uso Oral') return -1;
    if (b === 'Uso Oral') return 1;
    return a.localeCompare(b);
  });

  const renderMedRow = (med: typeof medicamentos[0], indexGlobal: number) => {
    return (
      <div key={med.id} className={`text-left ${cfg.itemMb}`}>
        {/* Medicamento + Qtd — linha contínua, largura total */}
        <div className="border-b border-black pb-0.5 flex justify-between items-baseline gap-2" style={{ minHeight: '13px' }}>
          <div className="flex-1 min-w-0">
            <span className={`font-bold ${cfg.medTitleSize}`}>{indexGlobal + 1}. </span>
            <span className={`font-bold uppercase ${cfg.medTitleSize}`}>{med.principioAtivo || med.nomeDigitado}</span>
            {med.formaFarmaceutica && <span className={`${cfg.medSubSize} text-gray-500 italic`}> — {med.formaFarmaceutica}</span>}
            {med.indicacao && (
              <span className={`${cfg.medSubSize} text-gray-400 font-medium ml-1`}>
                ({med.indicacao.toLowerCase().startsWith('para') ? med.indicacao : `Para ${med.indicacao.toLowerCase()}`})
              </span>
            )}
          </div>
          {med.quantidade && <span className={`${cfg.medSubSize} font-bold shrink-0 ml-2`}>Qtd.: {med.quantidade}</span>}
        </div>
        <div className={`${cfg.posoSize} text-gray-800 pt-0.5 pb-0.5 border-b border-black w-full leading-snug`}>
          <span className="font-semibold text-gray-700">Posologia:</span>{' '}
          <div
            className={`inline ${cfg.posoSize} text-gray-855`}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(med.posologia) }}
          />
          {med.duracao && <span className={`text-gray-600 ${cfg.medSubSize}`}> — {med.duracao}</span>}
          {med.observacoes && (
            <div className={`block ${cfg.obsSize} text-gray-650 bg-gray-50/50 px-1 border-l-2 border-indigo-100 mt-0.5`}>
              <span className="font-semibold text-indigo-755">Obs.:</span>{' '}
              <div
                className={`inline ${cfg.obsSize}`}
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
      className={`font-sans text-black bg-white ${cfg.px} ${cfg.py}`}
      style={{ height: '14.2cm', boxSizing: 'border-box', overflow: 'hidden', position: 'relative' }}
    >
      {/* ── Título ── */}
      <h1
        className={`text-center font-black uppercase ${cfg.titleMb}`}
        style={{
          fontSize: count >= 5 ? '11px' : '13px',
          letterSpacing: '0.2em',
          fontFamily: 'serif',
        }}
      >
        RECEITUÁRIO&nbsp;&nbsp;CONTROLE&nbsp;&nbsp;ESPECIAL
      </h1>

      {/* ── Cabeçalho: ID Emitente + Rótulo da Via ── */}
      <div className={`flex items-start gap-3 ${cfg.headerMb}`}>
        {/* Box Identificação */}
        <div
          className="border border-black text-[9px] leading-tight text-left"
          style={{ minWidth: count >= 5 ? '220px' : '250px', padding: count >= 5 ? '3px 5px' : '4px 6px' }}
        >
          <div
            className="text-center font-bold uppercase mb-0.5 border-b border-black pb-0.5"
            style={{ fontSize: count >= 5 ? '7px' : '7.5px', letterSpacing: '0.05em' }}
          >
            IDENTIFICAÇÃO DO EMITENTE
          </div>
          <p className="font-bold text-[10px] mb-0">{MEDICO.nome}</p>
          <p className="mb-0">{MEDICO.crm}</p>
          <p className="mb-0 text-[8px]">{MEDICO.endereco}</p>
          <p className="text-[8px]">{MEDICO.cidade}</p>
        </div>

        {/* Rótulo da via */}
        <div className="text-right ml-auto leading-tight pt-1">
          <p className="text-[9px] font-bold text-gray-900">{rotulo.split('—')[0].trim()}</p>
          <p className="text-[8px] text-gray-600" style={{ marginTop: '1px' }}>
            {rotulo === '1ª VIA — FARMÁCIA' ? '2ª VIA — PACIENTE' : '1ª VIA — FARMÁCIA'}
          </p>
        </div>
      </div>

      {/* ── Prescrição ── */}
      <div style={{ fontSize: '9px' }}>
        <span className={`font-bold ${cfg.prescricaoLabelSize} block text-left`}>Prescrição:</span>
        <div className={`w-full mt-0.5 overflow-hidden ${cfg.contentSpaceY}`} style={{ maxHeight: cfg.maxHeight }}>
          {isTextoLivre ? (
            <div
              className={`text-left text-black ${cfg.posoSize} leading-snug`}
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {textoLivre}
            </div>
          ) : (
          gruposUso.map((grupo, gIdx) => {
            const medsDoGrupo = medsComConteudo.filter(m => normalizarUso(m.uso) === grupo);
            let indexAcumulado = 0;
            for (let i = 0; i < gIdx; i++) {
              indexAcumulado += medsComConteudo.filter(m => normalizarUso(m.uso) === gruposUso[i]).length;
            }
            return (
              <div key={grupo} className={gIdx > 0 ? 'mt-1' : ''}>
                <div className="text-[7.5px] font-bold text-indigo-700 uppercase tracking-wider mb-0.5 text-left">{grupo}</div>
                <div>
                  {medsDoGrupo.map((med, idx) => renderMedRow(med, indexAcumulado + idx))}
                </div>
              </div>
            );
          })
          )}

          {!isTextoLivre && medsComConteudo.length === 0 && (
            <div className="border-b border-black" style={{ minHeight: '15px' }} />
          )}
        </div>
      </div>

      {/* ── Data + Assinatura — bem acima do bloco de identificações ── */}
      <div
        className={`flex items-end gap-4 absolute ${cfg.px.includes('px-6') ? 'left-6 right-6' : 'left-8 right-8'}`}
        style={{ bottom: cfg.bottomAssinatura, fontSize: count >= 5 ? '7.5px' : '8.5px' }}
      >
        <div className="flex items-end gap-0.5">
          <div className="border-b border-black w-8 text-center" style={{ fontSize: count >= 5 ? '7.5px' : '8.5px' }}>{data?.split('/')[0] || '__'}</div>
          <span>/</span>
          <div className="border-b border-black w-10 text-center" style={{ fontSize: count >= 5 ? '7.5px' : '8.5px' }}>{data?.split('/')[1] || '____'}</div>
          <span>/</span>
          <div className="border-b border-black w-12 text-center" style={{ fontSize: count >= 5 ? '7.5px' : '8.5px' }}>{data?.split('/')[2] || '______'}</div>
          <span className="ml-1 text-gray-600 text-[8px]">Data</span>
        </div>

        <div className="flex-1 text-right">
          <div className="inline-block text-center">
            <div className="border-b border-black" style={{ width: count >= 5 ? '150px' : '180px', height: '18px' }} />
            <p className="text-[7.5px] mt-0.5 text-gray-700">Assinatura do Emitente</p>
          </div>
        </div>
      </div>

      {/* ── Boxes inferiores: Comprador + Fornecedor ── */}
      <div
        className={`flex gap-0 border border-black absolute ${cfg.px.includes('px-6') ? 'left-6 right-6' : 'left-8 right-8'}`}
        style={{ bottom: count >= 6 ? '6px' : '10px', fontSize: count >= 6 ? '7px' : '8px' }}
      >
        {/* Identificação do Comprador */}
        <div className="flex-1 border-r border-black p-1.5 text-left">
          <div
            className="text-center font-bold uppercase border-b border-black mb-1 pb-0.5"
            style={{ fontSize: count >= 6 ? '7.5px' : '8px', letterSpacing: '0.04em' }}
          >
            IDENTIFICAÇÃO DO COMPRADOR
          </div>
          <div className="flex items-end gap-1 mb-0.5">
            <span>Nome:</span>
            <div className="flex-1 border-b border-black" style={{ minHeight: '12px' }}>
              {pacienteNome && <span className="text-[8.5px] font-semibold">{pacienteNome}</span>}
            </div>
          </div>
          <div className="flex items-end gap-3 mb-0.5">
            <div className="flex items-end gap-1 flex-1">
              <span className="shrink-0">CPF:</span>
              <div className="flex-1 border-b border-black" style={{ minHeight: '12px' }}>
                {pacienteCpf && <span>{pacienteCpf}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-end gap-1 mb-0.5">
            <span>End.:</span>
            <div className="flex-1 border-b border-black" style={{ minHeight: '12px' }}>
              {enderecoCompleto && <span className="text-[8px]">{enderecoCompleto}</span>}
            </div>
          </div>
          <div className="flex items-end gap-3 mb-0.5">
            <div className="flex items-end gap-1 flex-1">
              <span className="shrink-0">Cidade:</span>
              <div className="flex-1 border-b border-black" style={{ minHeight: '12px' }}>
                {pacienteCidade && <span>{pacienteCidade}</span>}
              </div>
            </div>
            <div className="flex items-end gap-1">
              <span className="shrink-0">UF:</span>
              <div className="border-b border-black w-8" style={{ minHeight: '12px' }}>
                {pacienteUf && <span>{pacienteUf}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-end gap-1">
            <span>Telefone:</span>
            <div className="flex-1 border-b border-black" style={{ minHeight: '12px' }}>
              {pacienteTelefone && <span>{pacienteTelefone}</span>}
            </div>
          </div>
        </div>

        {/* Identificação do Fornecedor */}
        <div className="flex-1 p-1.5 flex flex-col justify-between">
          <div
            className="text-center font-bold uppercase border-b border-black mb-1 pb-0.5"
            style={{ fontSize: count >= 6 ? '7.5px' : '8px', letterSpacing: '0.04em' }}
          >
            IDENTIFICAÇÃO DO FORNECEDOR
          </div>
          <div className="flex-1" />
          <div className="border-t border-black pt-0.5 text-[8px] text-center" style={{ fontSize: count >= 6 ? '7.5px' : '8px' }}>
            ASSINATURA DO FARMACÊUTICO&nbsp;&nbsp;DATA&nbsp;&nbsp;___/___/___
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente exportado: A4 com 2 vias ───────────────────────
export default function ReceitaControleEspecial({ medicamentosOverride, textoLivre }: { medicamentosOverride?: MedicamentoReceita[]; textoLivre?: string } = {}) {
  return (
    <div
      className="bg-white"
      style={{
        width: '210mm',
        height: '297mm',
        maxWidth: '210mm',
        maxHeight: '297mm',
        margin: '0 auto',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* 1ª VIA — FARMÁCIA */}
      <ViaReceita rotulo="1ª VIA — FARMÁCIA" medicamentosOverride={medicamentosOverride} textoLivre={textoLivre} />

      {/* Linha de corte */}
      <div
        className="flex items-center gap-3 no-print-hidden"
        style={{
          borderTop: '1px dashed #6b7280',
          borderBottom: '1px dashed #6b7280',
          padding: '3px 32px',
          backgroundColor: '#f9fafb',
        }}
      >
        <span style={{ color: '#9ca3af', fontSize: '11px' }}>✂</span>
        <span
          style={{
            color: '#9ca3af',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            flex: 1,
            textAlign: 'center',
          }}
        >
          Recorte aqui
        </span>
        <span style={{ color: '#9ca3af', fontSize: '11px' }}>✂</span>
      </div>

      {/* 2ª VIA — PACIENTE */}
      <ViaReceita rotulo="2ª VIA — PACIENTE" medicamentosOverride={medicamentosOverride} textoLivre={textoLivre} />
    </div>
  );
}
