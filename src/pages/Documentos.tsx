import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useDocumentStore } from '../store/useDocumentStore';
import type { TipoDocumento, AsoTipoExame } from '../store/useDocumentStore';
import { gerarLaudoIA, gerarAtestadoIA } from '../services/groqDocumento';
import DocumentoTemplate from '../components/print/templates/DocumentoTemplate';
import {
  FileText, ShieldAlert, Sparkles, Printer, User,
  Clock, Dumbbell, ShieldCheck, HeartHandshake, FileSpreadsheet, RotateCcw,
  CheckCircle2, Loader2, Eye
} from 'lucide-react';
import { useRecentPatientsStore } from '../store/useRecentPatientsStore';
import { savePatientToHistory } from '../store/patientSync';
import { useAppStore } from '../store/useAppStore';
import { getDefaultModelId, AI_MODELS } from '../config/gemini';

const formatCnpj = (v: string) => {
  const digits = v.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

// Common Medical Presets
const PRESETS = {
  LAUDO: [
    {
      label: 'Demência de Alzheimer',
      categoria: 'Cognitivo / Neuro',
      diagnostico: 'Demência na Doença de Alzheimer de início tardio',
      cid: 'F00.1',
      historico: 'Paciente idoso apresenta declínio cognitivo progressivo há 3 anos, com comprometimento grave de memória episódica, desorientação têmporo-espacial, apraxia ideomotora e episódios de agitação psicomotora. Necessita de auxílio e supervisão constante de terceiros para Atividades de Vida Diária (AVDs). Mini Mental (MEEM): 12/30.',
      conduta: 'Uso contínuo de Cloridrato de Donepezila 10mg/dia e Memantina 20mg/dia. Recomendada estimulação cognitiva contínua, acompanhamento por cuidador 24 horas por dia e adaptações domiciliares para prevenção de quedas.',
      prognostico: 'Reservado, por tratar-se de patologia neurodegenerativa progressiva e irreversível.',
      finalidade: 'Apresentação ao INSS / Solicitação de cuidador e curatela judicial.'
    },
    {
      label: 'Cardiopatia Grave (INSS)',
      categoria: 'Cardiovascular',
      diagnostico: 'Insuficiência Cardíaca Congestiva classe funcional NYHA III',
      cid: 'I50.0',
      historico: 'Paciente com miocardiopatia isquêmica crônica, submetido a angioplastia prévia há 2 anos, evoluindo com dispneia aos mínimos esforços, ortopneia e edema de membros inferiores recorrente. Ecocardiograma recente evidencia Fração de Ejeção do Ventrículo Esquerdo (FEVE) de 28%, sugerindo disfunção sistólica grave.',
      conduta: 'Otimização medicamentosa com Sacubitril/Valsartana, Carvedilol, Espironolactona e Furosemida. Restrição hídrica, controle rigoroso de sódio na dieta e repouso de atividades com esforço físico moderado/pesado.',
      prognostico: 'Reservado, alto risco de descompensação clínica e internações recorrentes.',
      finalidade: 'Perícia médica do INSS para fins de aposentadoria por invalidez.'
    },
    {
      label: 'Fraldas Geriátricas',
      categoria: 'Insumos / Cuidados',
      diagnostico: 'Incontinência urinária e fecal mista',
      cid: 'R32',
      historico: 'Paciente idoso apresenta quadro de demência avançada com perda completa do controle esfincteriano (incontinência urinária e fecal grave), associada a déficit importante de mobilidade (acamado/cadeirante). Necessita de uso contínuo de fraldas descartáveis geriátricas para higiene básica diária, prevenção de lesões por pressão (escaras) e dermatites associadas à umidade.',
      conduta: 'Prescrição de uso contínuo de fraldas descartáveis geriátricas tamanho G/GG, estimando-se consumo médio diário de 4 unidades (total de 120 fraldas por mês). Indico cuidados rigorosos de higiene íntima e uso de creme protetor de barreira cutânea.',
      prognostico: 'Crônico e irreversível, sem possibilidade de recuperação do controle esfincteriano devido à patologia de base.',
      finalidade: 'Solicitação de fraldas geriátricas junto ao Programa Farmácia Popular ou órgãos públicos de saúde.'
    },
    {
      label: 'Fisioterapia (AVC/Motor)',
      categoria: 'Reabilitação',
      diagnostico: 'Sequelas de Acidente Vascular Cerebral (AVC) / Hemiparesia',
      cid: 'I69.4',
      historico: 'Paciente idoso com sequela de AVC isquêmico há 6 meses, apresentando hemiparesia à direita, déficit de equilíbrio estático/dinâmico, marcha claudicante com auxílio de andador e encurtamento de cadeia muscular posterior, gerando importante dependência nas Atividades de Vida Diária (AVDs).',
      conduta: 'Encaminhamento para reabilitação motora contínua em Fisioterapia (sugerido 3 sessões semanais) focando em fortalecimento muscular global, treino de marcha e transferências, treino de equilíbrio e prevenção de quedas.',
      prognostico: 'Favorável à melhora funcional parcial e manutenção da independência física residual.',
      finalidade: 'Encaminhamento para tratamento fisioterapêutico continuado (convênio ou SUS).'
    },
    {
      label: 'Fonoaudiologia (Disfagia)',
      categoria: 'Reabilitação',
      diagnostico: 'Disfagia orofaríngea neurogênica',
      cid: 'R13',
      historico: 'Paciente idoso portador de Doença de Parkinson avançada evoluindo com disfagia orofaríngea progressiva, manifestada por episódios frequentes de tosse e engasgos durante alimentação líquida e sólida, com risco iminente de pneumonia por broncoaspiração e desnutrição.',
      conduta: 'Encaminhamento urgente para terapia fonoaudiológica contínua (mínimo de 2 sessões semanais) para reabilitação da deglutição, adequação das consistências alimentares (uso de espessante alimentar), exercícios miofuncionais orofaciais e manobras protetivas.',
      prognostico: 'Estável com acompanhamento terapêutico regular e adaptações dietéticas.',
      finalidade: 'Solicitação de tratamento fonoaudiológico e fornecimento de espessantes.'
    },
    {
      label: 'Suporte Nutricional (Sarcopenia)',
      categoria: 'Insumos / Cuidados',
      diagnostico: 'Desnutrição proteico-calórica e Sarcopenia grave',
      cid: 'E44.0',
      historico: 'Paciente idoso apresenta perda ponderal involuntária acelerada (12% do peso corporal em 6 meses) associada a inapetência grave, fadiga extrema e perda expressiva de massa magra e força muscular (sarcopenia), com restrição severa de ingesta oral proteica.',
      conduta: 'Indicação de suporte nutricional com suplementação enteral/oral hiperproteica e hipercalórica associada a aminoácidos (ex: HMB). Acompanhamento nutricional regular para adequação calórica.',
      prognostico: 'Favorável à recuperação parcial de força se houver adesão à terapia e reabilitação física.',
      finalidade: 'Solicitação de cobertura de suplementos orais especiais / suporte nutricional.'
    },
    {
      label: 'Terapia Ocupacional',
      categoria: 'Reabilitação',
      diagnostico: 'Declínio cognitivo senil e dependência funcional',
      cid: 'G31.8',
      historico: 'Paciente com quadro demencial em estágio moderado com perda progressiva de autonomia para Atividades Instrumentais de Vida Diária (como controle de medicamentos e finanças) e início de dependência para autocuidado (higiene, alimentação).',
      conduta: 'Indicação de reabilitação cognitiva e funcional com Terapia Ocupacional (2 sessões semanais), focando em treino de AVDs, adequações de segurança ambiental, atividades de estimulação cognitiva e orientação aos cuidadores.',
      prognostico: 'De manutenção funcional e redução da velocidade de declínio cognitivo.',
      finalidade: 'Encaminhamento para reabilitação em Terapia Ocupacional.'
    }
  ],
  ATESTADO: [
    {
      label: 'Gastroenterite Aguda (3 dias)',
      dias: '3',
      motivo: 'Paciente apresenta quadro clínico de diarreia líquida profusa, náuseas, vômitos e febre não medida de início há 12h. Necessita de afastamento das atividades laborativas para repouso, hidratação oral vigorosa e isolamento de contágio direto.',
      cid: 'A09',
      declararCid: true
    },
    {
      label: 'IVAS / Gripe (5 dias)',
      dias: '5',
      motivo: 'Paciente com quadro de febre termometrada (38.5ºC), tosse produtiva, coriza intensa, mialgia difusa e prostração física. Indicado repouso domiciliar, sintomáticos e hidratação regular, devendo permanecer afastado de aglomerações e atividades profissionais.',
      cid: 'J06.9',
      declararCid: true
    },
    {
      label: 'Saúde Mental / Transtorno Ansioso (7 dias)',
      dias: '7',
      motivo: 'Paciente em acompanhamento psiquiátrico/psicológico regular apresenta crise ansiosa aguda com sintomas de palpitações, insônia refratária, irritabilidade acentuada e incapacidade de manter concentração para as atividades laborativas. Necessita de afastamento temporário para estabilização clínica e ajuste terapêutico.',
      cid: 'F41.1',
      declararCid: false
    },
    {
      label: 'Pós-Cirúrgico / Recuperação (15 dias)',
      dias: '15',
      motivo: 'Paciente em período pós-operatório imediato, necessitando de repouso relativo, curativos periódicos e acompanhamento ambulatorial. Está temporariamente impedido de exercer suas atividades laborativas habituais até liberação médica formal.',
      cid: 'Z48.0',
      declararCid: false
    }
  ],
  COMPARECIMENTO: [
    {
      label: 'Consulta de Rotina (Manhã)',
      periodo: 'das 08:00 às 12:00',
      acompanhante: '',
      relacao: 'Paciente'
    },
    {
      label: 'Acompanhante Idoso (Tarde)',
      periodo: 'das 13:30 às 17:30',
      acompanhante: 'Maria da Silva',
      relacao: 'Filho(a)'
    }
  ],
  APTIDAO: [
    {
      label: 'Musculação / Academia Padrão',
      finalidade: 'Prática de atividades físicas em academia, musculação e treinos cardiovasculares de intensidade leve a moderada.',
      restricoes: 'Sem restrições dignas de nota. Paciente encontra-se apto para prática esportiva sob supervisão de profissional de educação física.'
    },
    {
      label: 'Concurso Público (TAF)',
      finalidade: 'Realização de Teste de Aptidão Física (TAF) em concurso público, envolvendo corrida de resistência, barra fixa e natação.',
      restricoes: 'Apto. Apresenta boa reserva cardiopulmonar e ausência de restrições osteoarticulares aparentes para os esforços requeridos.'
    }
  ],
  ASO: [
    {
      label: 'Admissional - Auxiliar Administrativo',
      empresa: 'Zello Med Brasil LTDA',
      cnpj: '12.345.678/0001-90',
      funcao: 'Auxiliar Administrativo',
      tipo: 'ADMISSIONAL' as AsoTipoExame,
      riscos: ['AUSÊNCIA DE RISCO'],
      exames: 'Exame clínico geral ocupacional, anamnese e avaliação física.',
      resultado: 'APTO' as 'APTO' | 'INAPTO'
    },
    {
      label: 'Periódico - Operador de Máquinas',
      empresa: 'Indústria Metalúrgica Ceará S/A',
      cnpj: '98.765.432/0001-10',
      funcao: 'Operador de Máquinas Pesadas',
      tipo: 'PERIODICO' as AsoTipoExame,
      riscos: ['FÍSICO', 'ERGONÔMICO', 'ACIDENTE'],
      exames: 'Exame clínico, Audiometria Tonal recente, Acuidade Visual, Hemograma Completo.',
      resultado: 'APTO' as 'APTO' | 'INAPTO'
    }
  ]
};

export default function Documentos() {
  const navigate = useNavigate();
  const doc = useDocumentStore();

  const getActiveModelLabel = () => {
    const modelId = getDefaultModelId();
    const model = AI_MODELS.find((m) => m.id === modelId || m.id.replace('google/', '') === modelId);
    return model ? model.badge : 'Gemini 3 Flash';
  };

  // O paciente é definido UMA vez no Prontuário — esta página apenas espelha
  // nome e CPF (fonte única). Sem isso, o médico digitava os mesmos dados de novo
  // e corria o risco de emitir um documento com paciente divergente do prontuário.
  const appPacienteNome = useAppStore((s) => s.pacienteNome);
  const appPacienteCpf = useAppStore((s) => s.pacienteCpf);

  useEffect(() => {
    const atual = useDocumentStore.getState();
    if (atual.pacienteNome !== appPacienteNome || atual.pacienteCpf !== appPacienteCpf) {
      atual.setDocumento({ pacienteNome: appPacienteNome, pacienteCpf: appPacienteCpf });
    }
  }, [appPacienteNome, appPacienteCpf]);

  const handleBlur = () => {
    if (doc.pacienteNome && doc.pacienteNome.trim().length >= 3) {
      const existing = useRecentPatientsStore.getState().pacientes.find(
        (p) => p.nome.toLowerCase() === doc.pacienteNome.trim().toLowerCase()
      );
      const appStoreGenero = useAppStore.getState().genero;
      savePatientToHistory({
        nome: doc.pacienteNome.trim(),
        cpf: doc.pacienteCpf,
        genero: existing?.genero || appStoreGenero || 'M',
        dataNascimento: doc.pacienteDataNascimento,
      });
    }
  };

  const [aiPrompt, setAiPrompt] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [erroAi, setErroAi] = useState('');
  const [showFullPreview, setShowFullPreview] = useState(false);

  const inputCls = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-gray-800 placeholder-gray-400";
  const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5";

  const handleIA = async () => {
    if (!aiPrompt.trim()) return;
    setLoadingAi(true);
    setErroAi('');
    try {
      if (doc.tipoDocumento === 'LAUDO') {
        const res = await gerarLaudoIA(aiPrompt);
        doc.setDocumento({
          laudoDiagnostico: res.laudoDiagnostico,
          laudoCid: res.laudoCid,
          laudoHistorico: res.laudoHistorico,
          laudoConduta: res.laudoConduta,
          laudoPrognostico: res.laudoPrognostico,
        });
      } else if (doc.tipoDocumento === 'ATESTADO') {
        const res = await gerarAtestadoIA(aiPrompt);
        doc.setDocumento({
          atestadoMotivo: res.atestadoMotivo,
          atestadoCid: res.atestadoCid,
          atestadoDias: res.atestadoDias,
          atestadoDeclararCid: !!res.atestadoCid,
        });
      }
      setAiPrompt('');
    } catch {
      setErroAi('Erro ao gerar documento com IA. Tente preencher manualmente.');
    } finally {
      setLoadingAi(false);
    }
  };

  const aplicarPresetLaudo = (preset: typeof PRESETS.LAUDO[0]) => {
    doc.setDocumento({
      laudoDiagnostico: preset.diagnostico,
      laudoCid: preset.cid,
      laudoHistorico: preset.historico,
      laudoConduta: preset.conduta,
      laudoPrognostico: preset.prognostico,
      laudoFinalidade: preset.finalidade,
    });
  };

  const aplicarPresetAtestado = (preset: typeof PRESETS.ATESTADO[0]) => {
    doc.setDocumento({
      atestadoDias: preset.dias,
      atestadoMotivo: preset.motivo,
      atestadoCid: preset.cid,
      atestadoDeclararCid: preset.declararCid,
    });
  };

  const aplicarPresetComparecimento = (preset: typeof PRESETS.COMPARECIMENTO[0]) => {
    doc.setDocumento({
      comparecimentoPeriodo: preset.periodo,
      comparecimentoAcompanhanteNome: preset.acompanhante,
      comparecimentoRelacao: preset.relacao,
    });
  };

  const aplicarPresetAptidao = (preset: typeof PRESETS.APTIDAO[0]) => {
    doc.setDocumento({
      aptidaoFinalidade: preset.finalidade,
      aptidaoRestricoes: preset.restricoes,
    });
  };

  const aplicarPresetAso = (preset: typeof PRESETS.ASO[0]) => {
    doc.setDocumento({
      asoEmpresa: preset.empresa,
      asoCnpj: preset.cnpj,
      asoFuncao: preset.funcao,
      asoTipo: preset.tipo,
      asoRiscos: preset.riscos,
      asoExamesRealizados: preset.exames,
      asoResultado: preset.resultado,
    });
  };

  const toggleRisco = (risco: string) => {
    const atual = doc.asoRiscos;
    if (atual.includes(risco)) {
      doc.setDocumento({ asoRiscos: atual.filter(r => r !== risco) });
    } else {
      // Se adicionar qualquer outro risco, remove o "AUSÊNCIA DE RISCO"
      if (risco === 'AUSÊNCIA DE RISCO') {
        doc.setDocumento({ asoRiscos: ['AUSÊNCIA DE RISCO'] });
      } else {
        doc.setDocumento({ asoRiscos: [...atual.filter(r => r !== 'AUSÊNCIA DE RISCO'), risco] });
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-gray-900 via-indigo-950 to-indigo-900 p-6 rounded-3xl text-white shadow-xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Emissão de Documentos Clínicos</h1>
            <p className="text-xs text-indigo-200 mt-1 font-medium">
              Gere laudos formais, atestados médicos e ASO com auxílio de IA e presets oficiais.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('Limpar todos os dados do documento e dados do paciente?')) {
                  doc.resetDocumento();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
            >
              <RotateCcw size={14} />
              Limpar Rascunho
            </button>
            <button
              onClick={() => navigate('/documentos/imprimir')}
              disabled={!doc.pacienteNome}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/10 hover:scale-[1.01]"
            >
              <Printer size={14} />
              Imprimir / PDF
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 mb-8 overflow-x-auto shadow-sm gap-1 scrollbar-thin">
          {[
            { id: 'LAUDO', label: 'Laudo Médico', icon: FileSpreadsheet, color: 'text-indigo-600', bg: 'bg-indigo-50 text-indigo-700 border border-indigo-100' },
            { id: 'ATESTADO', label: 'Atestado Médico', icon: HeartHandshake, color: 'text-rose-600', bg: 'bg-rose-50 text-rose-700 border border-rose-100' },
            { id: 'COMPARECIMENTO', label: 'Comparecimento', icon: Clock, color: 'text-sky-600', bg: 'bg-sky-50 text-sky-700 border border-sky-100' },
            { id: 'APTIDAO', label: 'Aptidão Física', icon: Dumbbell, color: 'text-amber-600', bg: 'bg-amber-50 text-amber-700 border border-amber-100' },
            { id: 'ASO', label: 'ASO Ocupacional', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
            { id: 'LIVRE', label: 'Documento Livre', icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50 text-violet-750 border border-violet-100' }
          ].map((tab) => {
            const isSelected = doc.tipoDocumento === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => doc.setTipoDocumento(tab.id as TipoDocumento)}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  isSelected
                    ? tab.bg
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} className={tab.color} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Split Screen Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start pb-32 max-lg:pb-40">
          
          {/* Coluna Esquerda: Edição */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Presets Rápidos */}
            {doc.tipoDocumento !== 'LIVRE' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3.5">Modelos Rápidos / Presets</h2>
                <div className="flex flex-wrap gap-2.5">
                  {doc.tipoDocumento === 'LAUDO' && (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.from(new Set(PRESETS.LAUDO.map(p => p.categoria))).map((cat) => {
                        const presetsDaCat = PRESETS.LAUDO.filter(p => p.categoria === cat);
                        return (
                          <div key={cat} className="bg-gray-50/50 border border-gray-150 p-3 rounded-2xl flex flex-col gap-2">
                            <h3 className="text-[10px] font-extrabold text-indigo-650 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-200/60 pb-1 mb-1">
                              {cat === 'Cognitivo / Neuro' && '🧠'}
                              {cat === 'Cardiovascular' && '🫀'}
                              {cat === 'Insumos / Cuidados' && '🩹'}
                              {cat === 'Reabilitação' && '♿'}
                              {cat}
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                              {presetsDaCat.map((p, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => aplicarPresetLaudo(p)}
                                  className="px-3 py-1.5 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 text-indigo-900 rounded-xl text-xs font-semibold transition-all hover:scale-[1.01]"
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {doc.tipoDocumento === 'ATESTADO' && PRESETS.ATESTADO.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => aplicarPresetAtestado(p)}
                      className="px-3.5 py-2 bg-rose-50/40 hover:bg-rose-50 border border-rose-100/50 hover:border-rose-200 text-rose-800 rounded-xl text-xs font-semibold transition-all"
                    >
                      {p.label}
                    </button>
                  ))}
                  {doc.tipoDocumento === 'COMPARECIMENTO' && PRESETS.COMPARECIMENTO.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => aplicarPresetComparecimento(p)}
                      className="px-3.5 py-2 bg-sky-50/40 hover:bg-sky-50 border border-sky-100/50 hover:border-sky-200 text-sky-800 rounded-xl text-xs font-semibold transition-all"
                    >
                      {p.label}
                    </button>
                  ))}
                  {doc.tipoDocumento === 'APTIDAO' && PRESETS.APTIDAO.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => aplicarPresetAptidao(p)}
                      className="px-3.5 py-2 bg-amber-50/40 hover:bg-amber-50 border border-amber-100/50 hover:border-amber-200 text-amber-800 rounded-xl text-xs font-semibold transition-all"
                    >
                      {p.label}
                    </button>
                  ))}
                  {doc.tipoDocumento === 'ASO' && PRESETS.ASO.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => aplicarPresetAso(p)}
                      className="px-3.5 py-2 bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-100/50 hover:border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold transition-all"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Assistant Panel (For Laudo & Atestado) */}
            {(doc.tipoDocumento === 'LAUDO' || doc.tipoDocumento === 'ATESTADO') && (
              <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-yellow-400 fill-yellow-400" size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-200">Redigir Documento Clínico com IA</h3>
                </div>
                <p className="text-xs text-indigo-150 leading-relaxed mb-4">
                  Digite brevemente as queixas ou justificativas e a IA gerará um documento estruturado sob os termos técnicos do CFM.
                </p>
                <div className="space-y-3">
                  <textarea
                    rows={2}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={
                      doc.tipoDocumento === 'LAUDO'
                        ? 'Ex: Paciente com Alzheimer avançado, perda cognitiva e incontinência, necessita de cuidador constante.'
                        : 'Ex: Paciente de 32 anos com cefaleia intensa e picos febris, necessita de repouso por 2 dias.'
                    }
                    className="w-full px-4 py-3 bg-white/10 hover:bg-white/12 focus:bg-white/15 text-white placeholder-indigo-300/60 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all resize-none border border-white/10 font-medium"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-indigo-300 font-semibold">IA Ativa: {getActiveModelLabel()}</span>
                    <button
                      onClick={handleIA}
                      disabled={loadingAi || !aiPrompt.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-400 text-gray-900 font-bold text-xs rounded-xl shadow-lg transition-all"
                    >
                      {loadingAi ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {loadingAi ? 'Processando...' : 'Gerar com IA'}
                    </button>
                  </div>
                </div>
                {erroAi && (
                  <p className="text-xs text-red-300 mt-2.5 font-bold flex items-center gap-1">
                    <ShieldAlert size={14} />
                    {erroAi}
                  </p>
                )}
              </div>
            )}

            {/* Dados de Identificação */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-50">
                <User size={18} className="text-indigo-500" />
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Dados do Paciente / Registro</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Paciente: vem do Prontuário (fonte única) — não se digita aqui. */}
                <div className="md:col-span-2">
                  <label className={labelCls}>Paciente (definido no Prontuário)</label>
                  {doc.pacienteNome ? (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{doc.pacienteNome}</p>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          {doc.pacienteCpf ? `CPF ${doc.pacienteCpf}` : 'CPF não informado no prontuário'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/prontuario')}
                        className="shrink-0 px-3 py-1.5 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-bold transition-all"
                      >
                        Alterar no Prontuário
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-50/60 border border-amber-200/70 rounded-xl">
                      <p className="text-xs text-amber-900 font-medium leading-snug">
                        Nenhum paciente identificado. O nome e o CPF vêm do Prontuário — preencha lá uma vez e o documento usa os mesmos dados.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/prontuario')}
                        className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[11px] font-bold transition-all"
                      >
                        Ir ao Prontuário
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Data de Nascimento</label>
                  <input
                    type="date"
                    value={doc.pacienteDataNascimento}
                    onChange={(e) => doc.setDocumento({ pacienteDataNascimento: e.target.value })}
                    onBlur={handleBlur}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Cidade-UF Emissão</label>
                  <input
                    type="text"
                    value={doc.local}
                    onChange={(e) => doc.setDocumento({ local: e.target.value })}
                    placeholder="Fortaleza-CE"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Data Emissão</label>
                  <input
                    type="text"
                    value={doc.data}
                    onChange={(e) => doc.setDocumento({ data: e.target.value })}
                    placeholder="DD/MM/AAAA"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Formulários Dinâmicos */}
            
            {/* Form Laudo Médico */}
            {doc.tipoDocumento === 'LAUDO' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-50">
                  <FileText size={18} className="text-indigo-500" />
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Conteúdo do Laudo Médico</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Diagnóstico / Hipótese Diagnóstica</label>
                    <input
                      type="text"
                      value={doc.laudoDiagnostico}
                      onChange={(e) => doc.setDocumento({ laudoDiagnostico: e.target.value })}
                      placeholder="Ex: Doença de Alzheimer de início tardio"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Código CID-10</label>
                    <input
                      type="text"
                      value={doc.laudoCid}
                      onChange={(e) => doc.setDocumento({ laudoCid: e.target.value.toUpperCase() })}
                      placeholder="Ex: F00.1"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Histórico Clínico e Evolução</label>
                  <textarea
                    rows={5}
                    value={doc.laudoHistorico}
                    onChange={(e) => doc.setDocumento({ laudoHistorico: e.target.value })}
                    placeholder="Descreva o quadro evolutivo do paciente, exames realizados, escores funcionais (MEEM, NYHA, etc.)..."
                    className={`${inputCls} font-normal leading-relaxed`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Conduta Terapêutica / Recomendações</label>
                    <textarea
                      rows={4}
                      value={doc.laudoConduta}
                      onChange={(e) => doc.setDocumento({ laudoConduta: e.target.value })}
                      placeholder="Tratamentos indicados, medicamentos, sessões de reabilitação, supervisão 24h..."
                      className={`${inputCls} font-normal leading-relaxed`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Prognóstico Clínico</label>
                    <textarea
                      rows={4}
                      value={doc.laudoPrognostico}
                      onChange={(e) => doc.setDocumento({ laudoPrognostico: e.target.value })}
                      placeholder="Ex: Reservado a longo prazo com necessidade de cuidados continuados..."
                      className={`${inputCls} font-normal leading-relaxed`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Finalidade do Laudo</label>
                  <input
                    type="text"
                    value={doc.laudoFinalidade}
                    onChange={(e) => doc.setDocumento({ laudoFinalidade: e.target.value })}
                    placeholder="Ex: Fins de perícia previdenciária / INSS"
                    className={inputCls}
                  />
                  <p className="mt-1.5 text-[10px] text-gray-400 font-medium">
                    Preenchida pelos Modelos Rápidos / Presets acima — edite se precisar de outra finalidade.
                  </p>
                </div>

                {/* Removido: bloco "Dados Complementares de Reabilitação". Prometia na
                    tela que a especialidade e o nº de sessões sairiam no rodapé do laudo,
                    mas os campos não eram salvos nem chegavam ao documento impresso —
                    informação falsa para o médico. O nº de sessões deve ir na Conduta
                    Terapêutica, onde os presets de reabilitação já o incluem. */}
              </div>
            )}

            {/* Form Atestado Médico */}
            {doc.tipoDocumento === 'ATESTADO' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-50">
                  <HeartHandshake size={18} className="text-rose-500" />
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Conteúdo do Atestado</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Dias Afastamento</label>
                    <input
                      type="number"
                      value={doc.atestadoDias}
                      onChange={(e) => doc.setDocumento({ atestadoDias: e.target.value })}
                      min={1}
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Código CID-10 (opcional)</label>
                    <input
                      type="text"
                      value={doc.atestadoCid}
                      onChange={(e) => doc.setDocumento({ atestadoCid: e.target.value })}
                      placeholder="Ex: A09"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Justificativa / Motivo Clínico</label>
                  <textarea
                    rows={3}
                    value={doc.atestadoMotivo}
                    onChange={(e) => doc.setDocumento({ atestadoMotivo: e.target.value })}
                    placeholder="Ex: Necessidade de afastamento devido a sintomas de gastroenterite..."
                    className={inputCls}
                  />
                </div>

                <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="declararCid"
                    checked={doc.atestadoDeclararCid}
                    onChange={(e) => doc.setDocumento({ atestadoDeclararCid: e.target.checked })}
                    className="mt-0.5"
                  />
                  <label htmlFor="declararCid" className="text-xs text-amber-900 leading-normal font-medium cursor-pointer selection:bg-transparent">
                    <strong>Consentimento do Paciente para Declaração de CID:</strong><br/>
                    Confirmo que o paciente autorizou expressamente a inclusão do código CID-10 neste documento público em conformidade com as regras do CFM.
                  </label>
                </div>
              </div>
            )}

            {/* Form Atestado de Comparecimento */}
            {doc.tipoDocumento === 'COMPARECIMENTO' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-50">
                  <Clock size={18} className="text-sky-500" />
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Detalhamento de Comparecimento</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Período / Horário de Permanência</label>
                    <input
                      type="text"
                      value={doc.comparecimentoPeriodo}
                      onChange={(e) => doc.setDocumento({ comparecimentoPeriodo: e.target.value })}
                      placeholder="Ex: das 08:00 às 12:00"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Relação (Paciente ou Acompanhante)</label>
                    <input
                      type="text"
                      value={doc.comparecimentoRelacao}
                      onChange={(e) => doc.setDocumento({ comparecimentoRelacao: e.target.value })}
                      placeholder="Ex: Paciente, Acompanhante, Pai, Filho"
                      className={inputCls}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Nome do Acompanhante (opcional)</label>
                    <input
                      type="text"
                      value={doc.comparecimentoAcompanhanteNome}
                      onChange={(e) => doc.setDocumento({ comparecimentoAcompanhanteNome: e.target.value })}
                      placeholder="Preencha apenas se for justificativa de acompanhante"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form Aptidão Física */}
            {doc.tipoDocumento === 'APTIDAO' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-50">
                  <Dumbbell size={18} className="text-amber-500" />
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Aptidão Física</h2>
                </div>

                <div>
                  <label className={labelCls}>Finalidade do Atestado</label>
                  <input
                    type="text"
                    value={doc.aptidaoFinalidade}
                    onChange={(e) => doc.setDocumento({ aptidaoFinalidade: e.target.value })}
                    placeholder="Ex: Prática de atividades físicas em academia / esportes"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Restrições ou Observações Clínicas</label>
                  <textarea
                    rows={3}
                    value={doc.aptidaoRestricoes}
                    onChange={(e) => doc.setDocumento({ aptidaoRestricoes: e.target.value })}
                    placeholder="Ex: Sem restrições dignas de nota no exame físico atual..."
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            {/* Form ASO */}
            {doc.tipoDocumento === 'ASO' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-50">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Atestado de Saúde Ocupacional (ASO)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Razão Social da Empresa</label>
                    <input
                      type="text"
                      value={doc.asoEmpresa}
                      onChange={(e) => doc.setDocumento({ asoEmpresa: e.target.value })}
                      placeholder="Nome da empresa contratante"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>CNPJ da Empresa</label>
                    <input
                      type="text"
                      value={doc.asoCnpj}
                      onChange={(e) => doc.setDocumento({ asoCnpj: formatCnpj(e.target.value) })}
                      placeholder="00.000.000/0000-00"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Função / Cargo do Trabalhador</label>
                    <input
                      type="text"
                      value={doc.asoFuncao}
                      onChange={(e) => doc.setDocumento({ asoFuncao: e.target.value })}
                      placeholder="Ex: Auxiliar de Almoxarifado"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tipo de ASO</label>
                    <select
                      value={doc.asoTipo}
                      onChange={(e) => doc.setDocumento({ asoTipo: e.target.value as AsoTipoExame })}
                      className={inputCls}
                    >
                      <option value="ADMISSIONAL">Admissional</option>
                      <option value="PERIODICO">Periódico</option>
                      <option value="RETORNO_TRABALHO">Retorno ao Trabalho</option>
                      <option value="MUDANCA_FUNCAO">Mudança de Função</option>
                      <option value="DEMISSIONAL">Demissional</option>
                    </select>
                  </div>
                </div>

                {/* Checklist de Riscos */}
                <div>
                  <label className={labelCls}>Riscos Ocupacionais Encontrados</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 bg-gray-50/50 p-4 rounded-xl border border-gray-150">
                    {['FÍSICO', 'QUÍMICO', 'BIOLÓGICO', 'ERGONÔMICO', 'ACIDENTE', 'AUSÊNCIA DE RISCO'].map((risco) => {
                      const isChecked = doc.asoRiscos.includes(risco);
                      return (
                        <button
                          key={risco}
                          onClick={() => toggleRisco(risco)}
                          className={`flex items-center justify-between p-2.5 border rounded-xl text-xs font-semibold transition-all ${
                            isChecked
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <span>{risco}</span>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-gray-50 border-gray-300'}`}>
                            {isChecked ? '✓' : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Exames Complementares Realizados</label>
                  <textarea
                    rows={2.5}
                    value={doc.asoExamesRealizados}
                    onChange={(e) => doc.setDocumento({ asoExamesRealizados: e.target.value })}
                    placeholder="Descreva exames como audiometria, acuidade visual, ECG..."
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Resultado / Conclusão de Aptidão</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <button
                      onClick={() => doc.setDocumento({ asoResultado: 'APTO' })}
                      className={`py-3.5 border-2 rounded-xl text-sm font-bold tracking-wide transition-all ${
                        doc.asoResultado === 'APTO'
                          ? 'bg-green-50 border-green-500 text-green-700 shadow-md shadow-green-100'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      ✓ TRABALHADOR APTO
                    </button>
                    <button
                      onClick={() => doc.setDocumento({ asoResultado: 'INAPTO' })}
                      className={`py-3.5 border-2 rounded-xl text-sm font-bold tracking-wide transition-all ${
                        doc.asoResultado === 'INAPTO'
                          ? 'bg-red-50 border-red-500 text-red-700 shadow-md shadow-red-100'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      ✗ TRABALHADOR INAPTO
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Form Documento Livre */}
            {doc.tipoDocumento === 'LIVRE' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-50">
                  <FileText size={18} className="text-violet-500" />
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Documento Livre</h2>
                </div>

                <div>
                  <label className={labelCls}>Título do Documento (Cabeçalho)</label>
                  <input
                    type="text"
                    value={doc.livreTitulo}
                    onChange={(e) => doc.setDocumento({ livreTitulo: e.target.value })}
                    placeholder="Ex: DECLARAÇÃO MÉDICA, RELATÓRIO DE ACOMPANHAMENTO"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Conteúdo / Corpo do Texto</label>
                  <textarea
                    rows={12}
                    value={doc.livreConteudo}
                    onChange={(e) => doc.setDocumento({ livreConteudo: e.target.value })}
                    placeholder="Digite o texto livremente da forma que desejar..."
                    className={`${inputCls} font-normal leading-relaxed`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Coluna Direita: Live Preview A4 */}
          <div className="sticky top-6 hidden lg:block w-[380px] shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <div className="flex items-center gap-1.5">
                  <Eye size={14} className="text-indigo-500" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Visualização A4</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-150 text-indigo-700">
                  Pré-visualização
                </span>
              </div>
              
              <div 
                onClick={() => setShowFullPreview(true)}
                className="bg-gray-100 rounded-xl p-4 flex justify-center items-center overflow-hidden h-[490px] border border-gray-200/50 shadow-inner relative cursor-pointer group transition-all hover:border-indigo-300"
              >
                <div 
                  style={{
                    width: '318px', // 794 * 0.40
                    height: '450px', // 1123 * 0.40
                    position: 'relative',
                  }}
                >
                  <div 
                    className="origin-top-left transition-transform duration-300 rounded shadow-md border border-gray-300"
                    style={{
                      transform: 'scale(0.40)',
                      width: '794px',
                      height: '1123px',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      backgroundColor: '#fff',
                    }}
                  >
                    <DocumentoTemplate />
                  </div>
                </div>

                {/* Hover overlay para ampliação */}
                <div className="absolute inset-0 bg-indigo-950/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 rounded-xl">
                  <span className="bg-white/95 text-indigo-950 text-xs font-bold px-4 py-2 rounded-xl shadow-lg border border-indigo-100 flex items-center gap-1.5 scale-95 group-hover:scale-100 transition-transform duration-200">
                    <Eye size={14} />
                    Clique para Ampliar (A4)
                  </span>
                </div>
              </div>
              
              <p className="text-[10px] text-center text-gray-400 mt-2 font-medium">
                Pressione a folha para abrir a visualização em tamanho legível.
              </p>
            </div>
          </div>
          
        </div>
      </div>

      {/* Fullscreen Preview Lightbox Modal */}
      {showFullPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-150 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Pré-visualização do Documento</h3>
                <p className="text-xs text-gray-500 mt-0.5">Confirme o conteúdo e layout antes de realizar a impressão física ou salvar em PDF.</p>
              </div>
              <button 
                onClick={() => setShowFullPreview(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-200/50 rounded-xl"
              >
                <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-8 flex justify-center items-start scrollbar-thin">
              <div 
                className="bg-white shadow-xl border border-gray-300 rounded overflow-hidden"
                style={{
                  width: '210mm',
                  minWidth: '210mm',
                  maxWidth: '210mm',
                  height: '297mm',
                  minHeight: '297mm',
                  maxHeight: '297mm',
                }}
              >
                <DocumentoTemplate />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-150 flex justify-end gap-3">
              <button
                onClick={() => setShowFullPreview(false)}
                className="px-5 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setShowFullPreview(false);
                  navigate('/documentos/imprimir');
                }}
                disabled={!doc.pacienteNome}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                <Printer size={14} />
                Confirmar e Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 lg:left-64 left-0 right-0 z-30 lg:z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl px-4 py-4 no-print max-lg:bottom-[calc(3.5rem+env(safe-area-inset-bottom))]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm">
            <div className={`flex items-center gap-1.5 ${doc.pacienteNome ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle2 size={15} />
              <span className="font-semibold">{doc.pacienteNome || 'Sem paciente identificado'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/documentos/imprimir')}
              disabled={!doc.pacienteNome}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-bold text-sm shadow-md transition-all"
            >
              <Printer size={15} />
              Imprimir Guia A4
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
