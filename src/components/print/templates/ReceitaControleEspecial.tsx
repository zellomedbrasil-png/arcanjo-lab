import { useReceitaStore } from '../../../store/useReceitaStore';

// ── Dados fixos do médico ──────────────────────────────────────
const MEDICO = {
  nome: 'Dr. Roberto Arcanjo',
  crm: 'CRM/CE: 26.155',
  endereco: 'R. João Lobo Filho, 250 - AllMed',
  cidade: 'Fortaleza/Ceará',
};

// ── Uma via (bloco que se repete 2x) ──────────────────────────
function ViaReceita({ rotulo }: { rotulo: '1ª VIA — FARMÁCIA' | '2ª VIA — PACIENTE' }) {
  const {
    pacienteNome, pacienteEndereco, pacienteCep, pacienteCidade, pacienteUf,
    pacienteCpf, pacienteTelefone, medicamentos, data,
  } = useReceitaStore();

  const enderecoCompleto = [
    pacienteEndereco,
    pacienteCep ? `CEP: ${pacienteCep}` : '',
  ].filter(Boolean).join(' — ');

  const medsComConteudo = medicamentos.filter((m) => m.principioAtivo || m.nomeDigitado);

  return (
    <div
      className="font-sans text-black bg-white px-8 py-6"
      style={{ height: '14.2cm', boxSizing: 'border-box', overflow: 'hidden', position: 'relative' }}
    >
      {/* ── Título ── */}
      <h1
        className="text-center font-black uppercase mb-4"
        style={{
          fontSize: '15px',
          letterSpacing: '0.22em',
          fontFamily: 'serif',
        }}
      >
        RECEITUÁRIO&nbsp;&nbsp;CONTROLE&nbsp;&nbsp;ESPECIAL
      </h1>

      {/* ── Cabeçalho: ID Emitente + Rótulo da Via ── */}
      <div className="flex items-start gap-4 mb-4">
        {/* Box Identificação */}
        <div
          className="border border-black text-[9.5px] leading-tight"
          style={{ minWidth: '260px', padding: '5px 8px' }}
        >
          <div
            className="text-center font-bold uppercase mb-0.5 border-b border-black pb-0.5"
            style={{ fontSize: '8px', letterSpacing: '0.05em' }}
          >
            IDENTIFICAÇÃO DO EMITENTE
          </div>
          <p className="font-bold text-[11px] mb-0">{MEDICO.nome}</p>
          <p className="mb-0">{MEDICO.crm}</p>
          <p className="mb-0 text-[8.5px]">{MEDICO.endereco}</p>
          <p className="text-[8.5px]">{MEDICO.cidade}</p>
        </div>

        {/* Rótulo da via */}
        <div className="text-[11px] font-bold text-right ml-auto leading-loose pt-1">
          <p>{rotulo.split('—')[0].trim()}</p>
          <p style={{ marginTop: '-2px' }}>
            {rotulo === '1ª VIA — FARMÁCIA' ? '2ª VIA — PACIENTE' : '1ª VIA — FARMÁCIA'}
          </p>
        </div>
      </div>

      {/* ── Campos Paciente e Endereço ── */}
      <div className="mb-3" style={{ fontSize: '11px' }}>
        <div className="flex items-end gap-2 mb-2">
          <span className="font-bold shrink-0">Paciente:</span>
          <div
            className="flex-1 border-b border-black"
            style={{ minHeight: '16px' }}
          >
            {pacienteNome && <span className="text-[11px]">{pacienteNome}</span>}
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className="font-bold shrink-0">Endereço:</span>
          <div className="flex-1 border-b border-black" style={{ minHeight: '16px' }}>
            {enderecoCompleto && <span className="text-[10px]">{enderecoCompleto}</span>}
          </div>
        </div>
      </div>

      {/* ── Prescrição ── */}
      <div style={{ fontSize: '11px', marginBottom: '2px' }}>
        <div className="flex items-start gap-2">
          <span className="font-bold shrink-0 mt-0.5">Prescrição:</span>
          <div className="flex-1">
            {medsComConteudo.length > 0 ? (
              medsComConteudo.map((med, idx) => (
                <div key={med.id} className="border-b border-black mb-0.5 pb-0.5" style={{ minHeight: '18px' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold">{idx + 1}. </span>
                      <span className="font-bold uppercase">{med.principioAtivo || med.nomeDigitado}</span>
                      {med.formaFarmaceutica && <span className="text-[10px]"> — {med.formaFarmaceutica}</span>}
                    </div>
                    {med.quantidade && <span className="text-[10px] font-bold">Qtd.: {med.quantidade}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="border-b border-black" style={{ minHeight: '18px' }} />
            )}
          </div>
        </div>

        {/* Posologia de cada medicamento */}
        {medsComConteudo.map((med) => (
          <div key={`pos-${med.id}`} className="border-b border-black mb-0.5" style={{ minHeight: '18px', paddingLeft: '86px' }}>
            {med.posologia && (
              <span className="text-[10px] text-gray-800">
                {med.uso && <span className="italic">{med.uso}. </span>}
                {med.posologia}
                {med.quantidade && ` — Qtd.: ${med.quantidade}`}
                {med.duracao && ` — ${med.duracao}`}
              </span>
            )}
          </div>
        ))}

        {/* Linhas em branco extras (mínimo 5 no total) */}
        {Array.from({ length: Math.max(0, 5 - medsComConteudo.length * 2) }).map((_, i) => (
          <div key={`blank-${i}`} className="border-b border-black mb-0.5" style={{ minHeight: '18px' }} />
        ))}
      </div>

      {/* ── Data + Assinatura ── */}
      <div
        className="flex items-end gap-6 mt-2"
        style={{ fontSize: '10px' }}
      >
        <div className="flex items-end gap-1">
          <div className="border-b border-black w-10 text-center">{data?.split('/')[0] || '__'}</div>
          <span>/</span>
          <div className="border-b border-black w-12 text-center">{data?.split('/')[1] || '____'}</div>
          <span>/</span>
          <div className="border-b border-black w-14 text-center">{data?.split('/')[2] || '______'}</div>
          <span className="ml-1 text-gray-500 text-[9px]">Data</span>
        </div>

        <div className="flex-1 text-right">
          <div className="inline-block text-center">
            <div className="border-b border-black" style={{ width: '220px', height: '28px' }} />
            <p className="text-[9px] mt-0.5">Assinatura do Emitente</p>
          </div>
        </div>
      </div>

      {/* ── Boxes inferiores: Comprador + Fornecedor ── */}
      <div
        className="flex gap-0 border border-black absolute left-8 right-8"
        style={{ bottom: '14px', fontSize: '10px' }}
      >
        {/* Identificação do Comprador */}
        <div className="flex-1 border-r border-black p-2">
          <div
            className="text-center font-bold uppercase border-b border-black mb-1.5 pb-1"
            style={{ fontSize: '9px', letterSpacing: '0.04em' }}
          >
            IDENTIFICAÇÃO DO COMPRADOR
          </div>
          <div className="flex items-end gap-1 mb-0.5">
            <span>Nome:</span>
            <div className="flex-1 border-b border-black" style={{ minHeight: '14px' }} />
          </div>
          <div className="flex items-end gap-3 mb-0.5">
            <div className="flex items-end gap-1 flex-1">
              <span className="shrink-0">CPF:</span>
              <div className="flex-1 border-b border-black" style={{ minHeight: '14px' }}>
                {pacienteCpf && <span>{pacienteCpf}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-end gap-1 mb-0.5">
            <span>End.:</span>
            <div className="flex-1 border-b border-black" style={{ minHeight: '14px' }}>
              {pacienteEndereco && <span className="text-[9px]">{pacienteEndereco}</span>}
            </div>
          </div>
          <div className="flex items-end gap-3 mb-0.5">
            <div className="flex items-end gap-1 flex-1">
              <span className="shrink-0">Cidade:</span>
              <div className="flex-1 border-b border-black" style={{ minHeight: '14px' }}>
                {pacienteCidade && <span>{pacienteCidade}</span>}
              </div>
            </div>
            <div className="flex items-end gap-1">
              <span className="shrink-0">UF:</span>
              <div className="border-b border-black w-8" style={{ minHeight: '14px' }}>
                {pacienteUf && <span>{pacienteUf}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-end gap-1">
            <span>Telefone:</span>
            <div className="flex-1 border-b border-black" style={{ minHeight: '14px' }}>
              {pacienteTelefone && <span>{pacienteTelefone}</span>}
            </div>
          </div>
        </div>

        {/* Identificação do Fornecedor */}
        <div className="flex-1 p-2 flex flex-col justify-between">
          <div
            className="text-center font-bold uppercase border-b border-black mb-1 pb-1"
            style={{ fontSize: '9px', letterSpacing: '0.04em' }}
          >
            IDENTIFICAÇÃO DO FORNECEDOR
          </div>
          <div className="flex-1" />
          <div className="border-t border-black pt-0.5 text-[9px] text-center">
            ASSINATURA DO FARMACÊUTICO&nbsp;&nbsp;DATA&nbsp;&nbsp;___/___/___
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente exportado: A4 com 2 vias ───────────────────────
export default function ReceitaControleEspecial() {
  return (
    <div className="bg-white" style={{ width: '21cm', minHeight: '29.7cm', margin: '0 auto' }}>
      {/* 1ª VIA — FARMÁCIA */}
      <ViaReceita rotulo="1ª VIA — FARMÁCIA" />

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
      <ViaReceita rotulo="2ª VIA — PACIENTE" />
    </div>
  );
}
