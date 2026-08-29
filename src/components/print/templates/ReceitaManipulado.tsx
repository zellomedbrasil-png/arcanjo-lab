import { useManipuladosStore, type FormulaNaReceita } from '../../../store/useManipuladosStore';
import { getAtivo } from '../../../data/ativosManipulados';
import { FORMA_INFO } from '../../../data/formulasManipuladas';

// ── Dados fixos do médico ──────────────────────────────────────
const MEDICO = {
  nome: 'Dr. Roberto Arcanjo',
  crm: 'CRM/CE: 26.155',
  endereco: 'R. João Lobo Filho, 250 - AllMed',
  cidade: 'Fortaleza/Ceará',
};

/** Uma fórmula impressa: composição em linhas, quantidade e posologia. */
function BlocoFormula({
  formula,
  indice,
  compacto,
}: {
  formula: FormulaNaReceita;
  indice: number;
  compacto: boolean;
}) {
  const forma = FORMA_INFO[formula.forma];
  const nomeSize = compacto ? 'text-[9px]' : 'text-[10.5px]';
  const linhaSize = compacto ? 'text-[8px]' : 'text-[9.5px]';
  const posoSize = compacto ? 'text-[7.5px]' : 'text-[9px]';

  return (
    <div className={compacto ? 'mb-1.5' : 'mb-3'}>
      <div className="flex items-baseline gap-1 border-b border-black pb-0.5">
        <span className={`font-bold ${nomeSize}`}>{indice + 1}.</span>
        <span className={`font-bold uppercase ${nomeSize}`}>
          {formula.nome || 'Fórmula manipulada'}
        </span>
        <span className={`${linhaSize} text-gray-500 italic`}>— {forma.rotulo}</span>
      </div>

      {/* Composição: cada ativo em sua linha, com dose alinhada à direita.
          É o formato que a farmácia de manipulação espera ler. */}
      <div className={`${linhaSize} pt-0.5 pl-3`}>
        {formula.componentes.map((c, i) => {
          const ativo = getAtivo(c.ativoId);
          return (
            <div key={`${c.ativoId}-${i}`} className="flex items-baseline gap-1">
              <span className="whitespace-nowrap">{ativo?.nome ?? c.ativoId}</span>
              <span className="flex-1 border-b border-dotted border-gray-400 mx-1" />
              <span className="font-semibold whitespace-nowrap">
                {c.dose} {c.unidade}
              </span>
            </div>
          );
        })}
      </div>

      {/* A quantidade já vem com a unidade ("60 cápsulas"), então NÃO concatenar
          a forma aqui — senão sai "Aviar 60 cápsulas em cápsulas". */}
      <div className={`${posoSize} pl-3 pt-0.5`}>
        <span className="font-semibold">Aviar {formula.quantidade}.</span>
      </div>

      {formula.posologia && (
        <div className={`${posoSize} pl-3 leading-snug`}>
          <span className="font-semibold text-gray-700">Posologia:</span> {formula.posologia}
        </div>
      )}

      {formula.observacoes && (
        <div className={`${posoSize} pl-3 leading-snug text-gray-600 italic`}>
          Obs.: {formula.observacoes}
        </div>
      )}
    </div>
  );
}

/**
 * Uma via da receita. Em 2 vias este bloco se repete, com o rótulo trocado e
 * a caixa de identificação do comprador — que fica EM BRANCO, para ser
 * preenchida à mão na farmácia (mesma decisão da Receita de Controle Especial).
 */
function ViaManipulado({
  rotulo,
  duasVias,
}: {
  rotulo?: '1ª VIA — FARMÁCIA' | '2ª VIA — PACIENTE';
  duasVias: boolean;
}) {
  // Seletores por campo — nunca assinar o store inteiro (ver commit 41ae3d7).
  const pacienteNome = useManipuladosStore((s) => s.pacienteNome);
  const pacienteCpf = useManipuladosStore((s) => s.pacienteCpf);
  const local = useManipuladosStore((s) => s.local);
  const data = useManipuladosStore((s) => s.data);
  const formulas = useManipuladosStore((s) => s.formulas);
  const modoEntrada = useManipuladosStore((s) => s.modoEntrada);
  const textoLivre = useManipuladosStore((s) => s.textoLivre);

  const isTextoLivre = modoEntrada === 'TEXTO_LIVRE' && textoLivre.trim() !== '';
  const dataFormatada = data || new Date().toLocaleDateString('pt-BR');

  // Em 2 vias, cada via ocupa metade da folha — o conteúdo encolhe.
  const compacto = duasVias;

  return (
    <div
      className={`font-sans text-black bg-white ${compacto ? 'px-8 py-4' : 'px-10 py-8'}`}
      style={
        compacto
          ? { height: '14.2cm', boxSizing: 'border-box', overflow: 'hidden', position: 'relative' }
          : { minHeight: '297mm', boxSizing: 'border-box', position: 'relative' }
      }
    >
      {/* ── Cabeçalho do médico ── */}
      <div className={`flex justify-between items-start ${compacto ? 'mb-2' : 'mb-5'}`}>
        <div className="leading-tight">
          <p className={`font-bold ${compacto ? 'text-[11px]' : 'text-[15px]'} uppercase tracking-wide`}>
            {MEDICO.nome}
          </p>
          <p className={compacto ? 'text-[8px]' : 'text-[10px]'}>{MEDICO.crm}</p>
          <p className={`${compacto ? 'text-[7.5px]' : 'text-[9px]'} text-gray-600`}>
            {MEDICO.endereco} — {MEDICO.cidade}
          </p>
        </div>
        <div className="text-right">
          <div
            className={`border border-black font-bold uppercase ${
              compacto ? 'text-[8px] px-1.5 py-0.5' : 'text-[10px] px-3 py-1'
            }`}
            style={{ letterSpacing: '0.08em' }}
          >
            Receita de Manipulação
          </div>
          {rotulo && (
            <p className={`${compacto ? 'text-[8px]' : 'text-[9px]'} font-bold mt-1`}>{rotulo}</p>
          )}
        </div>
      </div>

      {/* ── Paciente ── */}
      <div className={`flex items-end gap-4 border-b border-black pb-0.5 ${compacto ? 'mb-2' : 'mb-4'}`}>
        <div className="flex-[3] text-left">
          <span
            className="block font-bold uppercase text-gray-600 tracking-wide"
            style={{ fontSize: compacto ? '6.5px' : '8px' }}
          >
            Paciente
          </span>
          <span className="font-semibold" style={{ fontSize: compacto ? '9px' : '12px' }}>
            {pacienteNome || ' '}
          </span>
        </div>
        <div className="text-left" style={{ minWidth: compacto ? '85px' : '110px' }}>
          <span
            className="block font-bold uppercase text-gray-600 tracking-wide"
            style={{ fontSize: compacto ? '6.5px' : '8px' }}
          >
            CPF
          </span>
          <span style={{ fontSize: compacto ? '9px' : '12px' }}>{pacienteCpf || ' '}</span>
        </div>
        <div className="text-right">
          <span
            className="block font-bold uppercase text-gray-600 tracking-wide"
            style={{ fontSize: compacto ? '6.5px' : '8px' }}
          >
            Data
          </span>
          <span style={{ fontSize: compacto ? '9px' : '12px' }}>{dataFormatada}</span>
        </div>
      </div>

      {/* ── Prescrição ── */}
      <div>
        <span className={`font-bold ${compacto ? 'text-[9px]' : 'text-[11px]'} block text-left mb-1`}>
          Prescrição:
        </span>

        {isTextoLivre ? (
          <div
            className={`text-left ${compacto ? 'text-[8px]' : 'text-[10px]'} leading-snug`}
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {textoLivre}
          </div>
        ) : formulas.length === 0 ? (
          <div className="border-b border-black" style={{ minHeight: '15px' }} />
        ) : (
          <div style={{ maxHeight: compacto ? '6.2cm' : undefined, overflow: 'hidden' }}>
            {formulas.map((f, i) => (
              <BlocoFormula key={f.id} formula={f} indice={i} compacto={compacto} />
            ))}
          </div>
        )}
      </div>

      {/* ── Data + assinatura ── */}
      {compacto ? (
        <div
          className="absolute left-8 right-8 flex items-end justify-between"
          style={{ bottom: '118px', fontSize: '8px' }}
        >
          <span>
            {local}, {dataFormatada}
          </span>
          <div className="text-center">
            <div className="border-b border-black" style={{ width: '160px', height: '16px' }} />
            <p className="text-[7.5px] mt-0.5 text-gray-700">Assinatura do Emitente</p>
          </div>
        </div>
      ) : (
        <div className="absolute left-10 right-10" style={{ bottom: '2.5cm' }}>
          <div className="flex items-end justify-between text-[10px]">
            <span>
              {local}, {dataFormatada}
            </span>
            <div className="text-center">
              <div className="border-b border-black" style={{ width: '220px', height: '22px' }} />
              <p className="text-[9px] mt-1 font-semibold">{MEDICO.nome}</p>
              <p className="text-[8px] text-gray-700">{MEDICO.crm}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Identificação do comprador (só em 2 vias) ──
          Fica EM BRANCO por decisão: quem compra na farmácia pode não ser o
          paciente, e o formulário oficial é preenchido no ato da compra. */}
      {compacto && (
        <div
          className="flex gap-0 border border-black absolute left-8 right-8"
          style={{ bottom: '10px', fontSize: '8px' }}
        >
          <div className="flex-1 border-r border-black p-1.5 text-left">
            <div
              className="text-center font-bold uppercase border-b border-black mb-1 pb-0.5"
              style={{ fontSize: '8px', letterSpacing: '0.04em' }}
            >
              Identificação do Comprador
            </div>
            <div className="flex items-end gap-1 mb-0.5">
              <span>Nome:</span>
              <div className="flex-1 border-b border-black" style={{ minHeight: '12px' }} />
            </div>
            <div className="flex items-end gap-1 mb-0.5">
              <span className="shrink-0">CPF:</span>
              <div className="flex-1 border-b border-black" style={{ minHeight: '12px' }} />
            </div>
            <div className="flex items-end gap-1 mb-0.5">
              <span>End.:</span>
              <div className="flex-1 border-b border-black" style={{ minHeight: '12px' }} />
            </div>
            <div className="flex items-end gap-1">
              <span>Telefone:</span>
              <div className="flex-1 border-b border-black" style={{ minHeight: '12px' }} />
            </div>
          </div>

          <div className="flex-1 p-1.5 flex flex-col justify-between">
            <div
              className="text-center font-bold uppercase border-b border-black mb-1 pb-0.5"
              style={{ fontSize: '8px', letterSpacing: '0.04em' }}
            >
              Identificação do Fornecedor
            </div>
            <div className="flex-1" />
            <div className="border-t border-black pt-0.5 text-center" style={{ fontSize: '8px' }}>
              ASSINATURA DO FARMACÊUTICO&nbsp;&nbsp;DATA&nbsp;&nbsp;___/___/___
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Receita de manipulação em A4.
 * `vias` vem do cálculo derivado dos ativos (viasNecessarias), nunca de escolha
 * manual: um ativo C1/C5 obriga as 2 vias.
 */
export default function ReceitaManipulado({ vias = 1 }: { vias?: 1 | 2 }) {
  if (vias === 1) {
    return (
      <div
        className="bg-white"
        style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', boxSizing: 'border-box' }}
      >
        <ViaManipulado duasVias={false} />
      </div>
    );
  }

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
      <ViaManipulado rotulo="1ª VIA — FARMÁCIA" duasVias />

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

      <ViaManipulado rotulo="2ª VIA — PACIENTE" duasVias />
    </div>
  );
}
