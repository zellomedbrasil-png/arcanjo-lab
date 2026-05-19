import { Building2, Mars, UserRound, Venus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatCpf } from '../../lib/formatters';
import type { Convenio, Genero } from '../../types';

export default function PatientForm() {
  const { pacienteNome, pacienteCpf, genero, convenio, setPaciente } = useAppStore();

  const convenioOptions: Array<{ value: Convenio; label: string; hint: string }> = [
    { value: 'IPM', label: 'IPM', hint: 'guia municipal' },
    { value: 'ISSEC', label: 'ISSEC', hint: 'guia estadual' },
    { value: 'PARTICULAR', label: 'Particular', hint: 'sem convênio' },
  ];

  const generoOptions: Array<{ value: Genero; label: string; icon: typeof Mars }> = [
    { value: 'M', label: 'Masculino', icon: Mars },
    { value: 'F', label: 'Feminino', icon: Venus },
  ];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <UserRound size={19} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Paciente e guia</h2>
          <p className="text-xs text-gray-500">Dados mínimos para liberar a impressão rapidamente.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
            Nome completo <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={pacienteNome}
            onChange={(e) => setPaciente({ pacienteNome: e.target.value })}
            autoComplete="name"
            autoFocus
            className="w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            placeholder="Nome do paciente"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">CPF</label>
          <input
            type="text"
            value={pacienteCpf}
            onChange={(e) => setPaciente({ pacienteCpf: formatCpf(e.target.value) })}
            inputMode="numeric"
            autoComplete="off"
            className="w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            placeholder="000.000.000-00"
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            <Building2 size={13} />
            Convênio
          </label>
          <div className="grid grid-cols-3 gap-2">
            {convenioOptions.map(({ value, label, hint }) => {
              const active = convenio === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaciente({ convenio: value })}
                  className={`rounded-xl border px-3 py-3 text-left transition-all ${
                    active
                      ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50/50'
                  }`}
                >
                  <span className="block text-sm font-bold">{label}</span>
                  <span className="block text-[11px] text-gray-400 leading-tight">{hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Gênero</label>
          <div className="grid grid-cols-2 gap-2">
            {generoOptions.map(({ value, label, icon: Icon }) => {
              const active = genero === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaciente({ genero: value })}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${
                    active
                      ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-sky-200 hover:bg-sky-50/50'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
