import { RotateCcw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PatientForm from '../components/patient/PatientForm';
import SOAPPanel from '../components/soap/SOAPPanel';
import { useAppStore } from '../store/useAppStore';
import { formatDraftTime } from '../lib/formatters';

export default function Prontuario() {
  const { lastSavedAt, resetForm } = useAppStore();

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 pb-16 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold font-display tracking-tight text-neutral-text">Prontuário (SOAP)</h1>
            <p className="text-xs text-neutral-text-muted mt-0.5">Consulta, nota clínica e histórico do paciente · {formatDraftTime(lastSavedAt)}</p>
          </div>
          <div>
            <button
              onClick={() => {
                if (confirm('Limpar todos os dados do prontuário e formulário?')) {
                  resetForm();
                }
              }}
              className="flex items-center gap-1 px-3.5 py-2 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 bg-white cursor-pointer font-medium"
            >
              <RotateCcw size={12} />
              Limpar Tudo
            </button>
          </div>
        </div>

        {/* 1. Patient Form */}
        <PatientForm />

        {/* 2. SOAP & Clinical History Panel */}
        <SOAPPanel />
      </div>
    </Layout>
  );
}
