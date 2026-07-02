import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, HeartPulse, Printer, RotateCcw, Sparkles } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PatientForm from '../components/patient/PatientForm';
import ServicoJustificativaPanel from '../components/servicos/ServicoJustificativaPanel';
import ServicoSelector from '../components/servicos/ServicoSelector';
import { useAppStore } from '../store/useAppStore';
import { formatDraftTime } from '../lib/formatters';
import { getServicoNome } from '../data/servicos';
import { toast } from '../lib/toast';

export default function Servicos() {
  const navigate = useNavigate();
  const {
    pacienteNome, servicosSelecionados, lastSavedAt, setServicosSelecionados, resetForm,
  } = useAppStore();

  const total = servicosSelecionados.length;
  const isFormValid = pacienteNome.trim() !== '';
  const isReadyToPrint = isFormValid && total > 0;

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && isReadyToPrint) {
        event.preventDefault();
        navigate('/servicos/imprimir');
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [isReadyToPrint, navigate]);

  const handleClear = () => {
    if (confirm('Limpar todos os dados desta guia (paciente, terapias e justificativa)?')) {
      setServicosSelecionados([]);
      resetForm();
    }
  };

  // Sempre clicável: em vez de desabilitar em silêncio, avisamos o que falta.
  const handleGerarGuia = () => {
    if (!isFormValid) {
      toast.error('Informe o nome do paciente antes de gerar a guia.');
      return;
    }
    if (total === 0) {
      toast.error('Selecione ao menos uma terapia (clique no nome/ícone da terapia).');
      return;
    }
    navigate('/servicos/imprimir');
  };

  const preview = servicosSelecionados.map(getServicoNome).join(', ');

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 pb-28 max-lg:pb-36 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-900">Serviços / Terapias</h1>
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

        {/* 2. IA Justification Assistant (Serviços) */}
        <ServicoJustificativaPanel />

        {/* 3. Therapy Selection Grid */}
        <ServicoSelector />
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
            {total > 0 && (
              <>
                <span className="text-gray-200 shrink-0">·</span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs shrink-0">
                  <HeartPulse size={12} />
                  Terapia selecionada
                </span>
                {preview && <span className="text-xs text-gray-400 truncate hidden sm:block">{preview}</span>}
              </>
            )}
          </div>

          <button
            onClick={handleGerarGuia}
            title={isReadyToPrint ? 'Gerar a guia para impressão' : 'Preencha o paciente e selecione uma terapia'}
            className={`flex shrink-0 items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer ${
              isReadyToPrint
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-100'
                : 'bg-emerald-600/40 text-white hover:bg-emerald-600/60'
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
