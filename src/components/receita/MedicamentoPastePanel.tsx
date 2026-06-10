import { useState } from 'react';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { useReceitaStore } from '../../store/useReceitaStore';
import { processarListaMedicamentos, type MedProcessado, type ResultadoListaMedicamentos } from '../../services/groqReceita';
import { getErrorMessage } from '../../lib/errors';
import { toast } from '../../lib/toast';
import {
  ClipboardPaste, Sparkles, CheckCircle2,
  AlertTriangle, ChevronDown, ChevronUp, Pill, Trash2,
  ShieldAlert, Square
} from 'lucide-react';
import { cancelAIRequest, getDefaultModelId, AI_MODELS } from '../../config/gemini';

export default function MedicamentoPastePanel() {
  const [textoMedicamentos, setTextoMedicamentos] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoListaMedicamentos | null>(null);
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [expandido, setExpandido] = useState(true);

  const { setTipoReceita, addMedicamento, updateMedicamento, medicamentos, setAlertas } = useReceitaStore();
  const elapsed = useElapsedTimer(isLoading);

  const getActiveModelLabel = () => {
    const modelId = getDefaultModelId();
    const model = AI_MODELS.find((m) => m.id === modelId || m.id.replace('google/', '') === modelId);
    return model ? model.badge : 'Gemini 3 Flash';
  };

  const handleProcessar = async () => {
    if (!textoMedicamentos.trim()) {
      setError('Cole ou digite pelo menos um medicamento.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResultado(null);

    try {
      const result = await processarListaMedicamentos(textoMedicamentos);
      setResultado(result);
      setSelecionados(new Set(result.medicamentos.map((_, i) => i)));
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Erro ao processar medicamentos. Tente novamente.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMed = (index: number) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const aplicarNaReceita = () => {
    if (!resultado) return;
    const medsParaAplicar = resultado.medicamentos.filter((_, i) => selecionados.has(i));

    // Remove medicamentos vazios existentes
    const medsVazios = medicamentos.filter((m) => !m.nomeDigitado.trim() && !m.principioAtivo);
    
    // Para cada medicamento processado, criar um novo card
    let temEspecial = false;
    medsParaAplicar.forEach((med: MedProcessado) => {
      // Adiciona um novo card
      addMedicamento();
      // Pega o último medicamento adicionado
      const ultimoId = useReceitaStore.getState().medicamentos[useReceitaStore.getState().medicamentos.length - 1].id;
      updateMedicamento(ultimoId, {
        nomeDigitado: med.nomeOriginal || med.principioAtivo,
        principioAtivo: med.principioAtivo,
        formaFarmaceutica: med.formaFarmaceutica,
        uso: med.uso,
        posologia: med.posologia,
        quantidade: med.quantidade,
        duracao: med.duracao,
        tipoRecomendado: med.tipoRecomendado,
        motivoEspecial: med.motivoEspecial,
      });
      if (med.tipoRecomendado === 'ESPECIAL') temEspecial = true;
    });

    // Remove os cards vazios que estavam antes
    medsVazios.forEach((m) => {
      useReceitaStore.getState().removeMedicamento(m.id);
    });

    // Auto-sugerir tipo especial se detectado
    if (temEspecial) {
      setTipoReceita('ESPECIAL');
    }

    // Salvar alertas da IA no estado global da receita
    setAlertas(resultado.alertas || []);

    const count = medsParaAplicar.length;
    toast.success(`${count} medicamento${count !== 1 ? 's' : ''} aplicado${count !== 1 ? 's' : ''} na receita${temEspecial ? ' (Controle Especial detectado)' : ''}`);

    // Limpar estado
    setTextoMedicamentos('');
    setResultado(null);
    setExpandido(false);
  };

  const limparTudo = () => {
    setTextoMedicamentos('');
    setResultado(null);
    setError(null);
    setSelecionados(new Set());
  };

  const temEspecial = resultado?.medicamentos.some((m) => m.tipoRecomendado === 'ESPECIAL') ?? false;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-5 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-all border-b border-emerald-100"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-sm">
            <ClipboardPaste size={18} className="text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-bold text-gray-800">Colar Lista de Medicamentos</h2>
            <p className="text-xs text-gray-500">Cole a lista inteira → IA organiza posologia, classificação ANVISA e alertas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {resultado && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">
              {resultado.medicamentos.length} processados
            </span>
          )}
          {expandido ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </button>

      {expandido && (
        <div className="p-6 space-y-5">
          {/* Textarea */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Medicamentos (um por linha)
            </label>
            <textarea
              value={textoMedicamentos}
              onChange={(e) => setTextoMedicamentos(e.target.value)}
              rows={5}
              placeholder={`Cole a lista de medicamentos aqui (um por linha)...\n\nExemplos:\nLosartana 50mg\nMetformina 850mg\nSinvastatina 20mg\nOmeprazol 20mg\nAAS 100mg`}
              className="w-full border border-gray-200 rounded-xl text-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 resize-none placeholder:text-gray-400 font-mono"
            />
          </div>

          {/* Botões */}
          <div className="space-y-2.5">
            <div className="flex gap-3">
              <button
                onClick={isLoading ? cancelAIRequest : handleProcessar}
                disabled={!isLoading && !textoMedicamentos.trim()}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer ${
                  isLoading
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-100'
                    : !textoMedicamentos.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 hover:shadow-md'
                }`}
              >
                {isLoading ? (
                  <>
                    <Square size={14} fill="white" />
                    {elapsed ? `Parar (${elapsed}s)` : 'Parar'}
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Processar Lista com IA
                  </>
                )}
              </button>
              {(textoMedicamentos || resultado) && (
                <button
                  onClick={limparTudo}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-all"
                >
                  <Trash2 size={14} />
                  Limpar
                </button>
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-450 font-semibold select-none px-0.5 pt-1">
              <span>IA ativa para processamento:</span>
              <span className="text-emerald-650 bg-emerald-50/50 border border-emerald-150 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">{getActiveModelLabel()}</span>
            </div>
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
            <div className="space-y-4">
              {/* Alertas de interação */}
              {resultado.alertas.length > 0 && (
                <div className="space-y-2">
                  {resultado.alertas.map((alerta, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5"
                    >
                      <ShieldAlert size={14} className="shrink-0 mt-0.5 text-amber-500" />
                      <span>{alerta}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Aviso de medicamento especial */}
              {temEspecial && (
                <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                  <span>
                    <strong>⚠️ Atenção:</strong> Um ou mais medicamentos requerem <strong>Receita de Controle Especial</strong>.
                    O tipo de receita será automaticamente alterado ao aplicar.
                  </span>
                </div>
              )}

              {/* Lista processada */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Medicamentos Processados ({selecionados.size} de {resultado.medicamentos.length})
                  </span>
                  <button
                    onClick={() => {
                      if (selecionados.size === resultado.medicamentos.length) {
                        setSelecionados(new Set());
                      } else {
                        setSelecionados(new Set(resultado.medicamentos.map((_, i) => i)));
                      }
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold transition-colors"
                  >
                    {selecionados.size === resultado.medicamentos.length ? 'Desmarcar todos' : 'Selecionar todos'}
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  {resultado.medicamentos.map((med: MedProcessado, index: number) => {
                    const isChecked = selecionados.has(index);
                    const isEspecial = med.tipoRecomendado === 'ESPECIAL';
                    return (
                      <label
                        key={index}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all ${
                          isChecked
                            ? isEspecial
                              ? 'bg-amber-50/60'
                              : 'bg-emerald-50/60'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleMed(index)}
                          className="mt-0.5 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-semibold ${isEspecial ? 'text-amber-800' : 'text-gray-800'}`}>
                              {med.principioAtivo}
                            </span>
                            {isEspecial && (
                              <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase">
                                Controle Especial
                              </span>
                            )}
                            {!isEspecial && (
                              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                Simples ✓
                              </span>
                            )}
                          </div>
                          {med.nomeOriginal && med.nomeOriginal !== med.principioAtivo && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Digitado: "{med.nomeOriginal}"
                            </p>
                          )}
                          <div className="mt-1 text-xs text-gray-600 space-y-0.5">
                            {med.formaFarmaceutica && <p className="italic text-gray-500">{med.formaFarmaceutica}</p>}
                            <p>{med.posologia}</p>
                            <p className="text-gray-500">
                              {[med.quantidade, med.duracao, med.uso].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                          {isEspecial && med.motivoEspecial && (
                            <p className="mt-1 text-[11px] text-amber-600 font-medium">
                              📋 {med.motivoEspecial}
                            </p>
                          )}
                        </div>
                        {isChecked && (
                          <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${isEspecial ? 'text-amber-500' : 'text-emerald-500'}`} />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Botão aplicar */}
              <button
                onClick={aplicarNaReceita}
                disabled={selecionados.size === 0}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  selecionados.size === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : temEspecial
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 hover:shadow-md'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 hover:shadow-md'
                }`}
              >
                <Pill size={16} />
                Preencher Receita com {selecionados.size} medicamento{selecionados.size !== 1 ? 's' : ''}
                {temEspecial && ' (Controle Especial)'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
