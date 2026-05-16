import { useAppStore } from '../../store/useAppStore';
import type { Convenio } from '../../types';

export default function PatientForm() {
  const {
    pacienteNome,
    pacienteCpf,
    genero,
    convenio,
    setPaciente
  } = useAppStore();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Dados do Paciente e Guia</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Convênio</label>
            <div className="flex space-x-4 flex-wrap gap-y-2">
              {[
                { value: 'IPM', label: 'IPM' },
                { value: 'ISSEC', label: 'ISSEC' },
                { value: 'PARTICULAR', label: 'Particular' },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center">
                  <input
                    type="radio"
                    name="convenio"
                    value={value}
                    checked={convenio === value}
                    onChange={(e) => setPaciente({ convenio: e.target.value as Convenio })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="genero"
                  value="M"
                  checked={genero === 'M'}
                  onChange={() => setPaciente({ genero: 'M' })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Masculino</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="genero"
                  value="F"
                  checked={genero === 'F'}
                  onChange={() => setPaciente({ genero: 'F' })}
                  className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-500"
                />
                <span className="ml-2 text-gray-700">Feminino</span>
              </label>
            </div>
          </div>
        </div>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
          <input
            type="text"
            value={pacienteNome}
            onChange={(e) => setPaciente({ pacienteNome: e.target.value })}
            className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nome do paciente"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
          <input
            type="text"
            value={pacienteCpf}
            onChange={(e) => setPaciente({ pacienteCpf: e.target.value })}
            className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="000.000.000-00"
          />
        </div>
      </div>
    </div>
  );
}
