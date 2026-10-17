import type { ClipboardEvent } from 'react';
import { Building2, Mars, Venus, History, ClipboardPaste } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatCpf } from '../../lib/formatters';
import { toast } from '../../lib/toast';
import { OPERADORAS } from '../../data/operadoras';
import type { Convenio, Genero } from '../../types';
import { useRecentPatientsStore, type PacienteRecente } from '../../store/useRecentPatientsStore';
import { publishPatientSync, savePatientToHistory } from '../../store/patientSync';
import { lerCabecalhoPaciente, type DadosColados } from '../../utils/lerCabecalhoPaciente';
// Carrega o store de Documentos já aqui: ele só escuta a sincronização depois de
// importado, e o nascimento colado no Prontuário precisa chegar até ele.
import '../../store/useDocumentStore';

/** "28/10/1990" → "1990-10-28" (formato que os Documentos usam para calcular a idade). */
const dataIso = (ddmmaaaa?: string) => {
  const m = ddmmaaaa?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
};

export default function PatientForm() {
  // Seletores por campo: este formulário é digitado o tempo todo e divide o
  // store com telas pesadas (grade de exames, painel SOAP). Assinando o store
  // inteiro, ele também re-renderizava quando nada seu havia mudado.
  const pacienteNome = useAppStore((s) => s.pacienteNome);
  const pacienteCpf = useAppStore((s) => s.pacienteCpf);
  const pacienteIdade = useAppStore((s) => s.pacienteIdade);
  const numeroBeneficiario = useAppStore((s) => s.numeroBeneficiario);
  const sadtOperadora = useAppStore((s) => s.sadtOperadora);
  const sadtRegistroAns = useAppStore((s) => s.sadtRegistroAns);
  const genero = useAppStore((s) => s.genero);
  const convenio = useAppStore((s) => s.convenio);
  const setPaciente = useAppStore((s) => s.setPaciente);

  const pacientesRecentes = useRecentPatientsStore((s) => s.pacientes);

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

  // Cabeçalho colado do sistema do convênio = paciente novo: o que não veio no
  // bloco é limpo, para nada do paciente anterior ficar grudado.
  const aplicarColagem = (d: DadosColados) => {
    const convenioFinal = d.convenio ?? convenio;
    setPaciente({
      pacienteNome: d.nome,
      pacienteIdade: d.idade ?? '',
      pacienteCpf: d.cpf ?? '',
      ...(d.genero ? { genero: d.genero } : {}),
      convenio: convenioFinal,
      numeroBeneficiario: d.numeroBeneficiario ?? '',
    });
    // Endereço e nascimento não moram neste formulário: vão para Receituário e Documentos.
    publishPatientSync('colagem', {
      pacienteEndereco: d.endereco ?? '',
      pacienteCidade: d.cidade ?? '',
      pacienteUf: d.uf ?? '',
      pacienteCep: d.cep ?? '',
      pacienteTelefone: d.telefone ?? '',
      pacienteDataNascimento: dataIso(d.nascimento),
    });
    savePatientToHistory({
      nome: d.nome,
      cpf: d.cpf ?? '',
      idade: d.idade ?? '',
      genero: d.genero ?? genero,
      convenio: convenioFinal,
      numeroBeneficiario: d.numeroBeneficiario ?? '',
    });
    toast.success(`Preenchido: ${d.lidos.join(', ')}`);
  };

  /** Ctrl+V no nome: se for o cabeçalho do sistema, preenche tudo; senão, cola normal. */
  const handleColarNoNome = (e: ClipboardEvent<HTMLInputElement>) => {
    const dados = lerCabecalhoPaciente(e.clipboardData.getData('text/plain'));
    if (!dados) return;
    e.preventDefault();
    aplicarColagem(dados);
  };

  const colarDoSistema = async () => {
    try {
      const dados = lerCabecalhoPaciente(await navigator.clipboard.readText());
      if (dados) return aplicarColagem(dados);
    } catch {
      // Navegador negou acesso à área de transferência: cai no aviso abaixo.
    }
    toast.info('Copie o cabeçalho do paciente no sistema e cole no campo do nome (Ctrl+V).');
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
            onPaste={handleColarNoNome}
            autoFocus
            autoComplete="name"
            placeholder="Nome do paciente * (ou cole o cabeçalho do sistema)"
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

      {/* Pacientes recentes + colar do sistema (opcional) */}
      <div className="mt-4.5 pt-4 border-t border-neutral-border flex flex-wrap items-center gap-2.5 animate-in fade-in duration-300">
        <button
          type="button"
          onClick={colarDoSistema}
          title="Copie o cabeçalho do paciente no sistema do convênio (Ctrl+C) e clique aqui — ou cole direto no campo do nome"
          className="order-last ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-dashed border-neutral-border text-neutral-text-muted hover:border-accent-indigo/40 hover:text-accent-indigo cursor-pointer transition-all"
        >
          <ClipboardPaste size={12} />
          Colar do sistema
        </button>
        {pacientesRecentes.length > 0 && (
          <span className="text-[10px] text-neutral-text-muted font-extrabold uppercase tracking-wider flex items-center gap-1 mr-1">
            <History size={12} className="text-neutral-text-muted" />
            Recentes:
          </span>
        )}
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
    </div>
  );
}
