import { useAppStore } from '../../../store/useAppStore';
import { getProcedimentoNome } from '../../../data/procedimentos';
import logoMarca from '../../../assets/logo_particular.svg';

const MEDICO = {
  nome: 'Dr. Roberto Arcanjo',
  crm: 'CRM/CE: 26.155',
  endereco: 'R. João Lobo Filho, 250 — AllMed',
  cidade: 'Fortaleza / Ceará',
};

export default function GuiaParticular() {
  const {
    pacienteNome, pacienteCpf, genero, examesSelecionados,
    procedimentosSelecionados, tipoGuia, justificativa,
  } = useAppStore();

  const isLab = tipoGuia === 'LABORATORIO';
  const dataHoje = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="relative bg-white font-sans text-black h-full overflow-hidden"
      style={{ padding: '40px 44px' }}>

      {/* ── Marca d'água centralizada ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '320px',
          height: '360px',
          opacity: 0.055,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <img src={logoMarca} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      {/* ── Todo o conteúdo acima da marca d'água ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Cabeçalho ── */}
        <div style={{ borderBottom: '2px solid #1a1a1a', paddingBottom: '12px', marginBottom: '18px' }}>
          <div className="flex justify-between items-start">
            <div>
              <p style={{ fontSize: '17px', fontWeight: '800', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#111' }}>
                {MEDICO.nome}
              </p>
              <p style={{ fontSize: '9.5px', color: '#555', marginTop: '2px' }}>{MEDICO.crm}</p>
              <p style={{ fontSize: '9px', color: '#666', marginTop: '1px' }}>
                {MEDICO.endereco} — {MEDICO.cidade}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{
                fontSize: '13px', fontWeight: '800', letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#1a1a1a',
                border: '2px solid #1a1a1a', padding: '5px 12px',
              }}>
                Solicitação de Exames
              </p>
            </div>
          </div>
        </div>

        {/* ── Paciente ── */}
        <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #ddd' }}>
          <div className="flex gap-8 items-end">
            <div style={{ flex: 3 }}>
              <p style={{ fontSize: '8px', fontWeight: '700', textTransform: 'uppercase', color: '#777', letterSpacing: '0.08em', marginBottom: '2px' }}>
                Paciente
              </p>
              <p style={{
                fontSize: '13px', fontWeight: 'normal', color: '#111',
                borderBottom: '1px dotted #aaa', paddingBottom: '2px',
                minWidth: '260px',
              }}>
                {pacienteNome || '________________________________________________'}
              </p>
            </div>
            <div style={{ flex: 1.2 }}>
              <p style={{ fontSize: '8px', fontWeight: '700', textTransform: 'uppercase', color: '#777', letterSpacing: '0.08em', marginBottom: '2px' }}>
                CPF
              </p>
              <p style={{ fontSize: '11px', fontWeight: 'normal', color: '#333', borderBottom: '1px dotted #aaa', paddingBottom: '2px' }}>
                {pacienteCpf || '___.___.___-__'}
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '8px', fontWeight: '700', textTransform: 'uppercase', color: '#777', letterSpacing: '0.08em', marginBottom: '2px' }}>
                Gênero
              </p>
              <p style={{ fontSize: '11px', fontWeight: 'normal', color: '#333', borderBottom: '1px dotted #aaa', paddingBottom: '2px' }}>
                {genero === 'M' ? 'Masculino' : 'Feminino'}
              </p>
            </div>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <p style={{ fontSize: '8px', fontWeight: '700', textTransform: 'uppercase', color: '#777', letterSpacing: '0.08em', marginBottom: '2px' }}>
                Data
              </p>
              <p style={{ fontSize: '11px', fontWeight: 'normal', color: '#333' }}>{dataHoje}</p>
            </div>
          </div>
        </div>

        {/* ── Exames Solicitados ── */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '8px', fontWeight: '700', textTransform: 'uppercase', color: '#777', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Exames Solicitados
          </p>

          {isLab ? (
            <div>
              {examesSelecionados.length > 0 ? (
                examesSelecionados.map((exame, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    borderBottom: '1px solid #e8e8e8', padding: '4px 0',
                    fontSize: '11px',
                  }}>
                    <span style={{ color: '#2ABCBE', fontWeight: '700', fontSize: '9px', minWidth: '16px' }}>
                      {idx + 1}.
                    </span>
                    <span style={{ fontWeight: 'normal', color: '#1a1a1a' }}>{exame}</span>
                  </div>
                ))
              ) : (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ borderBottom: '1px solid #e8e8e8', height: '22px' }} />
                ))
              )}
            </div>
          ) : (
            <div>
              {procedimentosSelecionados.map((proc, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  borderBottom: '1px solid #e8e8e8', padding: '5px 0',
                  fontSize: '11px',
                }}>
                  <span style={{ color: '#2ABCBE', fontWeight: '700', fontSize: '9px', minWidth: '16px' }}>
                    {idx + 1}.
                  </span>
                  <span style={{ fontWeight: 'normal', color: '#1a1a1a' }}>
                    {getProcedimentoNome(proc)}
                  </span>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 4 - procedimentosSelecionados.length) }).map((_, i) => (
                <div key={i} style={{ borderBottom: '1px solid #e8e8e8', height: '22px' }} />
              ))}
            </div>
          )}
        </div>

        {/* ── Indicação Clínica ── */}
        <div style={{
          border: '1px solid #ddd', borderRadius: '4px',
          padding: '10px 12px', marginBottom: '28px',
          backgroundColor: '#fafafa',
        }}>
          <p style={{ fontSize: '8px', fontWeight: '700', textTransform: 'uppercase', color: '#777', letterSpacing: '0.08em', marginBottom: '5px' }}>
            Indicação Clínica / Justificativa
          </p>
          <p style={{ fontSize: '10.5px', color: '#222', lineHeight: '1.5', minHeight: '36px', fontWeight: 'normal' }}>
            {justificativa || ''}
          </p>
        </div>

        {/* ── Rodapé: Local + Assinatura ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
          <div>
            <p style={{ fontSize: '9.5px', color: '#666' }}>
              Fortaleza — CE, {dataHoje}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '220px', borderTop: '2px solid #1a1a1a', paddingTop: '6px' }}>
              <p style={{ fontSize: '10.5px', fontWeight: '700', color: '#111' }}>{MEDICO.nome}</p>
              <p style={{ fontSize: '8.5px', color: '#666', marginTop: '1px' }}>{MEDICO.crm}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
