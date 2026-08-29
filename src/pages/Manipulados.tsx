import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical, Search, X, Plus, Printer, Trash2, ShieldAlert,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useManipuladosStore, viasNecessarias } from '../store/useManipuladosStore';
import { normalizarAtivo } from '../data/ativosManipulados';
import {
  FORMULAS, AREA_INFO, EVIDENCIA_INFO, getAtivoNomes,
  motivosControleEspecial,
  type AreaFormula, type NivelEvidencia,
} from '../data/formulasManipuladas';
import FormulaCard from '../components/manipulados/FormulaCard';
import MontadorFormula from '../components/manipulados/MontadorFormula';
import ReceitaManipulado from '../components/print/templates/ReceitaManipulado';
import { formatCpf } from '../lib/formatters';

type FiltroArea = AreaFormula | 'TODAS';
type FiltroEvidencia = NivelEvidencia | 'TODAS';

export default function Manipulados() {
  const navigate = useNavigate();

  // Seletores por campo — nunca assinar o store inteiro.
  const pacienteNome = useManipuladosStore((s) => s.pacienteNome);
  const pacienteCpf = useManipuladosStore((s) => s.pacienteCpf);
  const pacienteEndereco = useManipuladosStore((s) => s.pacienteEndereco);
  const pacienteTelefone = useManipuladosStore((s) => s.pacienteTelefone);
  const data = useManipuladosStore((s) => s.data);
  const local = useManipuladosStore((s) => s.local);
  const formulas = useManipuladosStore((s) => s.formulas);
  const modoEntrada = useManipuladosStore((s) => s.modoEntrada);
  const textoLivre = useManipuladosStore((s) => s.textoLivre);
  const setPacienteManipulado = useManipuladosStore((s) => s.setPacienteManipulado);
  const addFormulaVazia = useManipuladosStore((s) => s.addFormulaVazia);
  const addFormulaDaBiblioteca = useManipuladosStore((s) => s.addFormulaDaBiblioteca);
  const setModoEntrada = useManipuladosStore((s) => s.setModoEntrada);
  const setTextoLivre = useManipuladosStore((s) => s.setTextoLivre);
  const resetManipulado = useManipuladosStore((s) => s.resetManipulado);

  const [bibliotecaAberta, setBibliotecaAberta] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroArea, setFiltroArea] = useState<FiltroArea>('TODAS');
  const [filtroEvid, setFiltroEvid] = useState<FiltroEvidencia>('TODAS');

  const resultados = useMemo(() => {
    const q = normalizarAtivo(busca);
    return FORMULAS.filter((f) => {
      if (filtroArea !== 'TODAS' && f.area !== filtroArea) return false;
      if (filtroEvid !== 'TODAS' && f.evidencia !== filtroEvid) return false;
      if (!q) return true;
      // Casa também contra os ativos: buscar "psyllium" acha as fórmulas que o usam.
      const ativos = getAtivoNomes(f.componentes);
      return normalizarAtivo(`${f.nome} ${f.indicacao} ${f.cid10 ?? ''} ${ativos}`).includes(q);
    });
  }, [busca, filtroArea, filtroEvid]);

  const vias = viasNecessarias(formulas);
  const motivos = useMemo(
    () => formulas.flatMap((f) => motivosControleEspecial(f.componentes)),
    [formulas]
  );

  const isTextoLivre = modoEntrada === 'TEXTO_LIVRE';
  const temConteudo = isTextoLivre ? textoLivre.trim() !== '' : formulas.length > 0;
  const podeImprimir = pacienteNome.trim() !== '' && temConteudo;

  const inputCls =
    'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all shadow-sm placeholder-gray-300 bg-white';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* ── Cabeçalho ── */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-neutral-text flex items-center gap-2">
              <FlaskConical className="text-indigo-600" size={22} />
              Manipulados
            </h1>
            <p className="text-xs text-neutral-text-muted mt-1">
              Acervo La Saluté Pharmacy · {FORMULAS.length} protocolos com nível de evidência
              declarado
            </p>
          </div>
          <button
            type="button"
            onClick={resetManipulado}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
            Limpar tudo
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* ── Coluna de edição ── */}
          <div className="xl:col-span-3">
            {/* Paciente */}
            <div className="bg-white border border-neutral-border rounded-2xl p-5 mb-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase text-indigo-700 tracking-wider mb-3">
                Dados do Paciente
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-wide mb-1">
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    value={pacienteNome}
                    onChange={(e) => setPacienteManipulado({ pacienteNome: e.target.value })}
                    placeholder="Nome completo do paciente"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-wide mb-1">
                    CPF {vias === 2 && <span className="text-amber-600">*</span>}
                  </label>
                  <input
                    type="text"
                    value={pacienteCpf}
                    onChange={(e) =>
                      setPacienteManipulado({ pacienteCpf: formatCpf(e.target.value) })
                    }
                    placeholder="000.000.000-00"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-wide mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={pacienteTelefone}
                    onChange={(e) => setPacienteManipulado({ pacienteTelefone: e.target.value })}
                    placeholder="(85) 00000-0000"
                    className={inputCls}
                  />
                </div>
                {vias === 2 && (
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-wide mb-1">
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={pacienteEndereco}
                      onChange={(e) => setPacienteManipulado({ pacienteEndereco: e.target.value })}
                      placeholder="Rua, número, bairro"
                      className={inputCls}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-wide mb-1">
                    Data
                  </label>
                  <input
                    type="text"
                    value={data}
                    onChange={(e) => setPacienteManipulado({ data: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-wide mb-1">
                    Local
                  </label>
                  <input
                    type="text"
                    value={local}
                    onChange={(e) => setPacienteManipulado({ local: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Alerta de controle especial — derivado, não escolhido */}
            {motivos.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ShieldAlert size={14} className="text-amber-700 shrink-0" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
                    Esta receita exige 2 vias
                  </span>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {[...new Set(motivos)].map((m) => (
                    <li key={m} className="text-[10.5px] text-amber-900 leading-snug">
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Biblioteca de fórmulas */}
            <div className="bg-gradient-to-br from-indigo-50/20 via-indigo-50/10 to-transparent border border-indigo-100/50 rounded-2xl p-5 mb-6 shadow-sm">
              <div className="flex justify-between items-center gap-3 mb-4">
                <span className="text-xs font-bold uppercase text-indigo-700 tracking-wider">
                  Biblioteca de Protocolos
                </span>
                <button
                  type="button"
                  onClick={() => setBibliotecaAberta((v) => !v)}
                  className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  {bibliotecaAberta ? 'Recolher' : `Expandir (${FORMULAS.length})`}
                  {bibliotecaAberta ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>

              {bibliotecaAberta && (
                <>
                  <div className="relative mb-3">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar por queixa, indicação, CID ou ativo (ex: constipação, psyllium)..."
                      className="w-full pl-9 pr-9 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                    />
                    {busca && (
                      <button
                        type="button"
                        onClick={() => setBusca('')}
                        aria-label="Limpar busca"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(['TODAS', 'GERIATRIA', 'LONGEVIDADE', 'GASTRO'] as FiltroArea[]).map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setFiltroArea(a)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                          filtroArea === a
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300'
                        }`}
                      >
                        {a === 'TODAS' ? 'Todas as áreas' : AREA_INFO[a]}
                      </button>
                    ))}
                    <span className="w-px bg-gray-200 mx-1" />
                    {(['TODAS', 'ALTA', 'MODERADA', 'BAIXA'] as FiltroEvidencia[]).map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setFiltroEvid(e)}
                        title={e !== 'TODAS' ? EVIDENCIA_INFO[e].descricao : undefined}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                          filtroEvid === e
                            ? 'bg-slate-700 border-slate-700 text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300'
                        }`}
                      >
                        {e === 'TODAS' ? 'Toda evidência' : e}
                      </button>
                    ))}
                  </div>

                  {resultados.length === 0 ? (
                    <p className="text-[11px] text-gray-500 italic py-6 text-center">
                      Nenhum protocolo encontrado para “{busca}”.
                    </p>
                  ) : (
                    <>
                      <span className="block text-[9px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                        {resultados.length} protocolo{resultados.length > 1 ? 's' : ''}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
                        {resultados.map((f) => (
                          <FormulaCard
                            key={f.id}
                            formula={f}
                            onUsar={(formula) => {
                              addFormulaDaBiblioteca(formula);
                              setModoEntrada('MONTADOR');
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Montador / Texto livre */}
            <div className="bg-white border border-neutral-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <span className="text-xs font-bold uppercase text-indigo-700 tracking-wider">
                  Prescrição
                </span>
                <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200/50">
                  {(
                    [
                      ['MONTADOR', 'Montador'],
                      ['TEXTO_LIVRE', 'Texto Livre'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setModoEntrada(id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        modoEntrada === id
                          ? 'bg-white text-indigo-700 shadow-sm'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {isTextoLivre ? (
                <>
                  <p className="text-[10px] text-gray-500 mb-2">
                    A fórmula é impressa <strong>exatamente como digitada</strong>, sem conferência
                    de acervo nem cálculo automático de vias.
                  </p>
                  <textarea
                    value={textoLivre}
                    onChange={(e) => setTextoLivre(e.target.value)}
                    rows={12}
                    placeholder={
                      'Exemplo:\n\n1) Cápsulas\nMagnésio dimalato ......... 300 mg\nPiridoxal-5-fosfato ....... 25 mg\nMelatonina ................ 2 mg\nAviar 60 cápsulas\nTomar 1 cápsula à noite, 30 min antes de deitar.'
                    }
                    className={`${inputCls} font-mono text-xs leading-relaxed`}
                  />
                </>
              ) : (
                <>
                  {formulas.length === 0 && (
                    <p className="text-[11px] text-gray-400 italic mb-3">
                      Nenhuma fórmula ainda. Use um protocolo da biblioteca acima ou monte do zero.
                    </p>
                  )}
                  {formulas.map((f, i) => (
                    <MontadorFormula key={f.id} formulaId={f.id} indice={i} />
                  ))}
                  <button
                    type="button"
                    onClick={addFormulaVazia}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-gray-300 rounded-xl text-xs font-bold text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                  >
                    <Plus size={14} />
                    Nova fórmula em branco
                  </button>
                </>
              )}

              <button
                type="button"
                disabled={!podeImprimir}
                onClick={() => navigate('/manipulados/imprimir')}
                className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Printer size={16} />
                {vias === 2 ? 'Imprimir Receita (2 vias)' : 'Imprimir Receita'}
              </button>
              {!podeImprimir && (
                <p className="text-[10px] text-gray-400 text-center mt-1.5">
                  Preencha o nome do paciente e ao menos uma fórmula.
                </p>
              )}
            </div>
          </div>

          {/* ── Prévia A4 ── */}
          <div className="xl:col-span-2">
            <div className="sticky top-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                  Visualização A4
                </span>
                <span
                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                    vias === 2
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-gray-100 border-gray-200 text-gray-600'
                  }`}
                >
                  {vias === 2 ? '2 vias · C344' : '1 via'}
                </span>
              </div>
              <div className="bg-white border border-neutral-border rounded-xl overflow-hidden shadow-sm">
                <div
                  style={{
                    width: '210mm',
                    transform: 'scale(0.42)',
                    transformOrigin: 'top left',
                    height: vias === 2 ? '125mm' : '125mm',
                  }}
                >
                  <ReceitaManipulado vias={vias} />
                </div>
              </div>
              <p className="text-[9px] text-gray-400 mt-2 text-center">
                Prévia reduzida — a impressão sai em A4.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
