import { useState } from 'react';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { useAppStore } from '../../store/useAppStore';
import { formatExamNameForDisplay } from '../../lib/formatters';
import { organizarExamesIA, findMatchingExam, type ExameOrganizado, type ResultadoExamesIA } from '../../services/groqExames';
import { getErrorMessage } from '../../lib/errors';
import { toast } from '../../lib/toast';
import {
  ClipboardPaste, Sparkles, CheckCircle2,
  AlertTriangle, ChevronDown, ChevronUp, FileText, Wand2, Trash2,
  Pencil, Check, Plus, Square
} from 'lucide-react';
import { cancelAIRequest, getDefaultModelId, AI_MODELS } from '../../config/gemini';

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

  const getActiveModelLabel = () => {
    const modelId = getDefaultModelId();
    const model = AI_MODELS.find((m) => m.id === modelId || m.id.replace('google/', '') === modelId);
    return model ? model.badge : 'Gemini 3 Flash';
  };

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

    // Mesclar aditivamente com exames já selecionados na store
    const examesAtuais = useAppStore.getState().examesSelecionados;
    setExamesSelecionados([...new Set([...examesAtuais, ...nomes])]);

    // Tratar justificativa aditivamente
    if (resultado?.justificativaGlobal) {
      const justificativaLimpa = resultado.justificativaGlobal.trim();
      const justificativaAtualLimpa = (useAppStore.getState().justificativa || '').trim();
      if (justificativaAtualLimpa && !justificativaAtualLimpa.toUpperCase().includes(justificativaLimpa.toUpperCase())) {
        setJustificativa(`${justificativaAtualLimpa}\n${justificativaLimpa}`);
      } else if (!justificativaAtualLimpa) {
        setJustificativa(justificativaLimpa);
      }
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

  const concluirEdicao = (index: number) => {
    const updated = [...examesEditados];
    const exame = updated[index];
    
    // Se o nome editado estiver vazio, removemos o exame da lista local
    if (!exame.nomePadronizado.trim()) {
      const novaLista = examesEditados.filter((_, i) => i !== index);
      setExamesEditados(novaLista);
      setExamesSelecionadosLocal((prev) => {
        const next = new Set<number>();
        prev.forEach((idx) => {
          if (idx < index) next.add(idx);
          if (idx > index) next.add(idx - 1);
        });
        return next;
      });
      setEditingIndex(null);
      return;
    }

    const nomeLimpo = exame.nomePadronizado.replace(/\s*\(verificar\)/gi, '').trim();
    const match = findMatchingExam(nomeLimpo);

    if (match) {
      updated[index] = {
        ...exame,
        nomePadronizado: match.nome,
        codigoTUSS: match.codIpm || match.codIssec || exame.codigoTUSS || ''
      };
      toast.success(`Exame correspondente encontrado: ${match.nome}`);
    } else {
      updated[index] = {
        ...exame,
        nomePadronizado: nomeLimpo
      };
    }

    setExamesEditados(updated);
    setEditingIndex(null);
  };

  const adicionarExameManual = () => {
    const novoExame: ExameOrganizado = {
      nomeOriginal: '',
      nomePadronizado: '',
      justificativaIndividual: ''
    };
    const novaLista = [...examesEditados, novoExame];
    const novoIndex = novaLista.length - 1;
    setExamesEditados(novaLista);
    setExamesSelecionadosLocal((prev) => {
      const next = new Set(prev);
      next.add(novoIndex);
      return next;
    });
    setEditingIndex(novoIndex);
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
    <div className="bg-white rounded-lg border border-neutral-border overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-between px-6 py-4.5 bg-blue-50/40 hover:bg-blue-50/70 transition-all border-b border-blue-100/50"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-blue-600 rounded-lg">
            <ClipboardPaste size={16} className="text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-xs font-bold text-neutral-text">Colar Lista de Exames</h2>
            <p className="text-[11px] text-neutral-text-muted">Cole exames em texto livre → IA organiza + gera justificativa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {resultado && (
            <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
              {resultado.exames.length} exames processados
            </span>
          )}
          {expandido ? <ChevronUp size={16} className="text-neutral-text-muted" /> : <ChevronDown size={16} className="text-neutral-text-muted" />}
        </div>
      </button>

      {expandido && (
        <div className="p-6 space-y-5.5">
          {/* Textarea de exames */}
          <div>
            <label className="block text-xs font-bold text-neutral-text-muted uppercase tracking-wider mb-2">
              Exames (cole ou digite livremente)
            </label>
            <textarea
              value={textoExames}
              onChange={(e) => setTextoExames(e.target.value)}
              rows={5}
              placeholder={`Cole aqui a lista de exames (um por linha ou separados por vírgula)...\n\nExemplos:\nhemograma\nglicemia jejum\nTSH, T4L\nureia, creatinina\nTGO, TGP, GGT\ncolesterol total e frações\nPSA (se masculino)`}
              className="w-full border border-neutral-border rounded-lg text-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-none placeholder:text-neutral-text-muted font-mono leading-relaxed"
            />
          </div>

          {/* Botões */}
          <div className="space-y-2.5">
            <div className="flex gap-2.5">
              <button
                onClick={isLoading ? cancelAIRequest : handleOrganizar}
                disabled={!isLoading && !textoExames.trim()}
                className={`flex-1 flex items-center justify-center gap-2 px-4.5 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isLoading
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-100'
                    : !textoExames.trim()
                    ? 'bg-gray-100 text-neutral-text-muted cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                }`}
              >
                {isLoading ? (
                  <>
                    <Square size={13} fill="white" />
                    {elapsed ? `Parar (${elapsed}s)` : 'Parar'}
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    Organizar com IA
                  </>
                )}
              </button>
              {(textoExames || resultado) && (
                <button
                  onClick={limparTudo}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-lg text-xs font-semibold text-neutral-text-muted hover:text-red-600 hover:bg-red-50 border border-neutral-border bg-white transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                  Limpar
                </button>
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] text-neutral-text-muted font-semibold select-none px-0.5 pt-1">
              <span>IA ativa para processamento:</span>
              <span className="text-blue-600 bg-blue-50 border border-blue-150 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">{getActiveModelLabel()}</span>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              <AlertTriangle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Resultado */}
          {resultado && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* CID-10 */}
              {resultado.cid10Sugerido && (
                <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50/50 border border-blue-150 rounded-lg px-3 py-2">
                  <FileText size={13} className="shrink-0" />
                  <span>CID-10 sugerido: <strong>{resultado.cid10Sugerido}</strong></span>
                </div>
              )}

              {/* Lista de exames organizados */}
              <div className="border border-neutral-border rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4.5 py-3 flex items-center justify-between border-b border-neutral-border">
                  <span className="text-[10px] font-bold text-neutral-text-muted uppercase tracking-wider">
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
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                  >
                    {examesSelecionados.size === examesEditados.length ? 'Desmarcar todos' : 'Selecionar todos'}
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {examesEditados.map((exame: ExameOrganizado, index: number) => {
                    const isChecked = examesSelecionados.has(index);
                    const isVerificar = exame.nomePadronizado.includes('(verificar)');
                    const isEditing = editingIndex === index;
                    return (
                      <div
                        key={index}
                        className={`flex items-start gap-3.5 px-4.5 py-3.5 transition-all ${
                          isChecked
                            ? 'bg-blue-50/30'
                            : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center mt-0.5 shrink-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleExame(index)}
                            className="w-3.5 h-3.5 text-blue-600 border-neutral-border rounded focus:ring-blue-500 cursor-pointer"
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
                                className="flex-1 border border-blue-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white font-medium text-neutral-text"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') concluirEdicao(index);
                                  if (e.key === 'Escape') setEditingIndex(null);
                                }}
                                onBlur={() => concluirEdicao(index)}
                              />
                              <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => concluirEdicao(index)}
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
                                  className={`text-[11px] font-semibold cursor-pointer hover:text-blue-700 transition-colors ${
                                    isVerificar ? 'text-amber-700' : 'text-neutral-text'
                                  }`}
                                  onClick={() => toggleExame(index)}
                                >
                                  {formatExamNameForDisplay(exame.nomePadronizado)}
                                </span>
                                {exame.codigoTUSS && (
                                  <span className="text-[9px] text-neutral-text-muted font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                                    {exame.codigoTUSS}
                                  </span>
                                )}
                                {isVerificar && (
                                  <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                                )}
                                <button
                                  onClick={() => setEditingIndex(index)}
                                  className="opacity-0 group-hover/title:opacity-100 p-1 text-neutral-text-muted hover:text-blue-600 rounded transition-all ml-1 cursor-pointer"
                                  title="Editar nome do exame"
                                >
                                  <Pencil size={11} />
                                </button>
                              </div>
                              {exame.nomeOriginal !== exame.nomePadronizado && (
                                <p className="text-[10px] text-neutral-text-muted mt-0.5 flex items-center gap-2">
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
                                      className="text-[9px] text-blue-600 hover:underline font-semibold cursor-pointer"
                                    >
                                      Usar original
                                    </button>
                                  )}
                                </p>
                              )}
                              {exame.justificativaIndividual && (
                                <p className="text-[11px] text-neutral-text-muted mt-0.5 italic">
                                  {exame.justificativaIndividual}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        {!isEditing && isChecked && (
                          <CheckCircle2 size={14} className="text-blue-600 shrink-0 mt-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="bg-slate-50/50 p-2.5 flex justify-center border-t border-slate-100">
                  <button
                    type="button"
                    onClick={adicionarExameManual}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50/50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus size={12} />
                    Adicionar Exame
                  </button>
                </div>
              </div>

              {/* Justificativa global */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Wand2 size={13} className="text-blue-500" />
                  <label className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    Justificativa Clínica Gerada
                  </label>
                </div>
                <div className="bg-blue-50/20 border border-blue-100 rounded-lg px-3.5 py-2.5 text-xs text-neutral-text font-medium leading-relaxed">
                  {resultado.justificativaGlobal}
                </div>
              </div>

              {/* Botão aplicar */}
              <button
                onClick={aplicarNaGuia}
                disabled={examesSelecionados.size === 0}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all shadow-sm ${
                  examesSelecionados.size === 0
                    ? 'bg-gray-100 text-neutral-text-muted cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <CheckCircle2 size={14} />
                Aplicar {examesSelecionados.size} exame{examesSelecionados.size !== 1 ? 's' : ''} na Guia
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
