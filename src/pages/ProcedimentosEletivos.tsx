import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, FileText, Printer, RotateCcw, Sparkles } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PatientForm from '../components/patient/PatientForm';
import JustificativaPanel from '../components/soap/JustificativaPanel';
import ExamSelector from '../components/exams/ExamSelector';
import { useAppStore } from '../store/useAppStore';
import { formatDraftTime } from '../lib/formatters';
import type { TipoGuia } from '../types';

export default function ProcedimentosEletivos() {
  const navigate = useNavigate();
  const {
    pacienteNome,
    procedimentosSelecionados,
    procedimentosPersonalizados,
    justificativaProcedimentos,
    lastSavedAt,
    setPaciente,
    setJustificativa,
    resetForm,
  } = useAppStore();

  const totalProcedimentos = procedimentosSelecionados.length + procedimentosPersonalizados.length;
  const hasProcedimentos = totalProcedimentos > 0;
  const isFormValid = pacienteNome.trim() !== '';
  const isReadyToPrint = isFormValid && hasProcedimentos;

  // Initialize page justification on mount
  useEffect(() => {
    setJustificativa(justificativaProcedimentos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run on mount

  // Automatically update tipoGuia to the first selected procedure (or default)
  // so the print layout renders the correct procedure layout if procedures are selected
  useEffect(() => {
    const nextGuia = procedimentosSelecionados.length > 0 ? procedimentosSelecionados[0] : 'ECOCARDIOGRAMA';
    setPaciente({ tipoGuia: nextGuia as TipoGuia });
  }, [procedimentosSelecionados, setPaciente]);

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
    if (confirm('Limpar todos os dados da guia (paciente, procedimentos selecionados e justificativa)?')) {
      resetForm();
    }
  };

  const procedimentosPreview = [
    ...procedimentosSelecionados,
    ...procedimentosPersonalizados,
  ].join(', ');

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto px-6 py-6 pb-28 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-900">Procedimentos Eletivos</h1>
            <span className="text-xs text-gray-400">{formatDraftTime(lastSavedAt)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 font-medium">
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

        {/* 2. IA Justification Assistant (Procedimentos specific) */}
        <JustificativaPanel mode="procedimentos" />

        {/* 3. Selection Grid (Procedimentos specific) */}
        <ExamSelector mode="procedimentos" />
      </div>

      {/* Fixed bottom footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg px-6 py-3.5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-6">
          <div className="flex min-w-0 flex-1 items-center gap-3 text-sm overflow-hidden">
            <div className={`flex items-center gap-1.5 shrink-0 ${isFormValid ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle size={13} />
              <span className="font-semibold truncate max-w-[140px] text-xs">
                {isFormValid ? pacienteNome : 'Sem paciente'}
              </span>
            </div>
            {hasProcedimentos && (
              <>
                <span className="text-gray-200 shrink-0">·</span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs shrink-0">
                    <FileText size={12} />
                    {totalProcedimentos}/3 procedimento(s)
                  </span>
                {procedimentosPreview && (
                  <span className="text-xs text-gray-400 truncate hidden sm:block">{procedimentosPreview}</span>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => navigate('/imprimir')}
            disabled={!isReadyToPrint}
            className={`flex shrink-0 items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer ${
              isReadyToPrint
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-100'
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
