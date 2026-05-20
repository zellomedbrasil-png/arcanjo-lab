import { useAppStore } from '../../../store/useAppStore';
import { getProcedimentoNome } from '../../../data/procedimentos';

const MEDICO = {
  nome: 'ROBERTO ARCANJO',
  conselho: 'CRM',
  numero: '26155',
  uf: 'CE',
  cbo: '225125',
};

const PRESTADOR_EXECUTANTE = {
  nome: '',
  cnes: '',
};

interface Props {
  operadora?: string;
  registroAns?: string;
  corHeader?: string;
}

const borda = '1px solid #000';

/** Célula com label numerado e valor. */
function C({
  n, label, value = '', flex, w, borderRight = true, minH = 19, style = {},
}: {
  n?: string | number;
  label: string;
  value?: string;
  flex?: number;
  w?: string;
  borderRight?: boolean;
  minH?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '0.5px 3px 1.5px',
        minHeight: `${minH}px`,
        flex: flex ?? (w ? undefined : 1),
        width: w,
        borderRight: borderRight ? borda : undefined,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div style={{ fontSize: '6px', color: '#000', lineHeight: 1.1, fontWeight: 600 }}>
        {n !== undefined && <span>{n} - </span>}
        {label}
      </div>
      <div style={{ fontSize: '8.5px', fontWeight: 700, lineHeight: 1.15, marginTop: '1px', textTransform: 'uppercase' }}>
        {value || ' '}
      </div>
    </div>
  );
}

/** Barra cinza de seção */
function Secao({ label, cor }: { label: string; cor?: string }) {
  return (
    <div style={{
      backgroundColor: cor ?? '#d9d9d9',
      borderBottom: borda,
      padding: '0px 4px',
      fontSize: '7px',
      fontWeight: 700,
    }}>
      {label}
    </div>
  );
}

export default function GuiaSADTPadrao({ operadora = '', registroAns = '', corHeader }: Props) {
  const {
    pacienteNome, numeroBeneficiario,
    examesSelecionados, procedimentosSelecionados, tipoGuia, justificativa,
  } = useAppStore();

  const isLab = tipoGuia === 'LABORATORIO';
  const dataHoje = new Date().toLocaleDateString('pt-BR');

  const todosItens: string[] = isLab
    ? examesSelecionados
    : procedimentosSelecionados.map(getProcedimentoNome);

  const N_ROWS = 5;
  const porLinha = Math.ceil(todosItens.length / N_ROWS) || 1;
  const linhasProcedimentos = Array.from({ length: N_ROWS }, (_, i) =>
    todosItens.slice(i * porLinha, (i + 1) * porLinha).join(', ')
  );

  const corSec = corHeader ?? '#d9d9d9';

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { margin: 0; }
        }
      `}</style>

      <div style={{
        width: '100%',
        height: '100%',
        padding: '4mm',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '7px',
        color: '#000',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}>

        {/* ══ CABEÇALHO ══ */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px', position: 'relative' }}>
          <div style={{ width: '160px', fontSize: '9px', fontWeight: 700, color: '#000', textTransform: 'uppercase' }}>
            {operadora || ' '}
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1.2 }}>
              GUIA DE SERVIÇO PROFISSIONAL / SERVIÇO AUXILIAR
              <br />DE DIAGNÓSTICO E TERAPIA - SP/SADT
            </div>
          </div>
          <div style={{ width: '160px', textAlign: 'right', fontSize: '7px', fontWeight: 600 }}>
            2 - Nº Guia no Prestador
          </div>
        </div>

        {/* ── Linha 1: campos 1 e 3 (lado a lado, ocupando toda a largura) ── */}
        <div style={{ display: 'flex', border: borda, marginBottom: '-1px' }}>
          <C n={1} label="Registro ANS"            value={registroAns} w="180px" />
          <C n={3} label="Número da Guia Principal"                    flex={1} borderRight={false} />
        </div>

        {/* ── Linha 2: campos 4, 5, 6, 7 ── */}
        <div style={{ display: 'flex', border: borda, marginBottom: '-1px' }}>
          <C n={4} label="Data da Autorização"                                  w="140px" />
          <C n={5} label="Senha"                                                flex={1} />
          <C n={6} label="Data de Validade da Senha"                            w="160px" />
          <C n={7} label="Número da Guia Atribuído pela Operadora"              flex={1} borderRight={false} />
        </div>

        {/* ══ DADOS DO BENEFICIÁRIO ══ */}
        <div style={{ border: borda, marginBottom: '-1px' }}>
          <Secao label="Dados do Beneficiário" cor={corSec} />
          <div style={{ display: 'flex' }}>
            <C n={8}  label="Número da Carteira"        value={numeroBeneficiario}         w="180px" />
            <C n={9}  label="Validade da Carteira"                                          w="100px" />
            <C n={10} label="Nome"                       value={pacienteNome.toUpperCase()} flex={2} />
            <C n={11} label="Cartão Nacional de Saúde"                                      w="160px" />
            <C n={12} label="Atendimento a RN"           value=""                           w="80px" borderRight={false} />
          </div>
        </div>

        {/* ══ DADOS DO SOLICITANTE ══ */}
        <div style={{ border: borda, marginBottom: '-1px' }}>
          <Secao label="Dados do Solicitante" cor={corSec} />
          <div style={{ display: 'flex', borderBottom: borda }}>
            <C n={13} label="Código na Operadora" w="180px" />
            <C n={14} label="Nome do Contratado"  flex={1} borderRight={false} />
          </div>
          <div style={{ display: 'flex' }}>
            <C n={15} label="Nome do Profissional Solicitante" value={MEDICO.nome}      flex={2} />
            <C n={16} label="Conselho Profissional"             value={MEDICO.conselho}  w="70px" />
            <C n={17} label="Número do Conselho"                value={MEDICO.numero}    w="100px" />
            <C n={18} label="UF"                                value={MEDICO.uf}        w="36px" />
            <C n={19} label="Código CBO"                        value={MEDICO.cbo}       w="80px" />
            <C n={20} label="Assinatura do Profissional Solicitante" flex={1} borderRight={false} />
          </div>
        </div>

        {/* ══ DADOS DA SOLICITAÇÃO / PROCEDIMENTOS ══ */}
        <div style={{ border: borda, marginBottom: '-1px' }}>
          <Secao label="Dados da Solicitação / Procedimentos ou Itens Assistenciais Solicitados" cor={corSec} />
          <div style={{ display: 'flex', borderBottom: borda }}>
            <C n={21} label="Caráter do Atendimento" value="1"                          w="90px" />
            <C n={22} label="Data da Solicitação"    value={dataHoje}                   w="120px" />
            <C n={23} label="Indicação Clínica"      value={justificativa.slice(0,200)} flex={1} borderRight={false} />
          </div>

          {/* Cabeçalho da tabela 24-28 */}
          <div style={{ display: 'flex', fontSize: '6.5px', fontWeight: 600, borderBottom: borda }}>
            <div style={{ width: '18px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
            <div style={{ width: '54px', padding: '1px 3px', borderRight: borda }}>24 - Tabela</div>
            <div style={{ width: '160px', padding: '1px 3px', borderRight: borda }}>25 - Código do Procedimento<br/>ou Item Assistencial</div>
            <div style={{ flex: 1, padding: '1px 3px', borderRight: borda }}>26 - Descrição</div>
            <div style={{ width: '58px', padding: '1px 3px', borderRight: borda }}>27 - Qtde. Solic.</div>
            <div style={{ width: '58px', padding: '1px 3px' }}>28 - Qtde. Aut.</div>
          </div>

          {/* Linhas 1- a 5- */}
          {[1,2,3,4,5].map((seq, idx) => (
            <div key={seq} style={{
              display: 'flex',
              borderBottom: idx < 4 ? borda : undefined,
              minHeight: '15px',
              fontSize: '7.5px',
            }}>
              <div style={{ width: '18px', padding: '1px 2px', borderRight: borda, textAlign: 'center', fontWeight: 700 }}>{seq}-</div>
              <div style={{ width: '54px', padding: '1px 3px', borderRight: borda }}>&nbsp;</div>
              <div style={{ width: '160px', padding: '1px 3px', borderRight: borda, fontFamily: 'monospace' }}>&nbsp;</div>
              <div style={{ flex: 1, padding: '1px 3px', borderRight: borda, textTransform: 'uppercase', fontWeight: 600 }}>
                {linhasProcedimentos[idx]}
              </div>
              <div style={{ width: '58px', padding: '1px 3px', borderRight: borda, textAlign: 'center', fontWeight: 600 }}>
                &nbsp;
              </div>
              <div style={{ width: '58px', padding: '1px 3px' }}>&nbsp;</div>
            </div>
          ))}
        </div>

        {/* ══ DADOS DO CONTRATADO EXECUTANTE ══ */}
        <div style={{ border: borda, marginBottom: '-1px' }}>
          <Secao label="Dados do Contratado Executante" cor={corSec} />
          <div style={{ display: 'flex' }}>
            <C n={29} label="Código na Operadora"  w="180px" />
            <C n={30} label="Nome do Contratado"    value={PRESTADOR_EXECUTANTE.nome} flex={1} />
            <C n={31} label="Código CNES"            value={PRESTADOR_EXECUTANTE.cnes} w="140px" borderRight={false} />
          </div>
        </div>

        {/* ══ DADOS DO ATENDIMENTO ══ */}
        <div style={{ border: borda, marginBottom: '-1px' }}>
          <Secao label="Dados do Atendimento" cor={corSec} />
          <div style={{ display: 'flex' }}>
            <C n={32} label="Tipo de Atendimento"                                w="110px" />
            <C n={33} label="Indicação de Acidente (acidente ou doença relacionada)" flex={1} />
            <C n={34} label="Tipo de Consulta"                                   w="110px" />
            <C n={35} label="Motivo de Encerramento do Atendimento"              flex={1} borderRight={false} />
          </div>
        </div>

        {/* ══ DADOS DA EXECUÇÃO ══ */}
        <div style={{ border: borda, marginBottom: '-1px' }}>
          <Secao label="Dados da Execução / Procedimento e Exames Realizados" cor={corSec} />
          <div style={{ display: 'flex', fontSize: '6.5px', fontWeight: 600, borderBottom: borda }}>
            <div style={{ width: '14px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
            <div style={{ width: '60px', padding: '1px 2px', borderRight: borda }}>36 - Data</div>
            <div style={{ width: '48px', padding: '1px 2px', borderRight: borda }}>37 - Hora Inicial</div>
            <div style={{ width: '48px', padding: '1px 2px', borderRight: borda }}>38 - Hora Final</div>
            <div style={{ width: '34px', padding: '1px 2px', borderRight: borda }}>39 - Tabela</div>
            <div style={{ width: '90px', padding: '1px 2px', borderRight: borda }}>40 - Código do<br/>Procedimento</div>
            <div style={{ flex: 1, padding: '1px 2px', borderRight: borda }}>41 - Descrição</div>
            <div style={{ width: '36px', padding: '1px 2px', borderRight: borda }}>42 - Qtde.</div>
            <div style={{ width: '26px', padding: '1px 2px', borderRight: borda }}>43 - Via</div>
            <div style={{ width: '26px', padding: '1px 2px', borderRight: borda }}>44 - Tec.</div>
            <div style={{ width: '60px', padding: '1px 2px', borderRight: borda }}>45 - Fator<br/>Red./Acresc.</div>
            <div style={{ width: '70px', padding: '1px 2px', borderRight: borda }}>46 - Valor<br/>Unitário (R$)</div>
            <div style={{ width: '70px', padding: '1px 2px' }}>47 - Valor<br/>Total (R$)</div>
          </div>
          {[1,2,3,4,5].map((seq, idx) => (
            <div key={seq} style={{
              display: 'flex',
              borderBottom: idx < 4 ? borda : undefined,
              minHeight: '13px',
              fontSize: '7.5px',
            }}>
              <div style={{ width: '14px', padding: '1px 2px', borderRight: borda, textAlign: 'center', fontWeight: 700 }}>{seq}-</div>
              <div style={{ width: '60px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ width: '48px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ width: '48px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ width: '34px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ width: '90px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ flex: 1, padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ width: '36px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ width: '26px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ width: '26px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ width: '60px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ width: '70px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ width: '70px', padding: '1px 2px' }}>&nbsp;</div>
            </div>
          ))}
        </div>

        {/* ══ PROFISSIONAIS EXECUTANTES ══ */}
        <div style={{ border: borda, marginBottom: '-1px' }}>
          <Secao label="Identificação do(s) Profissional(is) Executante(s)" cor={corSec} />
          <div style={{ display: 'flex', fontSize: '6.5px', fontWeight: 600, borderBottom: borda }}>
            <div style={{ width: '40px', padding: '1px 2px', borderRight: borda }}>48 - Seq. Ref</div>
            <div style={{ width: '50px', padding: '1px 2px', borderRight: borda }}>49 - Grau Part.</div>
            <div style={{ width: '140px', padding: '1px 2px', borderRight: borda }}>50 - Código na Operadora/CPF</div>
            <div style={{ flex: 1, padding: '1px 2px', borderRight: borda }}>51 - Nome do profissional</div>
            <div style={{ width: '70px', padding: '1px 2px', borderRight: borda }}>52 - Conselho<br/>profissional</div>
            <div style={{ width: '110px', padding: '1px 2px', borderRight: borda }}>53 - Número no Conselho</div>
            <div style={{ width: '36px', padding: '1px 2px', borderRight: borda }}>54 - UF</div>
            <div style={{ width: '80px', padding: '1px 2px' }}>55 - Código CBO</div>
          </div>
          {[1,2,3].map((seq, idx) => (
            <div key={seq} style={{ display: 'flex', borderBottom: idx < 2 ? borda : undefined, minHeight: '13px' }}>
              <div style={{ width: '40px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ width: '50px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ width: '140px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ flex: 1, padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ width: '70px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ width: '110px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ width: '36px', padding: '1px 2px', borderRight: borda }}>&nbsp;</div>
              <div style={{ width: '80px', padding: '1px 2px' }}>&nbsp;</div>
            </div>
          ))}
        </div>

        {/* ══ 56 + 57 ══ */}
        <div style={{ border: borda, marginBottom: '-1px' }}>
          <div style={{ display: 'flex', backgroundColor: corSec, borderBottom: borda, fontSize: '7px', fontWeight: 700 }}>
            <div style={{ flex: 1, padding: '1px 5px', borderRight: borda }}>56 - Data de Realização de Procedimento em Série</div>
            <div style={{ width: '320px', padding: '1px 5px' }}>57 - Assinatura do Beneficiário ou Responsável</div>
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, padding: '3px 5px', borderRight: borda, fontSize: '7.5px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '3px 10px' }}>
                {['1-','2-','3-','4-','5-','6-','7-','8-','9-','10-'].map(n => (
                  <span key={n}>{n} __/__/____</span>
                ))}
              </div>
            </div>
            <div style={{ width: '320px', minHeight: '22px' }}>&nbsp;</div>
          </div>
        </div>

        {/* ══ 58 - OBSERVAÇÃO ══ */}
        <div style={{ border: borda, flex: 1, marginBottom: '-1px', minHeight: '24px' }}>
          <Secao label="58 - Observação / Justificativa" cor={corSec} />
          <div style={{ padding: '3px 5px', fontSize: '8px', lineHeight: 1.35, textTransform: 'uppercase', fontWeight: 600 }}>
            {justificativa}
          </div>
        </div>

        {/* ══ TOTAIS 59-65 ══ */}
        <div style={{ display: 'flex', border: borda, marginBottom: '-1px', fontSize: '6.5px', fontWeight: 600 }}>
          {[
            { n: 59, t: 'Total de Procedimentos (R$)' },
            { n: 60, t: 'Total de Taxas e Aluguéis (R$)' },
            { n: 61, t: 'Total de Materiais (R$)' },
            { n: 62, t: 'Total de OPME (R$)' },
            { n: 63, t: 'Total de Medicamentos (R$)' },
            { n: 64, t: 'Total de Gases Medicinais (R$)' },
            { n: 65, t: 'Total Geral (R$)' },
          ].map(({ n, t }, i, arr) => (
            <div key={n} style={{ flex: 1, padding: '2px 4px', borderRight: i < arr.length - 1 ? borda : undefined, minHeight: '18px' }}>
              <div>{n} - {t}</div>
              <div>&nbsp;</div>
            </div>
          ))}
        </div>

        {/* ══ ASSINATURAS 66-68 ══ */}
        <div style={{ display: 'flex', border: borda, minHeight: '26px' }}>
          <div style={{ flex: 1, padding: '2px 4px', borderRight: borda, fontSize: '6.5px', fontWeight: 600 }}>
            66 - Assinatura do Responsável pela Autorização
          </div>
          <div style={{ flex: 1, padding: '2px 4px', borderRight: borda, fontSize: '6.5px', fontWeight: 600 }}>
            67 - Assinatura do Beneficiário ou Responsável
          </div>
          <div style={{ flex: 1, padding: '2px 4px', fontSize: '6.5px', fontWeight: 600 }}>
            68 - Assinatura do Contratado
          </div>
        </div>

      </div>
    </>
  );
}
