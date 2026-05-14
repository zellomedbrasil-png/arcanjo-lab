import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PatientForm from '../components/patient/PatientForm';
import ExamSelector from '../components/exams/ExamSelector';
import SOAPPanel from '../components/soap/SOAPPanel';
import { Printer, RotateCcw, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function NovoPedido() {
  const navigate = useNavigate();
  const { pacienteNome, examesSelecionados, procedimentosSelecionados, tipoGuia, resetForm } = useAppStore();

  const isLab = tipoGuia === 'LABORATORIO';
  const hasExames = isLab ? examesSelecionados.length > 0 : procedimentosSelecionados.length > 0;
  const isFormValid = pacienteNome.trim() !== '';
  const isReadyToPrint = isFormValid && hasExames;

  const totalSelecionados = isLab ? examesSelecionados.length : procedimentosSelecionados.length;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6 pb-28">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Novo Pedido Médico</h1>
            <p className="mt-1 text-sm text-gray-500">
              Preencha os dados do paciente, selecione os exames e gere a justificativa clínica.
            </p>
          </div>
          <button
            onClick={() => { if (confirm('Limpar todos os dados do formulário?')) resetForm(); }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
          >
            <RotateCcw size={13} />
            Limpar
          </button>
        </div>

        <PatientForm />
        <ExamSelector />
        <SOAPPanel />
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Status summary */}
          <div className="flex items-center gap-3 text-sm">
            <div className={`flex items-center gap-1.5 ${isFormValid ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle size={14} />
              <span className="font-medium">{isFormValid ? pacienteNome : 'Sem paciente'}</span>
            </div>
            {hasExames && (
              <span className="text-gray-400">·</span>
            )}
            {hasExames && (
              <span className="text-blue-600 font-semibold text-xs">
                {totalSelecionados} {isLab ? 'exame(s)' : 'procedimento(s)'}
              </span>
            )}
          </div>

          {/* Print button */}
          <button
            onClick={() => navigate('/imprimir')}
            disabled={!isReadyToPrint}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
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
