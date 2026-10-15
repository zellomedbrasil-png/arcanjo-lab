import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useReceitaStore, type TipoReceita, type MedicamentoReceita } from '../store/useReceitaStore';
import { getMedicamento, type MedicamentoDef } from '../data/medicamentos';
import type { ProtocoloQueixa, VersaoProtocolo } from '../data/protocolos';
import { dosesDe, itemDoCatalogo, itensDoProtocolo, itensSalvos, type ResultadoBusca } from '../data/buscaPrescricao';
import { useAtalhosReceitaStore, chaveCatalogo, ultimaReceitaDo, type ModeloReceita } from '../store/useAtalhosReceitaStore';
import BarraPrescricao, { type BarraPrescricaoHandle } from '../components/receita/BarraPrescricao';
import ItemReceitaLinha from '../components/receita/ItemReceitaLinha';
import PainelExplorar, { type AbaExplorar } from '../components/receita/PainelExplorar';
import AbaTextoIA from '../components/receita/AbaTextoIA';
import AlertasIA from '../components/receita/AlertasIA';
import { gerarPosologia } from '../services/groqReceita';
import { toast } from '../lib/toast';
import DocumentoReceitaView from '../components/print/templates/DocumentoReceitaView';
import { useDocumentosReceita } from '../hooks/useDocumentosReceita';
import { nomeDocumento } from '../utils/agruparReceita';
import { REGRAS_MODELO } from '../data/regrasReceita';
import { enderecoCompleto, pendenciasPrescritor, registroConselho, usePrescritorStore } from '../config/prescritor';
import {
  Printer, RotateCcw, FileText, ChevronDown, ChevronUp, User, Calendar, MapPin, Pill,
  CheckCircle2, Eye, ShieldAlert, History, LayoutGrid, PenLine, Stethoscope, Zap, Repeat,
} from 'lucide-react';
import { useRecentPatientsStore, type PacienteRecente } from '../store/useRecentPatientsStore';
import { savePatientToHistory } from '../store/patientSync';
import { useAppStore } from '../store/useAppStore';

// Formatação de CPF, CEP e Telefone para UX fluida
const formatCpf = (v: string) => {
  const digits = v.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatCep = (v: string) => {
  const digits = v.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const formatTelefone = (v: string) => {
  const digits = v.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

// Preferências de tela (gaveta Explorar) lembradas neste aparelho.
const lerPreferencia = (chave: string) => {
  try { return localStorage.getItem(`arcanjo-lab-receita-${chave}`); } catch { return null; }
};
const gravarPreferencia = (chave: string, valor: string) => {
  try { localStorage.setItem(`arcanjo-lab-receita-${chave}`, valor); } catch { /* modo privativo */ }
};

// ─── Página principal ──────────────────────────────────────────
export default function NovaReceita() {
  const navigate = useNavigate();
  const [editandoPrescritor, setEditandoPrescritor] = useState(false);
  const {
    tipoReceita, pacienteNome, pacienteCpf, pacienteSemCpf, pacienteIdade, pacienteSexo,
    pacienteEndereco, pacienteCep, pacienteCidade, pacienteUf, pacienteTelefone,
    local, data, medicamentos,
    modoEntrada, textoLivre, prescricaoManual,
    setTipoReceita, setPacienteReceita, addMedicamentos, resetReceita, updateMedicamento,
    setModoEntrada, setTextoLivre, setAlertas, setPrescricaoManual,
  } = useReceitaStore();
  const usos = useAtalhosReceitaStore((s) => s.usos);
  const historico = useAtalhosReceitaStore((s) => s.historico);
  const registrarUso = useAtalhosReceitaStore((s) => s.registrarUso);
  const prescritor = usePrescritorStore((s) => s.prescritor);
  const setPrescritor = usePrescritorStore((s) => s.setPrescritor);
  const faltamPrescritor = pendenciasPrescritor(prescritor);

  const { documentos, pendencias, bloqueios } = useDocumentosReceita();
  const avisos = pendencias.filter((p) => p.nivel === 'aviso');

  const { pacientes: pacientesRecentes } = useRecentPatientsStore();

  const handleBlur = () => {
    if (pacienteNome && pacienteNome.trim().length >= 3) {
      const existing = useRecentPatientsStore.getState().pacientes.find(
        (p) => p.nome.toLowerCase() === pacienteNome.trim().toLowerCase()
      );
      const appStoreGenero = useAppStore.getState().genero;
      savePatientToHistory({
        nome: pacienteNome.trim(),
        cpf: pacienteCpf,
        genero: pacienteSexo || existing?.genero || appStoreGenero || 'M',
        endereco: pacienteEndereco,
        cep: pacienteCep,
        cidade: pacienteCidade,
        uf: pacienteUf,
        telefone: pacienteTelefone,
      });
    }
  };

  const handleSelectRecent = (p: PacienteRecente) => {
    setPacienteReceita({
      pacienteNome: p.nome,
      pacienteCpf: p.cpf || '',
      pacienteSexo: p.genero || '',
      pacienteEndereco: p.endereco || '',
      pacienteCep: p.cep || '',
      pacienteCidade: p.cidade || 'Fortaleza',
      pacienteUf: p.uf || 'CE',
      pacienteTelefone: p.telefone || '',
    });
  };

  const fetchAddressByCep = async (cepValue: string) => {
    const rawCep = cepValue.replace(/\D/g, '');
    if (rawCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setPacienteReceita({
            pacienteEndereco: data.logradouro + (data.bairro ? `, ${data.bairro}` : ''),
            pacienteCidade: data.localidade || 'Fortaleza',
            pacienteUf: data.uf || 'CE',
          });
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      }
    }
  };

  const isTextoLivre = modoEntrada === 'TEXTO_LIVRE';
  const isManual = modoEntrada === 'MANUAL';
  const modoTexto = isTextoLivre || isManual;
  const temTextoLivre = isTextoLivre && textoLivre.trim() !== '';
  const temManual = isManual && prescricaoManual.trim() !== '';

  const medsComConteudo = medicamentos.filter((m) => m.principioAtivo || m.nomeDigitado);
  const temMedicamentos = medsComConteudo.length > 0;
  const podeImprimir = bloqueios.length === 0;

  // Campos de paciente que os documentos gerados exigem
  const modelos = new Set(documentos.map((d) => d.modelo));
  const precisaIdadeSexo = modelos.has('RETENCAO') || (modoTexto && tipoReceita === 'RETENCAO');
  const precisaEndereco =
    modelos.has('RCE') || documentos.some((d) => !REGRAS_MODELO[d.modelo].imprimeReceita) || (modoTexto && tipoReceita === 'ESPECIAL');

  // ─── Prescrição rápida ───────────────────────────────────────
  type NovoItem = Omit<Partial<MedicamentoReceita>, 'id'>;

  /** Entrada única de itens: barra, catálogo, protocolo, modelo, histórico, IA. */
  const adicionarItens = (itens: NovoItem[], aviso?: string) => {
    if (!itens.length) return;
    addMedicamentos(itens);
    registrarUso(itens.filter((i) => i.catalogoId).map((i) => chaveCatalogo(i.catalogoId!, i.apresentacao ?? 0)));
    if (aviso) toast.success(aviso);
  };

  const prescreverDoCatalogo = (med: MedicamentoDef, dose: number) => adicionarItens([itemDoCatalogo(med, dose)]);

  const aplicarProtocolo = (p: ProtocoloQueixa, v: VersaoProtocolo) =>
    adicionarItens(itensDoProtocolo(v.medicamentos), `Protocolo "${p.queixa}" aplicado — revise doses e quantidades.`);

  const aplicarModelo = (m: ModeloReceita) => adicionarItens(itensSalvos(m.itens), `Modelo "${m.nome}" aplicado.`);

  const ultimaReceita = pacienteNome.trim() ? ultimaReceitaDo(historico, pacienteNome, pacienteCpf) : undefined;
  const repetirUltima = () => ultimaReceita && adicionarItens(itensSalvos(ultimaReceita.itens), `Receita de ${ultimaReceita.data} repetida.`);

  const escolherDaBarra = (r: ResultadoBusca, opcoes: { dose: number; versao: 'padraoOuro' | 'acessivel' }) => {
    if (r.tipo === 'MED') prescreverDoCatalogo(r.med, opcoes.dose);
    else if (r.tipo === 'PROTOCOLO') aplicarProtocolo(r.protocolo, (opcoes.versao === 'acessivel' && r.protocolo.acessivel) || r.protocolo.padraoOuro);
    else aplicarModelo(r.modelo);
  };

  /** Busca posologia com a IA e preenche o item `id`. */
  const preencherComIA = async (id: string, nome: string) => {
    updateMedicamento(id, { carregando: true, erro: '' });
    try {
      const resultado = await gerarPosologia(nome);
      updateMedicamento(id, { ...resultado, nomeDigitado: nome, carregando: false });
    } catch {
      updateMedicamento(id, {
        carregando: false,
        erro: 'A IA não respondeu. Preencha a posologia à mão ou tente de novo pelo ✎.',
      });
    }
  };

  /** Nome fora do catálogo: entra já na lista (carregando) e a IA completa. */
  const gerarComIA = (nome: string) => {
    addMedicamentos([{ nomeDigitado: nome, principioAtivo: nome }]);
    const novo = [...useReceitaStore.getState().medicamentos].reverse().find((m) => m.nomeDigitado === nome && !m.catalogoId);
    if (novo) preencherComIA(novo.id, nome);
  };

  const completarComIA = (id: string) => {
    const m = useReceitaStore.getState().medicamentos.find((x) => x.id === id);
    if (m) preencherComIA(id, m.nomeDigitado || m.principioAtivo);
  };

  const colarLista = (texto: string) => {
    setTextoLivre(texto);
    setModoEntrada('TEXTO_LIVRE');
  };

  const adicionarDaIA = (itens: NovoItem[], alertasIA: string[]) => {
    adicionarItens(itens, `${itens.length} item(ns) da IA adicionados — confira antes de imprimir.`);
    setAlertas(alertasIA);
    setTextoLivre('');
    setModoEntrada('ESTRUTURADO');
  };

  // Recentes: as 8 doses mais usadas neste aparelho
  const recentes = useMemo(
    () =>
      Object.entries(usos)
        .sort(([, a], [, b]) => b.n - a.n || b.ultimo.localeCompare(a.ultimo))
        .flatMap(([chave]) => {
          const [idCat, dose] = chave.split('|');
          const med = getMedicamento(idCat);
          return med ? [{ chave, med, dose: Number(dose) || 0 }] : [];
        })
        .slice(0, 8),
    [usos]
  );

  // Gaveta Explorar: aberta/fechada e aba lembradas neste aparelho
  const [explorarAberto, setExplorarAberto] = useState(() => lerPreferencia('explorar-aberto') === '1');
  const [abaExplorar, setAbaExplorarState] = useState<AbaExplorar>(() => (lerPreferencia('explorar-aba') as AbaExplorar) || 'PROTOCOLOS');
  const alternarExplorar = () => {
    const proximo = !explorarAberto;
    setExplorarAberto(proximo);
    gravarPreferencia('explorar-aberto', proximo ? '1' : '0');
  };
  const setAbaExplorar = (aba: AbaExplorar) => {
    setAbaExplorarState(aba);
    gravarPreferencia('explorar-aba', aba);
  };

  // Atalhos de teclado: "/" ou Ctrl+K foca a barra; Ctrl+Enter imprime.
  const barraRef = useRef<BarraPrescricaoHandle>(null);
  const podeImprimirRef = useRef(false);
  useEffect(() => {
    podeImprimirRef.current = bloqueios.length === 0;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      const digitando = alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA' || alvo.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setModoEntrada('ESTRUTURADO');
        requestAnimationFrame(() => barraRef.current?.focar());
      } else if (e.key === '/' && !digitando) {
        e.preventDefault();
        setModoEntrada('ESTRUTURADO');
        requestAnimationFrame(() => barraRef.current?.focar());
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && podeImprimirRef.current) {
        e.preventDefault();
        navigate('/receita/imprimir');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, setModoEntrada]);

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all shadow-sm placeholder-gray-300 bg-white";
  const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5";
  const obrig = (sim: boolean) => (sim ? <span className="text-red-400"> *</span> : null);

  const opcoesTipo: Array<{ tipo: TipoReceita; titulo: string; desc: string }> = [
    { tipo: 'SIMPLES', titulo: 'Receita simples', desc: 'Medicamentos comuns · 1 via' },
    { tipo: 'RETENCAO', titulo: 'Antimicrobiano', desc: 'Antibiótico/antifúngico ou GLP-1 · 2 vias' },
    { tipo: 'ESPECIAL', titulo: 'Controle especial', desc: 'Listas C1, C5 · até 3 substâncias · 2 vias' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6 pb-28 max-lg:pb-36">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Receituário Médico</h1>
            <p className="mt-1 text-sm text-gray-500">
              {prescritor.nome} · {registroConselho(prescritor)} · Digite o medicamento ou selecione um modelo rápido
            </p>
          </div>
          <button
            onClick={() => { if (confirm('Limpar todos os dados da receita?')) resetReceita(); }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 hover:text-red-650 hover:bg-red-50 rounded-xl transition-colors border border-gray-200 bg-white shadow-sm font-medium"
          >
            <RotateCcw size={13} />
            Limpar tudo
          </button>
        </div>

        {/* Split Screen Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Coluna Esquerda: Edição */}
          <div className="flex-1 w-full space-y-6">

            {/* Dados do prescritor */}
            <div className={`bg-white rounded-2xl shadow-sm border p-5 ${faltamPrescritor.length ? 'border-red-200' : 'border-gray-100'}`}>
              <button
                type="button"
                onClick={() => setEditandoPrescritor(!editandoPrescritor)}
                className="w-full flex items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Stethoscope size={16} className="text-indigo-500" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Seus dados na receita</span>
                  {faltamPrescritor.length > 0 && (
                    <span className="text-[11px] font-semibold text-red-600">Falta: {faltamPrescritor.join(', ')}</span>
                  )}
                </div>
                {editandoPrescritor ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
              </button>
              {!editandoPrescritor && (
                <p className="mt-2 text-xs text-gray-500">{enderecoCompleto(prescritor) || 'Sem endereço'} · {prescritor.telefone || 'sem telefone'}</p>
              )}
              {editandoPrescritor && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Endereço do consultório (rua, nº, complemento){obrig(true)}</label>
                    <input type="text" value={prescritor.endereco} onChange={(e) => setPrescritor({ endereco: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Bairro{obrig(true)}</label>
                    <input type="text" value={prescritor.bairro} onChange={(e) => setPrescritor({ bairro: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>CEP{obrig(true)}</label>
                    <input type="text" value={prescritor.cep} onChange={(e) => setPrescritor({ cep: formatCep(e.target.value) })} placeholder="00000-000" className={inputCls} />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className={labelCls}>Cidade</label>
                      <input type="text" value={prescritor.cidade} onChange={(e) => setPrescritor({ cidade: e.target.value })} className={inputCls} />
                    </div>
                    <div style={{ width: '80px' }}>
                      <label className={labelCls}>UF</label>
                      <input type="text" value={prescritor.uf} maxLength={2} onChange={(e) => setPrescritor({ uf: e.target.value.toUpperCase() })} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Telefone{obrig(true)}</label>
                    <input type="text" value={prescritor.telefone} onChange={(e) => setPrescritor({ telefone: formatTelefone(e.target.value) })} placeholder="(85) 0000-0000" className={inputCls} />
                  </div>
                  <p className="md:col-span-2 text-[11px] text-gray-500">
                    Endereço completo e telefone do médico são obrigatórios na receita de antimicrobiano (RDC 471/2021) e na de controle especial (Port. 344/98). Ficam salvos neste aparelho.
                  </p>
                </div>
              )}
            </div>

            {/* Tipo de receita: automático no estruturado, escolha manual nos modos texto */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {modoTexto ? (
                <>
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Tipo de receita do texto</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {opcoesTipo.map((o) => (
                      <button
                        key={o.tipo}
                        type="button"
                        onClick={() => setTipoReceita(o.tipo)}
                        className={`relative flex flex-col items-start gap-1 p-3.5 rounded-xl border-2 transition-all text-left ${
                          tipoReceita === o.tipo ? 'border-indigo-600 bg-indigo-50/20' : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <p className={`font-bold text-sm ${tipoReceita === o.tipo ? 'text-indigo-900' : 'text-gray-700'}`}>{o.titulo}</p>
                        <p className="text-xs text-gray-400">{o.desc}</p>
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-gray-500">
                    Notificação azul ou amarela (benzodiazepínicos, zolpidem, opioides fortes, metilfenidato) não sai daqui: use o modo estruturado, que gera a guia para o talonário.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">O que vai ser impresso</h2>
                  {documentos.length === 0 ? (
                    <p className="text-sm text-gray-400">Adicione medicamentos. O sistema separa cada um no papel que a farmácia exige.</p>
                  ) : (
                    <ol className="space-y-1.5">
                      {documentos.map((d, i) => {
                        const notif = !REGRAS_MODELO[d.modelo].imprimeReceita;
                        return (
                          <li key={d.chave} className={`flex items-start gap-2 text-sm ${notif ? 'text-red-700' : 'text-gray-700'}`}>
                            <span className="font-bold text-gray-400 w-4 shrink-0">{i + 1}.</span>
                            <span>
                              <span className="font-semibold">{nomeDocumento(d)}</span>
                              {!notif && (
                                <span className="text-gray-500"> — {d.medicamentos.map((m) => (m.nomeDigitado || m.principioAtivo).replace(/\s+\d.*$/, '')).join(', ')}</span>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </>
              )}
            </div>

            {/* Dados do Paciente */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-50">
                <User size={18} className="text-indigo-500" />
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Dados do Paciente</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="md:col-span-2">
                  <label className={labelCls}>Nome Completo{obrig(true)}</label>
                  <input type="text" value={pacienteNome} onChange={(e) => setPacienteReceita({ pacienteNome: e.target.value })} onBlur={handleBlur} placeholder="Nome completo do paciente" className={inputCls} />
                  {pacientesRecentes.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 animate-in fade-in duration-300">
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider flex items-center gap-1 mr-1">
                        <History size={12} className="text-gray-400" />
                        Recentes:
                      </span>
                      {pacientesRecentes.map((p) => (
                        <button
                          key={p.nome}
                          type="button"
                          onClick={() => handleSelectRecent(p)}
                          title={`CPF: ${p.cpf || 'Não informado'} | Endereço: ${p.endereco || 'Não informado'}`}
                          className="px-2.5 py-1 bg-gray-50/70 hover:bg-indigo-50 border border-gray-200/80 hover:border-indigo-200 rounded-full text-xs font-semibold text-gray-600 hover:text-indigo-655 hover:shadow-sm transition-all"
                        >
                          {p.nome}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <div style={{ width: '110px' }}>
                    <label className={labelCls}>Idade{obrig(precisaIdadeSexo)}</label>
                    <input type="text" inputMode="numeric" value={pacienteIdade} onChange={(e) => setPacienteReceita({ pacienteIdade: e.target.value.replace(/[^\d]/g, '').slice(0, 3) })} placeholder="anos" className={inputCls} />
                  </div>
                  <div className="flex-1">
                    <label className={labelCls}>Sexo{obrig(precisaIdadeSexo)}</label>
                    <div className="flex gap-2">
                      {(['F', 'M'] as const).map((sx) => (
                        <button
                          key={sx}
                          type="button"
                          onClick={() => setPacienteReceita({ pacienteSexo: pacienteSexo === sx ? '' : sx })}
                          className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                            pacienteSexo === sx ? 'border-indigo-600 bg-indigo-50 text-indigo-800' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {sx === 'F' ? 'Feminino' : 'Masculino'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>CPF{obrig(precisaEndereco)}</label>
                  <input type="text" value={pacienteCpf} disabled={pacienteSemCpf} onChange={(e) => setPacienteReceita({ pacienteCpf: formatCpf(e.target.value) })} onBlur={handleBlur} placeholder={pacienteSemCpf ? 'Não possui' : '000.000.000-00'} className={`${inputCls} disabled:bg-gray-50`} />
                  <label className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                    <input type="checkbox" checked={pacienteSemCpf} onChange={(e) => setPacienteReceita({ pacienteSemCpf: e.target.checked, ...(e.target.checked ? { pacienteCpf: '' } : {}) })} />
                    Não possui CPF
                  </label>
                </div>

                {precisaEndereco && (
                  <>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Endereço (Rua, Nº, Bairro){obrig(true)}</label>
                      <input type="text" value={pacienteEndereco} onChange={(e) => setPacienteReceita({ pacienteEndereco: e.target.value })} onBlur={handleBlur} placeholder="Rua, número, bairro" className={inputCls} />
                    </div>

                    <div>
                      <label className={labelCls}>CEP</label>
                      <input
                        type="text"
                        value={pacienteCep}
                        onChange={(e) => {
                          const formatted = formatCep(e.target.value);
                          setPacienteReceita({ pacienteCep: formatted });
                          fetchAddressByCep(formatted);
                        }}
                        onBlur={handleBlur}
                        placeholder="00000-000"
                        className={inputCls}
                      />
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className={labelCls}>Cidade</label>
                        <input type="text" value={pacienteCidade} onChange={(e) => setPacienteReceita({ pacienteCidade: e.target.value })} onBlur={handleBlur} placeholder="Fortaleza" className={inputCls} />
                      </div>
                      <div style={{ width: '80px' }}>
                        <label className={labelCls}>UF</label>
                        <input type="text" value={pacienteUf} onChange={(e) => setPacienteReceita({ pacienteUf: e.target.value })} onBlur={handleBlur} placeholder="CE" maxLength={2} className={inputCls} />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Telefone</label>
                      <input type="text" value={pacienteTelefone} onChange={(e) => setPacienteReceita({ pacienteTelefone: formatTelefone(e.target.value) })} onBlur={handleBlur} placeholder="(85) 00000-0000" className={inputCls} />
                    </div>
                  </>
                )}

                <div className="flex gap-3 md:col-span-2">
                  <div className="flex-1">
                    <label className={labelCls}>
                      <Calendar size={11} className="inline mr-1" />Data
                    </label>
                    <input type="text" value={data} onChange={(e) => setPacienteReceita({ data: e.target.value })} className={inputCls} />
                  </div>
                  <div className="flex-1">
                    <label className={labelCls}>
                      <MapPin size={11} className="inline mr-1" />Local
                    </label>
                    <input type="text" value={local} onChange={(e) => setPacienteReceita({ local: e.target.value })} className={inputCls} />
                  </div>
                </div>
              </div>
            </div>

            {/* Medicamentos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Pill size={18} className="text-indigo-500" />
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Medicamentos</h2>
                </div>
                <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200/50">
                  {([
                    ['ESTRUTURADO', 'Rápido', Zap],
                    ['TEXTO_LIVRE', 'Texto / IA', PenLine],
                    ['MANUAL', 'Manual', FileText],
                  ] as const).map(([modo, rotulo, Icone]) => (
                    <button
                      key={modo}
                      type="button"
                      onClick={() => setModoEntrada(modo)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        modoEntrada === modo ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <Icone size={14} />
                      {rotulo}
                    </button>
                  ))}
                </div>
              </div>

              {isManual ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">
                    Sem IA: o texto sai impresso exatamente como digitado, no tipo de receita escolhido acima.
                  </p>
                  <textarea
                    value={prescricaoManual}
                    onChange={(e) => setPrescricaoManual(e.target.value)}
                    rows={14}
                    placeholder={`1) Losartana 50mg ............ 1 comprimido pela manhã\n2) Metformina 850mg ......... 1 comprimido após o jantar\n\nUso contínuo. Retornar em 30 dias.`}
                    className="w-full border border-gray-200 rounded-xl text-sm py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-y placeholder:text-gray-300 font-mono leading-relaxed"
                  />
                </div>
              ) : isTextoLivre ? (
                <AbaTextoIA onAdicionar={adicionarDaIA} />
              ) : (
                <div className="space-y-3">
                  <BarraPrescricao ref={barraRef} onEscolher={escolherDaBarra} onGerarIA={gerarComIA} onColarLista={colarLista} />

                  {/* Atalhos de 1 clique */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {ultimaReceita && (
                      <button
                        type="button"
                        onClick={repetirUltima}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 hover:border-emerald-400"
                      >
                        <Repeat size={14} /> Repetir última receita ({ultimaReceita.data} · {ultimaReceita.itens.length} itens)
                      </button>
                    )}
                    {recentes.map(({ chave, med, dose }, i) => (
                      <button
                        key={chave}
                        type="button"
                        onClick={() => prescreverDoCatalogo(med, dose)}
                        title={med.principioAtivo}
                        className={`px-3 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-700 ${i >= 4 ? 'hidden sm:inline-block' : ''}`}
                      >
                        {med.nome.replace(/\s+\d.*$/, '')} {dosesDe(med)[dose]?.rotulo}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => alternarExplorar()}
                      className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border ${
                        explorarAberto ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-indigo-200 text-indigo-700 hover:border-indigo-400'
                      }`}
                    >
                      <LayoutGrid size={14} /> Explorar {explorarAberto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {explorarAberto && (
                    <PainelExplorar
                      aba={abaExplorar}
                      onAba={setAbaExplorar}
                      onPrescrever={prescreverDoCatalogo}
                      onAplicarProtocolo={aplicarProtocolo}
                      onAplicarModelo={aplicarModelo}
                    />
                  )}

                  <AlertasIA />

                  {medsComConteudo.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
                      Digite na barra e aperte <kbd className="px-1.5 py-0.5 border rounded bg-gray-50 text-xs">Enter</kbd> — o remédio entra e a barra já fica pronta para o próximo.
                      <br />
                      Uma queixa (ex.: <em>insônia</em>, <em>ITU</em>) traz o protocolo inteiro.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {medsComConteudo.map((m, i) => (
                        <ItemReceitaLinha key={m.id} id={m.id} index={i} onGerarIA={completarComIA} />
                      ))}
                    </div>
                  )}

                  <p className="hidden sm:block text-[11px] text-gray-400">
                    Atalhos: <kbd>/</kbd> ou <kbd>Ctrl K</kbd> buscar · <kbd>↑↓</kbd> escolher · <kbd>←→</kbd> trocar dose · <kbd>Enter</kbd> adicionar · <kbd>Ctrl Enter</kbd> imprimir
                  </p>
                </div>
              )}
            </div>

            {/* Checklist antes de imprimir */}
            {(temMedicamentos || temTextoLivre || temManual) && (
              <div
                className={`rounded-2xl p-5 border shadow-sm ${
                  podeImprimir ? 'bg-gradient-to-br from-green-50/60 to-emerald-50/30 border-green-200' : 'bg-red-50/50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl p-3 shadow text-white shrink-0 ${podeImprimir ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-red-500'}`}>
                    {podeImprimir ? <Eye size={20} /> : <ShieldAlert size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${podeImprimir ? 'text-green-900' : 'text-red-900'}`}>
                      {podeImprimir ? 'Receituário pronto para imprimir' : 'A farmácia vai devolver — falta corrigir:'}
                    </p>
                    {podeImprimir && (
                      <p className="text-xs text-green-700 mt-1">
                        {documentos.length} {documentos.length === 1 ? 'folha' : 'folhas'}: {documentos.map(nomeDocumento).join(' · ')}
                      </p>
                    )}
                  </div>
                  {podeImprimir && (
                    <button
                      onClick={() => navigate('/receita/imprimir')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-sm hover:from-green-700 hover:to-emerald-700 transition-all shadow-md shadow-green-200"
                    >
                      <Eye size={15} />
                      Visualizar Impressão
                    </button>
                  )}
                </div>
                {bloqueios.length > 0 && (
                  <ul className="mt-3 ml-16 list-disc text-xs text-red-800 space-y-1">
                    {bloqueios.map((p) => <li key={p.texto}>{p.texto}</li>)}
                  </ul>
                )}
                {avisos.length > 0 && (
                  <ul className="mt-3 ml-16 list-disc text-xs text-amber-800 space-y-1">
                    {avisos.map((p) => <li key={p.texto}>{p.texto}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Coluna Direita: prévia A4 — os mesmos documentos que vão para a impressão */}
          <div className="sticky top-6 hidden lg:block w-[380px] shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <div className="flex items-center gap-1.5">
                  <Eye size={14} className="text-indigo-500" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Visualização A4</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {documentos.length} {documentos.length === 1 ? 'folha' : 'folhas'}
                </span>
              </div>

              <div className="bg-gray-100 rounded-xl p-3 flex flex-col items-center gap-4 overflow-y-auto h-[540px] border border-gray-200/50 shadow-inner relative scrollbar-thin">
                {documentos.length === 0 && (
                  <p className="text-xs text-gray-400 mt-8 text-center px-6">A prévia aparece aqui assim que houver um medicamento.</p>
                )}
                {documentos.map((doc, i) => (
                  <div key={doc.chave} className="flex flex-col items-center gap-1.5">
                    <div className="text-[10px] text-gray-500 font-bold bg-white px-2 py-0.5 rounded shadow-sm text-center">
                      {i + 1}. {nomeDocumento(doc)}
                    </div>
                    <div style={{ width: '301.6px', height: '426.5px', overflow: 'hidden' }} className="relative rounded shadow-md border border-gray-300 shrink-0">
                      <div className="origin-top-left" style={{ transform: 'scale(0.38)', width: '21cm', height: '29.7cm', backgroundColor: '#fff' }}>
                        <DocumentoReceitaView doc={doc} />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl p-2 text-center text-[10px] text-gray-500 font-semibold shadow-sm w-full mt-2">
                  Atualizado em tempo real
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 lg:left-64 left-0 right-0 z-30 lg:z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl px-4 py-4 no-print max-lg:bottom-[calc(3.5rem+env(safe-area-inset-bottom))]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm min-w-0">
            <div className={`flex items-center gap-1.5 ${pacienteNome ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle2 size={15} />
              <span className="font-semibold truncate">{pacienteNome || 'Sem paciente identificado'}</span>
            </div>
            {documentos.length > 0 && (
              <>
                <span className="text-gray-300">·</span>
                <span className="font-bold text-xs text-indigo-600">
                  {documentos.length} {documentos.length === 1 ? 'folha' : 'folhas'}
                </span>
              </>
            )}
            {bloqueios.length > 0 && (
              <>
                <span className="text-gray-300">·</span>
                <span className="font-bold text-xs text-red-600">{bloqueios.length} pendência{bloqueios.length > 1 ? 's' : ''}</span>
              </>
            )}
          </div>

          <button
            onClick={() => navigate('/receita/imprimir')}
            disabled={!podeImprimir}
            className={`flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-sm transition-all shadow-md ${
              !podeImprimir
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200/50 shadow-none'
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg shadow-indigo-200'
            }`}
          >
            <Printer size={16} />
            {documentos.length > 1 ? `Imprimir ${documentos.length} folhas` : 'Imprimir receita'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
