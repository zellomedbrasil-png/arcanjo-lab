import { useState } from 'react';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { useAppStore } from '../../store/useAppStore';
import { organizarExamesIA, type ExameOrganizado, type ResultadoExamesIA } from '../../services/groqExames';
import { getErrorMessage } from '../../lib/errors';
import { toast } from '../../lib/toast';
import {
  ClipboardPaste, Sparkles, Loader2, CheckCircle2,
  AlertTriangle, ChevronDown, ChevronUp, FileText, Wand2, Trash2,
  Pencil, Check
} from 'lucide-react';

export default function ExamPastePanel() {
  const [textoExames, setTextoExames] = useState('');
  const [queixa, setQueixa] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoExamesIA | null>(null);
  const [examesEditados, setExamesEditados] = useState<ExameOrganizado[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [examesSelecionados, setExamesSelecionadosLocal] = useState<Set<number>>(new Set());
  const [expandido, setExpandido] = useState(false);

  const { genero, setExamesSelecionados, setJustificativa } = useAppStore();
  const elapsed = useElapsedTimer(isLoading);

  const handleOrganizar = async () => {
    if (!textoExames.trim()) {
      setError('Cole ou digite pelo menos um exame.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResultado(null);
    setExamesEditados([]);
    setEditingIndex(null);

    try {
      const result = await organizarExamesIA(textoExames, queixa, genero);
      setResultado(result);
      setExamesEditados(result.exames);
      // Seleciona todos por padrão
      setExamesSelecionadosLocal(new Set(result.exames.map((_, i) => i)));
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Erro ao processar exames. Tente novamente.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExame = (index: number) => {
    setExamesSelecionadosLocal((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const aplicarNaGuia = () => {
    if (examesEditados.length === 0) return;
    const nomes = examesEditados
      .filter((_, i) => examesSelecionados.has(i))
      .map((e) => {
        // Limpar o "(verificar)" do nome padronizado para a guia impressa ficar limpa
        return e.nomePadronizado.replace(/\s*\(verificar\)/gi, '').trim();
      });
    setExamesSelecionados(nomes);
    if (resultado?.justificativaGlobal) {
      setJustificativa(resultado.justificativaGlobal);
    }
    toast.success(`${nomes.length} exame${nomes.length !== 1 ? 's' : ''} aplicado${nomes.length !== 1 ? 's' : ''} na guia`);
    // Limpar estado local
    setTextoExames('');
    setQueixa('');
    setResultado(null);
    setExamesEditados([]);
    setEditingIndex(null);
    setExpandido(false);
  };

  const limparTudo = () => {
    setTextoExames('');
    setQueixa('');
    setResultado(null);
    setExamesEditados([]);
    setEditingIndex(null);
    setError(null);
    setExamesSelecionadosLocal(new Set());
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 transition-all border-b border-violet-100"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-sm">
            <ClipboardPaste size={18} className="text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-bold text-gray-800">Colar Lista de Exames</h2>
            <p className="text-xs text-gray-500">Cole exames em texto livre → IA organiza + gera justificativa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {resultado && (
            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">
              {resultado.exames.length} exames processados
            </span>
          )}
          {expandido ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </button>

      {expandido && (
        <div className="p-6 space-y-5">
          {/* Textarea de exames */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Exames (cole ou digite livremente)
            </label>
            <textarea
              value={textoExames}
              onChange={(e) => setTextoExames(e.target.value)}
              rows={5}
              placeholder={`Cole aqui a lista de exames (um por linha ou separados por vírgula)...\n\nExemplos:\nhemograma\nglicemia jejum\nTSH, T4L\nureia, creatinina\nTGO, TGP, GGT\ncolesterol total e frações\nPSA (se masculino)`}
              className="w-full border border-gray-200 rounded-xl text-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 resize-none placeholder:text-gray-400 font-mono"
            />
          </div>

          {/* Queixa */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Queixa / Contexto Clínico
              <span className="ml-2 text-gray-400 font-normal normal-case">(opcional, melhora a justificativa)</span>
            </label>
            <input
              type="text"
              value={queixa}
              onChange={(e) => setQueixa(e.target.value)}
              placeholder="Ex: Check-up geriátrico anual, HAS e DM2 em acompanhamento"
              className="w-full border border-gray-200 rounded-xl text-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 placeholder:text-gray-400"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={handleOrganizar}
              disabled={isLoading || !textoExames.trim()}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                isLoading || !textoExames.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 hover:shadow-md'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {elapsed ? `Organizando com IA... (${elapsed}s)` : 'Organizando com IA...'}
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Organizar com IA
                </>
              )}
            </button>
            {(textoExames || resultado) && (
              <button
                onClick={limparTudo}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-all"
              >
                <Trash2 size={14} />
                Limpar
              </button>
            )}
          </div>

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Resultado */}
          {resultado && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* CID-10 */}
              {resultado.cid10Sugerido && (
                <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
                  <FileText size={13} className="shrink-0" />
                  <span>CID-10 sugerido: <strong>{resultado.cid10Sugerido}</strong></span>
                </div>
              )}

              {/* Lista de exames organizados */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Exames Organizados ({examesSelecionados.size} de {examesEditados.length} selecionados)
                  </span>
                  <button
                    onClick={() => {
                      if (examesSelecionados.size === examesEditados.length) {
                        setExamesSelecionadosLocal(new Set());
                      } else {
                        setExamesSelecionadosLocal(new Set(examesEditados.map((_, i) => i)));
                      }
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                  >
                    {examesSelecionados.size === examesEditados.length ? 'Desmarcar todos' : 'Selecionar todos'}
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  {examesEditados.map((exame: ExameOrganizado, index: number) => {
                    const isChecked = examesSelecionados.has(index);
                    const isVerificar = exame.nomePadronizado.includes('(verificar)');
                    const isEditing = editingIndex === index;
                    return (
                      <div
                        key={index}
                        className={`flex items-start gap-3 px-4 py-3 transition-all ${
                          isChecked
                            ? 'bg-violet-50/60'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center mt-0.5 shrink-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleExame(index)}
                            className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={exame.nomePadronizado}
                                onChange={(e) => {
                                  const updated = [...examesEditados];
                                  updated[index] = { ...updated[index], nomePadronizado: e.target.value };
                                  setExamesEditados(updated);
                                }}
                                className="flex-1 border border-violet-300 rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white font-medium text-gray-800"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') setEditingIndex(null);
                                  if (e.key === 'Escape') setEditingIndex(null);
                                }}
                              />
                              <button
                                onClick={() => setEditingIndex(null)}
                                className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors cursor-pointer"
                                title="Concluir"
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2 group/title">
                                <span
                                  className={`text-sm font-semibold cursor-pointer hover:text-violet-700 transition-colors ${
                                    isVerificar ? 'text-amber-700' : 'text-gray-800'
                                  }`}
                                  onClick={() => toggleExame(index)}
                                >
                                  {exame.nomePadronizado}
                                </span>
                                {exame.codigoTUSS && (
                                  <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                    {exame.codigoTUSS}
                                  </span>
                                )}
                                {isVerificar && (
                                  <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                                )}
                                <button
                                  onClick={() => setEditingIndex(index)}
                                  className="opacity-0 group-hover/title:opacity-100 p-1 text-gray-400 hover:text-violet-600 rounded transition-all ml-1 cursor-pointer"
                                  title="Editar nome do exame"
                                >
                                  <Pencil size={12} />
                                </button>
                              </div>
                              {exame.nomeOriginal !== exame.nomePadronizado && (
                                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                                  <span>Original: "{exame.nomeOriginal}"</span>
                                  {isVerificar && (
                                    <button
                                      onClick={() => {
                                        const updated = [...examesEditados];
                                        updated[index] = { 
                                          ...updated[index], 
                                          nomePadronizado: exame.nomeOriginal.toUpperCase().trim() 
                                        };
                                        setExamesEditados(updated);
                                      }}
                                      className="text-[10px] text-violet-600 hover:underline font-semibold cursor-pointer"
                                    >
                                      Usar original
                                    </button>
                                  )}
                                </p>
                              )}
                              {exame.justificativaIndividual && (
                                <p className="text-xs text-gray-500 mt-0.5 italic">
                                  {exame.justificativaIndividual}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        {!isEditing && isChecked && (
                          <CheckCircle2 size={16} className="text-violet-500 shrink-0 mt-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Justificativa global */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wand2 size={14} className="text-violet-500" />
                  <label className="text-xs font-bold text-violet-700 uppercase tracking-wider">
                    Justificativa Clínica Gerada
                  </label>
                </div>
                <div className="bg-violet-50/60 border border-violet-200 rounded-xl px-4 py-3 text-sm text-gray-800 font-medium leading-relaxed">
                  {resultado.justificativaGlobal}
                </div>
              </div>

              {/* Botão aplicar */}
              <button
                onClick={aplicarNaGuia}
                disabled={examesSelecionados.size === 0}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  examesSelecionados.size === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-md'
                }`}
              >
                <CheckCircle2 size={16} />
                Aplicar {examesSelecionados.size} exame{examesSelecionados.size !== 1 ? 's' : ''} na Guia
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
