import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { groq } from '../../config/groq';
import { Bot, Loader2, FileText, ClipboardList, Wand2, ChevronDown, ChevronUp } from 'lucide-react';

const SYSTEM_PROMPT_JUSTIFICATIVA = `Você é um médico geriatra e gastroenterologista.
Gere UMA ÚNICA FRASE curta e objetiva (máximo 2 linhas) de "Indicação Clínica / Justificativa" para o campo obrigatório da guia de exame do convênio.
Formato esperado: "Investigação de [queixa principal] com [contexto clínico breve]. Solicito [exames/procedimento] para [objetivo diagnóstico]."
NÃO use formato SOAP. NÃO use bullet points. Apenas uma frase clínica direta, em português, em maiúsculas.`;

const SYSTEM_PROMPT_SOAP = `Você é um médico geriatra e gastroenterologista.
Gere uma nota clínica estruturada no formato SOAP em português, concisa e profissional.
Formato:
S (Subjetivo): queixa e história do paciente
O (Objetivo): dados clínicos relevantes
A (Avaliação): hipóteses diagnósticas
P (Plano): conduta proposta, incluindo os exames solicitados`;

export default function SOAPPanel() {
  const [queixa, setQueixa] = useState('');
  const [isLoadingJust, setIsLoadingJust] = useState(false);
  const [isLoadingSoap, setIsLoadingSoap] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [soapExpanded, setSoapExpanded] = useState(false);

  const {
    pacienteNome, genero, examesSelecionados, procedimentosSelecionados,
    soap, setSoap,
    justificativa, setJustificativa,
    tipoGuia
  } = useAppStore();

  const buildContext = () => {
    const isLab = tipoGuia === 'LABORATORIO';
    const examesStr = isLab
      ? `Exames laboratoriais: ${examesSelecionados.join(', ') || 'nenhum'}`
      : `Procedimento: ${procedimentosSelecionados.join(', ') || tipoGuia}`;
    return `Paciente: ${pacienteNome || 'não informado'} | Gênero: ${genero === 'M' ? 'Masculino' : 'Feminino'}
${examesStr}
Queixa clínica: "${queixa}"`;
  };

  const gerarJustificativa = async () => {
    if (!queixa.trim()) { setError('Informe a queixa clínica.'); return; }
    setIsLoadingJust(true);
    setError(null);
    try {
      const msg = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 256,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT_JUSTIFICATIVA },
          { role: 'user', content: buildContext() }
        ]
      });
      const text = msg.choices[0].message.content ?? '';
      setJustificativa(text.toUpperCase());
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar justificativa.');
    } finally {
      setIsLoadingJust(false);
    }
  };

  const gerarSOAP = async () => {
    if (!queixa.trim()) { setError('Informe a queixa clínica.'); return; }
    setIsLoadingSoap(true);
    setError(null);
    try {
      const msg = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT_SOAP },
          { role: 'user', content: buildContext() }
        ]
      });
      const text = msg.choices[0].message.content ?? '';
      setSoap(text);
      setSoapExpanded(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar SOAP.');
    } finally {
      setIsLoadingSoap(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
        <Bot className="text-indigo-500" size={20} />
        <div>
          <h2 className="text-base font-bold text-gray-800">Assistente Clínico IA</h2>
          <p className="text-xs text-gray-500">Gera justificativa para impressão e nota SOAP para prontuário</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Queixa input */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
            Queixa / Contexto Clínico
          </label>
          <textarea
            value={queixa}
            onChange={(e) => setQueixa(e.target.value)}
            rows={3}
            placeholder="Ex: Paciente 78 anos, astenia há 2 meses, perda de 4kg, hipertenso e diabético tipo 2."
            className="w-full border border-gray-200 rounded-xl text-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 resize-none placeholder:text-gray-400"
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={gerarJustificativa}
            disabled={isLoadingJust || !queixa.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isLoadingJust ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
            Gerar Justificativa (para Guia)
          </button>
          <button
            onClick={gerarSOAP}
            disabled={isLoadingSoap || !queixa.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm border border-gray-200"
          >
            {isLoadingSoap ? <Loader2 className="animate-spin" size={16} /> : <ClipboardList size={16} />}
            Gerar Nota SOAP (prontuário)
          </button>
        </div>

        {/* Justificativa — primary field used on print */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText size={14} className="text-indigo-500" />
            <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              Indicação Clínica / Justificativa
              <span className="ml-2 text-xs font-normal text-gray-400 normal-case">(campo impresso na guia)</span>
            </label>
          </div>
          <textarea
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            rows={3}
            placeholder="Será gerada automaticamente ou escreva manualmente. Esta é a indicação clínica que aparecerá na guia."
            className="w-full border-2 border-indigo-200 bg-indigo-50/40 rounded-xl text-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none placeholder:text-gray-400 font-medium"
          />
        </div>

        {/* SOAP — collapsible secondary section */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setSoapExpanded(!soapExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ClipboardList size={14} className="text-gray-500" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Nota SOAP (uso interno / prontuário)
              </span>
              {soap && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Gerado</span>
              )}
            </div>
            {soapExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {soapExpanded && (
            <div className="p-4">
              <textarea
                value={soap}
                onChange={(e) => setSoap(e.target.value)}
                rows={8}
                placeholder="A nota SOAP completa (S/O/A/P) aparecerá aqui após geração. Não é impressa na guia."
                className="w-full border border-gray-200 rounded-xl text-xs py-3 px-4 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-gray-50 resize-none font-mono placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-400 mt-2">
                ℹ️ Esta nota <strong>não é impressa</strong> na guia oficial. Use para registro no prontuário.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
