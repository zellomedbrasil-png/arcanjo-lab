import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, FileText, Printer, RotateCcw, Sparkles } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PatientForm from '../components/patient/PatientForm';
import JustificativaPanel from '../components/soap/JustificativaPanel';
import ExamPastePanel from '../components/exams/ExamPastePanel';
import ExamSelector from '../components/exams/ExamSelector';
import { useAppStore } from '../store/useAppStore';
import { formatDraftTime } from '../lib/formatters';

export default function ExamesLaboratoriais() {
  const navigate = useNavigate();
  const {
    pacienteNome,
    examesSelecionados,
    justificativaExames,
    lastSavedAt,
    setPaciente,
    setJustificativa,
    resetForm,
  } = useAppStore();

  const hasExames = examesSelecionados.length > 0;
  const isFormValid = pacienteNome.trim() !== '';
  const isReadyToPrint = isFormValid && hasExames;

  useEffect(() => {
    // Force guide type to lab exams and sync general justification
    setPaciente({ tipoGuia: 'LABORATORIO' });
    setJustificativa(justificativaExames);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run on mount

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

  const handleClear = () => {
    if (confirm('Limpar todos os dados da guia (paciente, exames selecionados e justificativa)?')) {
      resetForm();
    }
  };

  const examesPreview = [
    ...examesSelecionados.slice(0, 4),
    ...(examesSelecionados.length > 4 ? [`+${examesSelecionados.length - 4}`] : []),
  ].join(', ');

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 pb-28 max-lg:pb-36 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold font-display tracking-tight text-neutral-text">Exames Laboratoriais</h1>
            <p className="text-xs text-neutral-text-muted mt-0.5">Solicitação com justificativa clínica para a guia · {formatDraftTime(lastSavedAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 font-medium">
              <Sparkles size={11} />
              <strong>Ctrl+Enter</strong> imprimir
            </span>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-3 py-2 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 bg-white cursor-pointer font-medium"
            >
              <RotateCcw size={12} />
              Limpar Tudo
            </button>
          </div>
        </div>

        {/* 1. Patient Form */}
        <PatientForm />

        {/* Two-column layout for desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Context, Justification & Paste Panel */}
          <div className="lg:col-span-4 space-y-6">
            {/* 2. IA Justification Assistant (Lab Exams specific) */}
            <JustificativaPanel mode="exames" />

            {/* 3. Paste list helper */}
            <ExamPastePanel />
          </div>

          {/* Right Column: Catalog Grid */}
          <div className="lg:col-span-8">
            {/* 4. Selection Grid (Lab Exams specific) */}
            <ExamSelector mode="exames" />
          </div>
        </div>
      </div>

      {/* Fixed bottom footer */}
      <div className="fixed bottom-0 lg:left-64 left-0 right-0 z-30 lg:z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg px-6 py-3.5 max-lg:bottom-[calc(3.5rem+env(safe-area-inset-bottom))]">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-6">
          <div className="flex min-w-0 flex-1 items-center gap-3 text-sm overflow-hidden">
            <div className={`flex items-center gap-1.5 shrink-0 ${isFormValid ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle size={13} />
              <span className="font-semibold truncate max-w-[140px] text-xs">
                {isFormValid ? pacienteNome : 'Sem paciente'}
              </span>
            </div>
            {hasExames && (
              <>
                <span className="text-gray-200 shrink-0">·</span>
                <span className="flex items-center gap-1 text-blue-600 font-bold text-xs shrink-0">
                  <FileText size={12} />
                  {examesSelecionados.length} exame(s)
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
            className={`flex shrink-0 items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer ${
              isReadyToPrint
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:shadow-blue-100'
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
