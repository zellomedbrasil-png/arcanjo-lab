import { useState } from 'react';
import { Sparkles, Square, AlertTriangle, CheckCircle2, Trash2, Printer } from 'lucide-react';
import { useReceitaStore, type MedicamentoReceita } from '../../store/useReceitaStore';
import { processarListaMedicamentos, type ResultadoListaMedicamentos } from '../../services/groqReceita';
import { cancelAIRequest, getDefaultModelId, AI_MODELS } from '../../config/gemini';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { getErrorMessage } from '../../lib/errors';
import { classificar, seloCurto, REGRAS_MODELO } from '../../data/regrasReceita';

/**
 * Aba "Texto / IA": escreve ou cola a prescrição do seu jeito.
 * - "Interpretar com IA" transforma o texto em itens conferíveis (posologia,
 *   classificação ANVISA, alertas) e, ao confirmar, eles entram na aba Rápido.
 * - Sem interpretar, o texto vai impresso exatamente como digitado, no tipo de
 *   receita escolhido acima.
 */
export default function AbaTextoIA({
  onAdicionar,
}: {
  onAdicionar: (itens: Array<Omit<Partial<MedicamentoReceita>, 'id'>>, alertas: string[]) => void;
}) {
  const textoLivre = useReceitaStore((s) => s.textoLivre);
  const setTextoLivre = useReceitaStore((s) => s.setTextoLivre);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState<ResultadoListaMedicamentos | null>(null);
  const [marcados, setMarcados] = useState<Set<number>>(new Set());
  const segundos = useElapsedTimer(carregando);

  const modeloIA = (() => {
    const id = getDefaultModelId();
    return AI_MODELS.find((m) => m.id === id || m.id.replace('google/', '') === id)?.badge ?? 'IA';
  })();

  const interpretar = async () => {
    if (!textoLivre.trim()) return;
    setCarregando(true);
    setErro('');
    setResultado(null);
    try {
      const r = await processarListaMedicamentos(textoLivre);
      setResultado(r);
      setMarcados(new Set(r.medicamentos.map((_, i) => i)));
    } catch (e) {
      setErro(getErrorMessage(e, 'Não foi possível interpretar com a IA. Tente de novo ou imprima o texto como está.'));
    } finally {
      setCarregando(false);
    }
  };

  const adicionar = () => {
    if (!resultado) return;
    const itens = resultado.medicamentos
      .filter((_, i) => marcados.has(i))
      .map((m) => ({
        nomeDigitado: m.nomeOriginal || m.principioAtivo,
        principioAtivo: m.principioAtivo,
        formaFarmaceutica: m.formaFarmaceutica,
        uso: m.uso,
        posologia: m.posologia,
        quantidade: m.quantidade,
        duracao: m.duracao,
        indicacao: m.indicacao,
        observacoes: m.observacoes,
        tipoRecomendado: m.tipoRecomendado,
        motivoEspecial: m.motivoEspecial,
      }));
    onAdicionar(itens, resultado.alertas);
    setResultado(null);
  };

  return (
    <div className="space-y-3">
      <textarea
        value={textoLivre}
        onChange={(e) => setTextoLivre(e.target.value)}
        rows={8}
        placeholder={'Escreva ou cole a prescrição, um item por linha:\n\nlosartana 50 1cp manhã\nmetformina 850 após almoço e jantar\nomeprazol 20 jejum 30 dias\n\nOu escreva a queixa ("ITU em mulher, 30 anos") e peça para a IA sugerir.'}
        className="w-full border border-gray-200 rounded-xl text-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y placeholder:text-gray-400 font-mono leading-relaxed"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={carregando ? cancelAIRequest : interpretar}
          disabled={!carregando && !textoLivre.trim()}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
            carregando
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : !textoLivre.trim()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm'
          }`}
        >
          {carregando ? <><Square size={14} fill="white" /> Parar{segundos ? ` (${segundos}s)` : ''}</> : <><Sparkles size={16} /> Interpretar com IA</>}
        </button>
        {textoLivre.trim() && !carregando && (
          <button
            type="button"
            onClick={() => { setTextoLivre(''); setResultado(null); }}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200"
          >
            <Trash2 size={14} /> Limpar
          </button>
        )}
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Printer size={13} /> Sem interpretar, o texto sai impresso como está · IA: {modeloIA}
        </span>
      </div>

      {erro && (
        <p className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle size={16} /> {erro}
        </p>
      )}

      {resultado && (
        <div className="space-y-3">
          {resultado.alertas.length > 0 && (
            <ul className="rounded-xl border border-amber-200 bg-amber-50 p-3 list-disc pl-8 text-sm text-amber-900 space-y-0.5">
              {resultado.alertas.map((a) => <li key={a}>{a}</li>)}
            </ul>
          )}
          <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {resultado.medicamentos.map((m, i) => {
              const info = classificar(`${m.principioAtivo} ${m.nomeOriginal}`, m.uso, { tipo: m.tipoRecomendado, motivo: m.motivoEspecial });
              const notif = !REGRAS_MODELO[info.modelo].imprimeReceita;
              const marcado = marcados.has(i);
              return (
                <label key={i} className={`flex items-start gap-3 px-4 py-3 cursor-pointer ${marcado ? 'bg-indigo-50/40' : 'hover:bg-gray-50'}`}>
                  <input
                    type="checkbox"
                    checked={marcado}
                    onChange={() => setMarcados((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                    className="mt-1 w-4 h-4 shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{m.principioAtivo}</span>
                      {info.modelo !== 'SIMPLES' && (
                        <span className={`text-[10px] font-extrabold uppercase px-1.5 rounded border ${notif ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                          {seloCurto(info)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{m.posologia}</p>
                    <p className="text-xs text-gray-500">{[m.quantidade, m.duracao, m.uso].filter(Boolean).join(' · ')}</p>
                  </div>
                  {marcado && <CheckCircle2 size={16} className="text-indigo-500 shrink-0 mt-1" />}
                </label>
              );
            })}
          </div>
          <button
            type="button"
            onClick={adicionar}
            disabled={!marcados.size}
            className="w-full py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-100 disabled:text-gray-400"
          >
            Adicionar {marcados.size} à receita
          </button>
        </div>
      )}
    </div>
  );
}
