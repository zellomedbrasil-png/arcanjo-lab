import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ClipboardCheck, FileText, Printer, RotateCcw, Sparkles } from 'lucide-react';
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

  const etapas = [
    { label: 'Paciente', done: isFormValid },
    { label: isLab ? 'Exames' : 'Procedimentos', done: hasExames },
    { label: 'Impressão', done: isReadyToPrint },
  ];

  const proximaAcao = !isFormValid
    ? 'Informe o nome do paciente.'
    : !hasExames
      ? `Selecione pelo menos 1 ${isLab ? 'exame' : 'procedimento'}.`
      : 'Pronto para gerar a guia oficial.';

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
      <div className="max-w-5xl mx-auto px-4 py-6 pb-32">
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Novo Pedido Médico</h1>
            <p className="mt-1 text-sm text-gray-500">
              Fluxo rápido para preencher paciente, exames e justificativa clínica.
            </p>
          </div>
          <button
            onClick={() => { if (confirm('Limpar todos os dados do formulário?')) resetForm(); }}
            className="flex w-fit items-center gap-1.5 px-3 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
          >
            <RotateCcw size={13} />
            Limpar
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-3">
              {etapas.map((etapa, index) => (
                <div key={etapa.label} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-gray-50 px-3 py-2">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    etapa.done ? 'bg-green-500 text-white' : 'bg-white text-gray-400 border border-gray-200'
                  }`}>
                    {etapa.done ? <CheckCircle size={14} /> : index + 1}
                  </div>
                  <span className={`text-sm font-semibold ${etapa.done ? 'text-gray-800' : 'text-gray-400'}`}>
                    {etapa.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <ClipboardCheck size={14} className={isReadyToPrint ? 'text-green-500' : 'text-blue-500'} />
              <span>{proximaAcao}</span>
              <span className="text-gray-300">·</span>
              <span>{formatDraftTime(lastSavedAt)}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-700 shadow-sm lg:w-64">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles size={14} />
              Atalho de agilidade
            </div>
            <p className="mt-1 text-indigo-600">Com a guia pronta, use <strong>Ctrl+Enter</strong> para imprimir.</p>
          </div>
        </div>

        <PatientForm />
        <ExamPastePanel />
        <ExamSelector />
        <SOAPPanel />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-3 text-sm">
            <div className={`flex items-center gap-1.5 ${isFormValid ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle size={14} />
              <span className="max-w-[220px] truncate font-medium">{isFormValid ? pacienteNome : 'Sem paciente'}</span>
            </div>
            {hasExames && <span className="text-gray-400">·</span>}
            {hasExames && (
              <span className="flex items-center gap-1 text-blue-600 font-semibold text-xs">
                <FileText size={13} />
                {totalSelecionados} {isLab ? 'exame(s)' : 'procedimento(s)'}
              </span>
            )}
          </div>

          <button
            onClick={() => navigate('/imprimir')}
            disabled={!isReadyToPrint}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
              isReadyToPrint
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Printer size={16} />
            Gerar Guia Oficial
          </button>
        </div>
      </div>
    </Layout>
  );
}
