import { Building2, Mars, Venus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatCpf } from '../../lib/formatters';
import { OPERADORAS } from '../../data/operadoras';
import type { Convenio, Genero } from '../../types';

export default function PatientForm() {
  const {
    pacienteNome, pacienteCpf, numeroBeneficiario,
    sadtOperadora, sadtRegistroAns,
    genero, convenio, setPaciente,
  } = useAppStore();

  const convenios: Array<{ value: Convenio; label: string }> = [
    { value: 'IPM',        label: 'IPM' },
    { value: 'ISSEC',      label: 'ISSEC' },
    { value: 'SADT',       label: 'SADT' },
    { value: 'PARTICULAR', label: 'Particular' },
  ];

  const labelBeneficiario: Partial<Record<Convenio, string>> = {
    IPM:   'Matrícula IPM',
    ISSEC: 'Cartão ISSEC',
    SADT:  'Nº Cartão',
  };

  const generos: Array<{ value: Genero; label: string; icon: typeof Mars }> = [
    { value: 'M', label: 'M', icon: Mars },
    { value: 'F', label: 'F', icon: Venus },
  ];

  const handleOperadoraChange = (nome: string) => {
    const op = OPERADORAS.find((o) => o.nome.toLowerCase() === nome.toLowerCase());
    setPaciente({
      sadtOperadora: nome,
      sadtRegistroAns: op?.registroAns ?? '',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">

        {/* Nome */}
        <input
          type="text"
          value={pacienteNome}
          onChange={(e) => setPaciente({ pacienteNome: e.target.value })}
          autoFocus
          autoComplete="name"
          placeholder="Nome do paciente *"
          className="flex-1 min-w-[180px] text-sm font-semibold text-gray-800 placeholder:font-normal placeholder:text-gray-400 bg-transparent border-b border-gray-200 focus:border-indigo-400 focus:outline-none py-1 transition-colors"
        />

        {/* CPF */}
        <input
          type="text"
          value={pacienteCpf}
          onChange={(e) => setPaciente({ pacienteCpf: formatCpf(e.target.value) })}
          inputMode="numeric"
          autoComplete="off"
          placeholder="CPF"
          className="w-32 text-sm text-gray-700 placeholder:text-gray-400 bg-transparent border-b border-gray-200 focus:border-indigo-400 focus:outline-none py-1 transition-colors"
        />

        {/* Nº Beneficiário */}
        {convenio !== 'PARTICULAR' && (
          <input
            type="text"
            value={numeroBeneficiario}
            onChange={(e) => setPaciente({ numeroBeneficiario: e.target.value })}
            autoComplete="off"
            placeholder={labelBeneficiario[convenio] ?? 'Nº Cartão'}
            className="w-36 text-sm text-gray-700 placeholder:text-gray-400 bg-transparent border-b border-gray-200 focus:border-indigo-400 focus:outline-none py-1 transition-colors"
          />
        )}

        {/* Separador */}
        <div className="hidden sm:block w-px h-5 bg-gray-200" />

        {/* Convênio */}
        <div className="flex items-center gap-1">
          <Building2 size={13} className="text-gray-400 shrink-0" />
          {convenios.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPaciente({ convenio: value })}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                convenio === value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Combobox de operadora SADT */}
        {convenio === 'SADT' && (
          <div className="flex items-center gap-2">
            <input
              list="operadoras-list"
              value={sadtOperadora}
              onChange={(e) => handleOperadoraChange(e.target.value)}
              placeholder="Operadora (digite ou deixe vazio = guia limpa)"
              className="w-64 text-sm text-gray-700 placeholder:text-gray-400 bg-transparent border-b border-gray-200 focus:border-indigo-400 focus:outline-none py-1 transition-colors"
            />
            <datalist id="operadoras-list">
              {OPERADORAS.map((o) => (
                <option key={o.nome} value={o.nome}>
                  {o.registroAns} — {o.grupo}
                </option>
              ))}
            </datalist>
            {sadtRegistroAns && (
              <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                ANS: <span className="text-gray-800">{sadtRegistroAns}</span>
              </span>
            )}
          </div>
        )}

        {/* Gênero */}
        <div className="flex gap-1">
          {generos.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPaciente({ genero: value })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                genero === value
                  ? 'bg-sky-500 text-white border-sky-500'
                  : 'border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-600'
              }`}
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
