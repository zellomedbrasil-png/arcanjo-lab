import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, FileText, Printer, RotateCcw, Sparkles } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PatientForm from '../components/patient/PatientForm';
import ExamSelector from '../components/exams/ExamSelector';
import ExamPastePanel from '../components/exams/ExamPastePanel';
import SOAPPanel from '../components/soap/SOAPPanel';
import { useAppStore } from '../store/useAppStore';
import { formatDraftTime } from '../lib/formatters';

export default function NovoPedido() {
  const navigate = useNavigate();
  const {
    pacienteNome,
    examesSelecionados,
    procedimentosSelecionados,
    tipoGuia,
    lastSavedAt,
    resetForm,
  } = useAppStore();

  const isLab = tipoGuia === 'LABORATORIO';
  const hasExames = isLab ? examesSelecionados.length > 0 : procedimentosSelecionados.length > 0;
  const isFormValid = pacienteNome.trim() !== '';
  const isReadyToPrint = isFormValid && hasExames;
  const totalSelecionados = isLab ? examesSelecionados.length : procedimentosSelecionados.length;

  const examesPreview = isLab
    ? [
        ...examesSelecionados.slice(0, 4),
        ...(examesSelecionados.length > 4 ? [`+${examesSelecionados.length - 4}`] : []),
      ].join(', ')
    : procedimentosSelecionados.join(', ');

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && isReadyToPrint) {
        event.preventDefault();
        navigate('/imprimir');
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [isReadyToPrint, navigate]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-4 pb-24 space-y-3">

        {/* ── Linha de cabeçalho ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">Novo Pedido</h1>
            <span className="text-xs text-gray-400">{formatDraftTime(lastSavedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              <Sparkles size={11} />
              <strong>Ctrl+Enter</strong> imprimir
            </span>
            <button
              onClick={() => { if (confirm('Limpar todos os dados do formulário?')) resetForm(); }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
            >
              <RotateCcw size={12} />
              Limpar
            </button>
          </div>
        </div>

        {/* ── 1. Paciente — barra compacta ── */}
        <PatientForm />

        {/* ── 2. Exames — conteúdo principal ── */}
        <ExamPastePanel />
        <ExamSelector />

        {/* ── 3. Assistente clínico IA ── */}
        <SOAPPanel />

      </div>

      {/* ── Rodapé fixo ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm overflow-hidden">
            <div className={`flex items-center gap-1.5 shrink-0 ${isFormValid ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle size={13} />
              <span className="font-medium truncate max-w-[140px] text-xs">
                {isFormValid ? pacienteNome : 'Sem paciente'}
              </span>
            </div>
            {hasExames && (
              <>
                <span className="text-gray-200 shrink-0">·</span>
                <span className="flex items-center gap-1 text-blue-600 font-semibold text-xs shrink-0">
                  <FileText size={12} />
                  {totalSelecionados} {isLab ? 'exame(s)' : 'proc.'}
                </span>
                {examesPreview && (
                  <span className="text-xs text-gray-400 truncate hidden sm:block">{examesPreview}</span>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => navigate('/imprimir')}
            disabled={!isReadyToPrint}
            className={`flex shrink-0 items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${
              isReadyToPrint
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Printer size={15} />
            Gerar Guia
          </button>
        </div>
      </div>
    </Layout>
  );
}
