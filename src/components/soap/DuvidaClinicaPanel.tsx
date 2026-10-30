import { useState } from 'react';
import { Check, ClipboardList, Send, Square } from 'lucide-react';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { callAI, cancelAIRequest } from '../../config/gemini';
import { getErrorMessage } from '../../lib/errors';
import { toast } from '../../lib/toast';
import { cleanSoapMarkdown } from '../../lib/formatters';
import { SYSTEM_PROMPT_DUVIDAS } from './prompts';

/** Pergunta clínica fora do contexto da consulta (dose, interação, conduta). */
export default function DuvidaClinicaPanel({ modelId }: { modelId: string }) {
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const decorrido = useElapsedTimer(carregando);

  const enviar = async () => {
    if (!pergunta.trim()) return;
    setCarregando(true);
    setResposta('');
    try {
      const content = await callAI(
        {
          prompt: pergunta,
          systemInstruction: SYSTEM_PROMPT_DUVIDAS,
          onDelta: (textSoFar) => setResposta(cleanSoapMarkdown(textSoFar)),
        },
        modelId
      );
      setResposta(cleanSoapMarkdown(content));
      toast.success('Resposta gerada');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao responder dúvida.'));
    } finally {
      setCarregando(false);
    }
  };

  const copiar = () => {
    navigator.clipboard.writeText(resposta);
    setCopiado(true);
    toast.success('Resposta copiada!');
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <textarea
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          placeholder="Ex: dose de ataque de colecalciferol para idoso com vitamina D < 10? Interação entre clopidogrel e omeprazol?"
          className="flex-1 rounded-lg border border-neutral-border text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none placeholder:text-gray-400 leading-relaxed h-20"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !carregando) {
              e.preventDefault();
              enviar();
            }
          }}
        />
        <button
          type="button"
          onClick={carregando ? cancelAIRequest : enviar}
          disabled={!carregando && !pergunta.trim()}
          className={`self-end flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap ${
            carregando ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {carregando ? <Square size={12} fill="white" /> : <Send size={13} />}
          {carregando ? `Parar${decorrido ? ` ${decorrido}s` : ''}` : 'Perguntar'}
        </button>
      </div>
      <p className="text-[11px] text-neutral-text-muted">Enter envia · Shift+Enter quebra a linha. Não usa os dados do paciente.</p>

      {resposta && (
        <div className="rounded-lg border border-neutral-border">
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-neutral-border bg-slate-50/60">
            <span className="text-xs font-semibold text-neutral-text">Resposta</span>
            <button
              type="button"
              onClick={copiar}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                copiado ? 'bg-green-600 text-white' : 'border border-neutral-border bg-white text-neutral-text hover:bg-slate-50'
              }`}
            >
              {copiado ? <Check size={12} /> : <ClipboardList size={12} />}
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <div className="p-3 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{resposta}</div>
        </div>
      )}
    </div>
  );
}
