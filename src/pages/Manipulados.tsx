import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical, Search, X, Plus, Printer, Trash2, ShieldAlert,
  ChevronDown, ChevronUp, User,
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
import { useAppStore } from '../store/useAppStore';
import { useRecentPatientsStore } from '../store/useRecentPatientsStore';

// Biblioteca aberta/fechada lembrada neste aparelho.
const CHAVE_BIBLIOTECA = 'arcanjo-lab-manipulados-biblioteca';
const lerBiblioteca = () => {
  try {
    return localStorage.getItem(CHAVE_BIBLIOTECA) !== '0';
  } catch {
    return true;
  }
};
const gravarBiblioteca = (aberta: boolean) => {
  try {
    localStorage.setItem(CHAVE_BIBLIOTECA, aberta ? '1' : '0');
  } catch {
    // sem armazenamento: só não lembra
  }
};

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

  const [bibliotecaAberta, setBibliotecaAbertaState] = useState(lerBiblioteca);
  const setBibliotecaAberta = (v: boolean) => {
    setBibliotecaAbertaState(v);
    gravarBiblioteca(v);
  };
  const [editandoPaciente, setEditandoPaciente] = useState(false);

  // O paciente vem do cadastro do início do atendimento (useAppStore). A sincronia
  // entre telas só corre quando algo muda; ao abrir a aba, puxa o que já está lá.
  // Paciente diferente: troca os dados e traz o endereço salvo nos recentes.
  useEffect(() => {
    const app = useAppStore.getState();
    const nome = app.pacienteNome.trim();
    if (!nome) return;
    const m = useManipuladosStore.getState();
    if (nome.toLowerCase() === m.pacienteNome.trim().toLowerCase()) {
      if (!m.pacienteCpf && app.pacienteCpf) useManipuladosStore.setState({ pacienteCpf: app.pacienteCpf });
      return;
    }
    const recente = useRecentPatientsStore.getState().pacientes.find((p) => p.nome.toLowerCase() === nome.toLowerCase());
    useManipuladosStore.setState({
      pacienteNome: app.pacienteNome,
      pacienteCpf: app.pacienteCpf || recente?.cpf || '',
      pacienteEndereco: recente?.endereco || '',
      pacienteCep: recente?.cep || '',
      pacienteCidade: recente?.cidade || 'Fortaleza',
      pacienteUf: recente?.uf || 'CE',
      pacienteTelefone: recente?.telefone || '',
    });
  }, []);
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

  // Paciente: resumo quando já há nome; formulário inteiro sem nome ou em "Editar".
  const resumido = pacienteNome.trim() !== '' && !editandoPaciente;
  const faltaCpf = vias === 2 && !pacienteCpf.replace(/\D/g, '');

  // O que falta antes de imprimir. Ativo C1/C5 (2 vias) é receita de controle
  // especial: o endereço do paciente é obrigatório (Port. 344/98, art. 55).
  type Campo = 'nome' | 'cpf' | 'endereco';
  const pendencias: { texto: string; campo?: Campo; bloqueia: boolean }[] = [];
  if (!pacienteNome.trim()) pendencias.push({ texto: 'Informe o nome do paciente.', campo: 'nome', bloqueia: true });
  if (!temConteudo) pendencias.push({ texto: 'Adicione ao menos uma fórmula.', bloqueia: true });
  if (vias === 2 && !pacienteEndereco.trim())
    pendencias.push({ texto: 'Controle especial: informe o endereço do paciente.', campo: 'endereco', bloqueia: true });
  if (faltaCpf) pendencias.push({ texto: 'Controle especial: informe o CPF do paciente, se ele tiver.', campo: 'cpf', bloqueia: false });
  const podeImprimir = pendencias.every((p) => !p.bloqueia);

  const irPara = (campo: Campo) => {
    if (campo === 'nome') setEditandoPaciente(true);
    requestAnimationFrame(() => {
      const el = document.getElementById(`man-${campo}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus({ preventScroll: true });
    });
  };

  // Ctrl+Enter imprime quando não falta nada.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && podeImprimir) {
        e.preventDefault();
        navigate('/manipulados/imprimir');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [podeImprimir, navigate]);

  const labelCls = 'block text-[10px] font-bold uppercase text-gray-500 tracking-wide mb-1';
  const inputCls =
    'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all shadow-sm placeholder-gray-300 bg-white';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 max-lg:pb-24">
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
            onClick={() => {
              if (confirm('Limpar o paciente e todas as fórmulas desta receita?')) resetManipulado();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
            Limpar tudo
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* ── Coluna de edição ── */}
          <div className="xl:col-span-3">
            {/* Paciente: vem do início do atendimento; aqui só o resumo e o que falta */}
            <div className="bg-white border border-neutral-border rounded-2xl p-5 mb-6 shadow-sm">
              {resumido ? (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <User size={16} className="text-indigo-500 shrink-0" />
                      <span className="text-sm font-bold uppercase text-gray-900 truncate">{pacienteNome}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {[pacienteCpf ? `CPF ${pacienteCpf}` : '', pacienteTelefone, data, local].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditandoPaciente(true)}
                    className="shrink-0 text-xs font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                  >
                    Editar
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h2 className="text-xs font-bold uppercase text-indigo-700 tracking-wider">Dados do Paciente</h2>
                  {editandoPaciente && pacienteNome.trim() && (
                    <button
                      type="button"
                      onClick={() => setEditandoPaciente(false)}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                    >
                      Concluir
                    </button>
                  )}
                </div>
              )}
              {(!resumido || faltaCpf || vias === 2) && (
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${resumido ? 'mt-4 pt-4 border-t border-gray-50' : ''}`}>
                  {!resumido && (
                    <div className="sm:col-span-2">
                      <label htmlFor="man-nome" className={labelCls}>Nome completo *</label>
                      <input
                        id="man-nome"
                        type="text"
                        value={pacienteNome}
                        onChange={(e) => setPacienteManipulado({ pacienteNome: e.target.value })}
                        placeholder="Nome completo do paciente"
                        className={inputCls}
                      />
                    </div>
                  )}
                  {(!resumido || faltaCpf) && (
                    <div>
                      <label htmlFor="man-cpf" className={labelCls}>
                        CPF {vias === 2 && <span className="text-amber-600">*</span>}
                      </label>
                      <input
                        id="man-cpf"
                        type="text"
                        value={pacienteCpf}
                        onChange={(e) => setPacienteManipulado({ pacienteCpf: formatCpf(e.target.value) })}
                        placeholder="000.000.000-00"
                        className={inputCls}
                      />
                    </div>
                  )}
                  {!resumido && (
                    <div>
                      <label htmlFor="man-telefone" className={labelCls}>Telefone</label>
                      <input
                        id="man-telefone"
                        type="text"
                        value={pacienteTelefone}
                        onChange={(e) => setPacienteManipulado({ pacienteTelefone: e.target.value })}
                        placeholder="(85) 00000-0000"
                        className={inputCls}
                      />
                    </div>
                  )}
                  {vias === 2 && (
                    <div className="sm:col-span-2">
                      <label htmlFor="man-endereco" className={labelCls}>
                        Endereço <span className="text-amber-600">*</span>
                      </label>
                      <input
                        id="man-endereco"
                        type="text"
                        value={pacienteEndereco}
                        onChange={(e) => setPacienteManipulado({ pacienteEndereco: e.target.value })}
                        placeholder="Rua, número, bairro, cidade"
                        className={inputCls}
                      />
                    </div>
                  )}
                  {!resumido && (
                    <>
                      <div>
                        <label htmlFor="man-data" className={labelCls}>Data</label>
                        <input id="man-data" type="text" value={data} onChange={(e) => setPacienteManipulado({ data: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label htmlFor="man-local" className={labelCls}>Local</label>
                        <input id="man-local" type="text" value={local} onChange={(e) => setPacienteManipulado({ local: e.target.value })} className={inputCls} />
                      </div>
                    </>
                  )}
                </div>
              )}
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
              <div className={`flex justify-between items-center gap-3 ${bibliotecaAberta ? 'mb-4' : ''}`}>
                <span className="text-xs font-bold uppercase text-indigo-700 tracking-wider">
                  Biblioteca de Protocolos
                </span>
                <button
                  type="button"
                  onClick={() => setBibliotecaAberta(!bibliotecaAberta)}
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
                              // Fecha a biblioteca e leva até a fórmula para ajustar doses.
                              setBibliotecaAberta(false);
                              requestAnimationFrame(() =>
                                document.getElementById('man-prescricao')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              );
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
            <div id="man-prescricao" className="bg-white border border-neutral-border rounded-2xl p-5 shadow-sm scroll-mt-6">
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
              {pendencias.length > 0 ? (
                <ul className="mt-2 space-y-0.5 text-[11px]">
                  {pendencias.map((p) => (
                    <li key={p.texto} className={p.bloqueia ? 'text-red-700' : 'text-amber-700'}>
                      {p.campo ? (
                        <button
                          type="button"
                          onClick={() => irPara(p.campo!)}
                          className="text-left underline decoration-dotted underline-offset-2 hover:decoration-solid cursor-pointer"
                        >
                          {p.texto}
                        </button>
                      ) : (
                        p.texto
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="hidden sm:block text-[10px] text-gray-400 text-center mt-1.5">Atalho: Ctrl+Enter</p>
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
