import { Building2, Mars, Venus, History } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatCpf } from '../../lib/formatters';
import { OPERADORAS } from '../../data/operadoras';
import type { Convenio, Genero } from '../../types';
import { useRecentPatientsStore, type PacienteRecente } from '../../store/useRecentPatientsStore';
import { savePatientToHistory } from '../../store/patientSync';

export default function PatientForm() {
  const {
    pacienteNome, pacienteCpf, pacienteIdade, numeroBeneficiario,
    sadtOperadora, sadtRegistroAns,
    genero, convenio, setPaciente,
  } = useAppStore();

  const { pacientes: pacientesRecentes } = useRecentPatientsStore();

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

  const handleBlur = () => {
    if (pacienteNome && pacienteNome.trim().length >= 3) {
      savePatientToHistory({
        nome: pacienteNome.trim(),
        cpf: pacienteCpf,
        idade: pacienteIdade,
        genero,
        convenio,
        numeroBeneficiario,
      });
    }
  };

  const handleSelectRecent = (p: PacienteRecente) => {
    setPaciente({
      pacienteNome: p.nome,
      pacienteCpf: p.cpf || '',
      // Sempre sobrescreve: sem isso, a idade do paciente ANTERIOR ficaria
      // grudada no novo paciente e iria para a IA — erro clínico grave.
      pacienteIdade: p.idade || '',
      genero: p.genero || 'M',
      convenio: p.convenio || 'PARTICULAR',
      numeroBeneficiario: p.numeroBeneficiario || '',
    });
  };

  return (
    <div className="bg-neutral-surface rounded-lg border border-neutral-border px-5 py-4.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-x-6 gap-y-3.5">

        {/* Nome */}
        <div className="col-span-full lg:flex-1">
          <input
            type="text"
            value={pacienteNome}
            onChange={(e) => setPaciente({ pacienteNome: e.target.value })}
            onBlur={handleBlur}
            autoFocus
            autoComplete="name"
            placeholder="Nome do paciente *"
            className="w-full text-sm font-semibold text-neutral-text placeholder:font-normal placeholder:text-neutral-text-muted bg-transparent border-b border-neutral-border focus:border-accent-indigo focus:outline-none py-1.5 transition-colors"
          />
        </div>

        {/* Idade — logo ao lado do nome. Alimenta a IA; vazio = "não informada"
            (a IA é instruída a não presumir faixa etária nesse caso). */}
        <div className="w-full lg:w-auto">
          <input
            type="text"
            value={pacienteIdade}
            onChange={(e) => {
              // Só dígitos, no máximo 3 (0–120 anos na prática).
              const v = e.target.value.replace(/\D/g, '').slice(0, 3);
              setPaciente({ pacienteIdade: v });
            }}
            onBlur={handleBlur}
            inputMode="numeric"
            autoComplete="off"
            placeholder="Idade"
            title="Idade em anos — usada pela IA. Se vazio, a IA não presume a faixa etária."
            className="w-full lg:w-20 text-sm text-neutral-text placeholder:text-neutral-text-muted bg-transparent border-b border-neutral-border focus:border-accent-indigo focus:outline-none py-1.5 transition-colors"
          />
        </div>

        {/* Gênero — logo após a idade */}
        <div className="flex gap-1.5 sm:col-span-2 lg:col-span-auto">
          {generos.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPaciente({ genero: value })}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                genero === value
                  ? 'bg-accent-sky text-neutral-surface border-accent-sky'
                  : 'border-neutral-border text-neutral-text-muted hover:border-accent-sky/30 hover:text-accent-sky'
              }`}
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>

        {/* CPF */}
        <div className="w-full lg:w-auto">
          <input
            type="text"
            value={pacienteCpf}
            onChange={(e) => setPaciente({ pacienteCpf: formatCpf(e.target.value) })}
            onBlur={handleBlur}
            inputMode="numeric"
            autoComplete="off"
            placeholder="CPF"
            className="w-full lg:w-32 text-sm text-neutral-text placeholder:text-neutral-text-muted bg-transparent border-b border-neutral-border focus:border-accent-indigo focus:outline-none py-1.5 transition-colors"
          />
        </div>

        {/* Nº Beneficiário */}
        {convenio !== 'PARTICULAR' && (
          <div className="w-full lg:w-auto">
            <input
              type="text"
              value={numeroBeneficiario}
              onChange={(e) => setPaciente({ numeroBeneficiario: e.target.value })}
              onBlur={handleBlur}
              autoComplete="off"
              placeholder={labelBeneficiario[convenio] ?? 'Nº Cartão'}
              className="w-full lg:w-36 text-sm text-neutral-text placeholder:text-neutral-text-muted bg-transparent border-b border-neutral-border focus:border-accent-indigo focus:outline-none py-1.5 transition-colors"
            />
          </div>
        )}

        {/* Separador */}
        <div className="hidden lg:block w-px h-5 bg-neutral-border" />

        {/* Convênio */}
        <div className="flex items-center gap-1.5 flex-wrap sm:col-span-2 lg:col-span-auto">
          <Building2 size={13} className="text-neutral-text-muted shrink-0" />
          <div className="flex flex-wrap gap-1">
            {convenios.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPaciente({ convenio: value })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  convenio === value
                    ? 'bg-primary text-neutral-surface border-primary'
                    : 'border-neutral-border text-neutral-text-muted hover:border-primary/30 hover:text-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Combobox de operadora SADT */}
        {convenio === 'SADT' && (
          <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap sm:col-span-2 lg:col-span-auto">
            <input
              list="operadoras-list"
              value={sadtOperadora}
              onChange={(e) => handleOperadoraChange(e.target.value)}
              onBlur={handleBlur}
              placeholder="Operadora (digite ou deixe vazio = guia limpa)"
              className="flex-1 lg:w-64 text-sm text-neutral-text placeholder:text-neutral-text-muted bg-transparent border-b border-neutral-border focus:border-accent-indigo focus:outline-none py-1.5 transition-colors"
            />
            <datalist id="operadoras-list">
              {OPERADORAS.map((o) => (
                <option key={o.nome} value={o.nome}>
                  {o.registroAns} — {o.grupo}
                </option>
              ))}
            </datalist>
            {sadtRegistroAns && (
              <span className="text-xs font-medium text-neutral-text-muted whitespace-nowrap">
                ANS: <span className="text-neutral-text">{sadtRegistroAns}</span>
              </span>
            )}
          </div>
        )}

      </div>

      {/* Seção Pacientes Recentes */}
      {pacientesRecentes.length > 0 && (
        <div className="mt-4.5 pt-4 border-t border-neutral-border flex flex-wrap items-center gap-2.5 animate-in fade-in duration-300">
          <span className="text-[10px] text-neutral-text-muted font-extrabold uppercase tracking-wider flex items-center gap-1 mr-1">
            <History size={12} className="text-neutral-text-muted" />
            Recentes:
          </span>
          {pacientesRecentes.map((p) => (
            <button
              key={p.nome}
              type="button"
              onClick={() => handleSelectRecent(p)}
              title={`CPF: ${p.cpf || 'Não informado'} | Convênio: ${p.convenio || 'Particular'}`}
              className="px-3 py-1.5 bg-neutral-bg hover:bg-accent-indigo/5 border border-neutral-border hover:border-accent-indigo/35 rounded-full text-xs font-semibold text-neutral-text-muted hover:text-accent-indigo cursor-pointer transition-all"
            >
              {p.nome}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
