import { useAppStore } from '../../../store/useAppStore';
import {
  getProcedimentoNome,
  isProcedimentoCardiologico,
  isProcedimentoUltrassom,
  isProcedimentoEndoscopico,
  isProcedimentoImagem,
  isProcedimentoGeriatrico,
} from '../../../data/procedimentos';
import logoIssec from '../../../assets/logo_issec.jpeg';
import logoIssec2 from '../../../assets/logo_issec_2.jpeg';

/* ---------------------------------------------------------------------------
 *  GUIA ISSEC – fiel ao layout oficial do DOCX (GUIA_ISSEC_-_NOVO.docx)
 *  Página A4: 210 × 297 mm
 *  Margens: top 27.9mm | bottom 12.4mm | left 10mm | right 7.5mm
 *  Largura útil das tabelas: 187.6mm (10635 DXA)
 *  Fonte base: Times New Roman 10pt (sz=20 half-points no DOCX)
 *  ------------------------------------------------------------------------- */

/* Checkbox quadrado preto vazio — alinhado à direita do rótulo (como no oficial) */
function Chk({ checked }: { checked: boolean }) {
  return (
    <span
      className="inline-flex items-center justify-center border border-black bg-white font-bold flex-shrink-0"
      style={{
        width: '5mm',
        height: '5mm',
        fontSize: '10pt',
        lineHeight: '1',
      }}
    >
      {checked ? 'X' : ''}
    </span>
  );
}



export default function GuiaISSEC() {
  const {
    pacienteNome,
    numeroBeneficiario,
    examesSelecionados,
    procedimentosSelecionados,
    tipoGuia,
    justificativa,
  } = useAppStore();

  const isLab    = tipoGuia === 'LABORATORIO';
  const isCardio = procedimentosSelecionados.some(isProcedimentoCardiologico);
  const isUltra  = procedimentosSelecionados.some(isProcedimentoUltrassom);
  const isEndosc = procedimentosSelecionados.some(isProcedimentoEndoscopico);
  const isRadio  = procedimentosSelecionados.some(isProcedimentoImagem);
  const isOutros = procedimentosSelecionados.some(isProcedimentoGeriatrico);

  /* Quebra exames em até 3 linhas para o caso laboratorial */
  const getLinhas = () => {
    const fmt = examesSelecionados;
    const chunk = Math.ceil(fmt.length / 3) || 1;
    return [
      fmt.slice(0, chunk).join(', '),
      fmt.slice(chunk, chunk * 2).join(', '),
      fmt.slice(chunk * 2).join(', '),
    ];
  };
  const linhas = getLinhas();

  return (
    <div
      className="bg-white text-black select-none"
      style={{
        /* A4 retrato com margens do DOCX ajustadas para evitar excesso de espaço no topo */
        width: '210mm',
        minHeight: '297mm',
        paddingTop: '10mm',
        paddingBottom: '10mm',
        paddingLeft: '10mm',
        paddingRight: '7.5mm',
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: '10pt',
        lineHeight: 1.15,
        boxSizing: 'border-box',
      }}
    >
      {/* ═══════════════════ CABEÇALHO (logos + título) ═══════════════════
          Ajustado para subir a estrutura e evitar espaços vazios no topo. */}
      <div
        className="flex items-start justify-between"
        style={{ marginBottom: '2mm' }}
      >
        <img
          src={logoIssec2}
          alt="ISSEC"
          style={{ height: '18mm', width: 'auto', objectFit: 'contain' }}
        />
        <img
          src={logoIssec}
          alt="Governo do Estado do Ceará"
          style={{ height: '18mm', width: 'auto', objectFit: 'contain' }}
        />
      </div>

      <div
        className="text-center"
        style={{
          fontSize: '16pt',
          fontWeight: 'bold',
          letterSpacing: '0.02em',
          marginTop: '2mm',
          marginBottom: '4mm',
        }}
      >
        GUIA DE SERVIÇO – I
      </div>

      {/* ═══════════════════ BLOCO 1 – PROCEDIMENTO ═══════════════════
          Largura total: 187.6mm
          Grade lógica original (DXA): 780 / 5745 / 4110
          Convertida: 13.8 / 101.4 / 72.5 mm
          Layout: EXAME + chave grande à esquerda envolvendo 2 linhas,
                  6 opções dispostas em 3 colunas × 2 linhas. */}
      <table
        className="border-collapse"
        style={{
          width: '187.6mm',
          border: '1.5pt solid black',
          marginBottom: '2mm',
          tableLayout: 'fixed',
        }}
      >
        <colgroup>
          <col style={{ width: '32mm' }} />
          <col style={{ width: '51.8mm' }} />
          <col style={{ width: '51.9mm' }} />
          <col style={{ width: '51.9mm' }} />
        </colgroup>
        <tbody>
          {/* Header */}
          <tr>
            <td
              colSpan={4}
              className="text-center"
              style={{
                border: '1pt solid black',
                fontWeight: 'bold',
                fontSize: '10pt',
                padding: '0.5mm 0',
                height: '4.1mm',
                backgroundColor: '#e6e6e6',
              }}
            >
              PROCEDIMENTO
            </td>
          </tr>
          {/* Corpo: EXAME + chave | Lab/Ultra/Endo (linha 1) */}
          <tr style={{ height: '9.5mm' }}>
            <td
              rowSpan={2}
              style={{
                width: '32mm',
                verticalAlign: 'middle',
                padding: '0 2mm',
              }}
            >
              <div className="flex items-center justify-center" style={{ gap: '1.5mm', height: '19mm' }}>
                <span style={{ fontWeight: 'bold', fontSize: '11pt', letterSpacing: '0.05em' }}>
                  EXAME
                </span>
                {/* Colchete grande vetorial — abrange as 2 linhas de opções (formato típico de chave tipográfica) */}
                <svg
                  width="4mm"
                  height="18mm"
                  viewBox="0 0 10 80"
                  preserveAspectRatio="none"
                  style={{ flexShrink: 0, overflow: 'visible' }}
                >
                  <path
                    d="M 9 2
                       C 4 2, 4 6, 4 14
                       L 4 36
                       C 4 38, 3 40, 1 40
                       C 3 40, 4 42, 4 44
                       L 4 66
                       C 4 74, 4 78, 9 78"
                    stroke="black"
                    strokeWidth="0.8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </td>
            <td style={cellOpcao}><div style={optionRow}><span>Laboratório</span><Chk checked={isLab} /></div></td>
            <td style={cellOpcao}><div style={optionRow}><span>Ultra-som</span><Chk checked={isUltra} /></div></td>
            <td style={cellOpcao}><div style={optionRow}><span>Endoscópico</span><Chk checked={isEndosc} /></div></td>
          </tr>
          {/* Corpo: linha 2 — Cardiológico / Radiológico / Outros */}
          <tr style={{ height: '9.5mm' }}>
            <td style={cellOpcao}><div style={optionRow}><span>Cardiológico</span><Chk checked={isCardio} /></div></td>
            <td style={cellOpcao}><div style={optionRow}><span>Radiológico</span><Chk checked={isRadio} /></div></td>
            <td style={cellOpcao}><div style={optionRow}><span>Outros</span><Chk checked={isOutros} /></div></td>
          </tr>
        </tbody>
      </table>

      {/* ═══════════════════ BLOCO 2 – RESERVADO AO MÉDICO ═══════════════════
          Grade DXA: 780 / 5745 / 4110 (= 13.8 / 101.4 / 72.5 mm) */}
      <table
        className="border-collapse"
        style={{
          width: '187.6mm',
          border: '1.5pt solid black',
          marginBottom: '2mm',
          tableLayout: 'fixed',
        }}
      >
        <colgroup>
          <col style={{ width: '13.8mm' }} />
          <col style={{ width: '101.3mm' }} />
          <col style={{ width: '72.5mm' }} />
        </colgroup>
        <tbody>
          {/* Header */}
          <tr>
            <td
              colSpan={3}
              className="text-center"
              style={{
                border: '1pt solid black',
                fontWeight: 'bold',
                fontSize: '10pt',
                padding: '0.5mm 0',
                height: '4.1mm',
                backgroundColor: '#e6e6e6',
              }}
            >
              RESERVADO AO MÉDICO REQUISITANTE
            </td>
          </tr>

          {/* Nome do Beneficiário (alt = 1150 DXA ≈ 20.3mm) + CARTÃO ISSEC (sem divisão vertical) */}
          <tr style={{ height: '20.3mm' }}>
            <td
              colSpan={3}
              style={{
                borderBottom: '1pt solid black',
                padding: 0,
                height: '20.3mm',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  height: '20.3mm',
                  padding: 0,
                  boxSizing: 'border-box',
                }}
              >
                {/* Coluna da Esquerda: Nome e as duas linhas */}
                <div
                  style={{
                    flexGrow: 1,
                    marginRight: '6mm',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '20.3mm',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Espaçador superior para empurrar o nome para baixo */}
                  <div style={{ height: '5.5mm' }} />

                  {/* Linha 1: Nome do Beneficiário */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      borderBottom: '0.75pt solid black',
                      height: '7.5mm',
                      boxSizing: 'border-box',
                      paddingLeft: '2mm',
                      paddingBottom: '0.5mm',
                    }}
                  >
                    <span style={{ fontSize: '10pt', fontWeight: 'bold', marginRight: '2mm', flexShrink: 0 }}>
                      Nome do Beneficiário:
                    </span>
                    <span
                      style={{
                        flexGrow: 1,
                        fontSize: '10pt',
                        fontWeight: 'normal',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {pacienteNome}
                    </span>
                  </div>

                  {/* Linha 2: Linha vazia */}
                  <div
                    style={{
                      borderBottom: '0.75pt solid black',
                      height: '5.5mm',
                      marginLeft: '2mm',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Coluna da Direita: Bloco do Cartão ISSEC */}
                <div
                  style={{
                    width: '47mm',
                    height: '20.3mm',
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: '2mm',
                      top: '4.5mm',
                      width: '45mm',
                      height: '8.5mm',
                      border: '1.25pt solid black',
                      borderTop: 'none',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Linha superior esquerda */}
                    <div style={{ position: 'absolute', left: 0, top: 0, width: '6mm', borderTop: '1.25pt solid black' }} />
                    {/* Linha superior direita */}
                    <div style={{ position: 'absolute', right: 0, top: 0, width: '6mm', borderTop: '1.25pt solid black' }} />
                    {/* Texto centralizado */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '6mm',
                        right: '6mm',
                        top: '-2.5mm',
                        textAlign: 'center',
                        fontSize: '9.5pt',
                        fontWeight: 'bold',
                        lineHeight: '1',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      CARTÃO ISSEC
                    </div>
                    {/* Valor do Cartão Beneficiário */}
                    <div
                      style={{
                        fontSize: '11pt',
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        marginTop: '1.5mm',
                      }}
                    >
                      {numeroBeneficiario}
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>

          {/* Subheader Nº / PROCEDIMENTOS SOLICITADOS */}
          <tr style={{ height: '4.1mm' }}>
            <td
              style={{
                borderRight: '1pt solid black',
                borderBottom: '1pt solid black',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '9pt',
              }}
            >
              N.º
            </td>
            <td
              colSpan={2}
              style={{
                borderBottom: '1pt solid black',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '10pt',
              }}
            >
              PROCEDIMENTOS SOLICITADOS
            </td>
          </tr>

          {/* 3 linhas de procedimentos — alturas DXA: 535/499/622 ≈ 9.4/8.8/11mm */}
          {[
            { h: '9.4mm', n: '01' },
            { h: '8.8mm', n: '02' },
            { h: '11mm',  n: '03' },
          ].map((row, idx) => {
            const procs = procedimentosSelecionados.length > 0 ? procedimentosSelecionados : [tipoGuia];
            const content = isLab
              ? linhas[idx] || ''
              : idx < procs.length
                ? getProcedimentoNome(procs[idx])
                : '';
            return (
              <tr key={row.n} style={{ height: row.h }}>
                <td
                  style={{
                    borderRight: '1pt solid black',
                    borderBottom: '1pt solid black',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '10pt',
                    verticalAlign: 'middle',
                  }}
                >
                  {row.n}
                </td>
                <td
                  colSpan={2}
                  style={{
                    borderBottom: '1pt solid black',
                    padding: '1mm 2mm',
                    fontSize: '9.5px',
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontWeight: 'normal',
                    textTransform: 'uppercase',
                    verticalAlign: 'middle',
                  }}
                >
                  {content}
                </td>
              </tr>
            );
          })}

          {/* Justificativa (col 1+2) | Senha+Data+Carimbo (col 3)
              Altura DXA: 855 + 1222 = 2077 ≈ 36.6mm    */}
          <tr style={{ height: '36.6mm' }}>
            <td
              colSpan={2}
              style={{
                borderRight: '1pt solid black',
                verticalAlign: 'top',
                padding: '1.5mm 2mm',
              }}
            >
              <span style={{ fontSize: '10pt' }}>Justificativa:</span>
              <div
                style={{
                  marginTop: '1mm',
                  fontSize: '9.5px',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  lineHeight: 1.3,
                  fontWeight: 'normal',
                  textTransform: 'uppercase',
                  textAlign: 'justify',
                }}
              >
                {justificativa}
              </div>
            </td>
            <td style={{ padding: 0, verticalAlign: 'top' }}>
              {/* Senha de Autorização da Consulta */}
              <div
                style={{
                  borderBottom: '1pt solid black',
                  padding: '1.5mm 2mm',
                  fontSize: '10pt',
                  height: '15mm',
                  boxSizing: 'border-box',
                }}
              >
                Senha de Autorização da Consulta
              </div>
              {/* Data + Carimbo */}
              <div
                style={{
                  padding: '2mm',
                  height: 'calc(36.6mm - 15mm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontSize: '10pt' }}>
                  Data da solicitação <span style={{ borderBottom: '0.5pt solid black', display: 'inline-block', width: '8mm' }}>&nbsp;</span>
                  /<span style={{ borderBottom: '0.5pt solid black', display: 'inline-block', width: '8mm' }}>&nbsp;</span>
                  /<span style={{ borderBottom: '0.5pt solid black', display: 'inline-block', width: '14mm' }}>&nbsp;</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: '10pt' }}>
                  Carimbo e Assinatura do Médico
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ═══════════════════ BLOCO 3 – SERVIÇO EXECUTADO ═══════════════════
          Largura total: 10627 DXA ≈ 187.5mm
          Grade: 540 / 5274 / 424×8 / 1420
          = 9.5 / 93.0 / 7.5×8 / 25 mm */}
      <table
        className="border-collapse"
        style={{
          width: '187.5mm',
          border: '1.5pt solid black',
          marginBottom: '2mm',
          tableLayout: 'fixed',
        }}
      >
        <colgroup>
          <col style={{ width: '9.5mm' }} />
          <col style={{ width: '93mm' }} />
          {Array.from({ length: 8 }).map((_, i) => (
            <col key={i} style={{ width: '7.5mm' }} />
          ))}
          <col style={{ width: '25mm' }} />
        </colgroup>
        <tbody>
          {/* Título */}
          <tr>
            <td
              colSpan={11}
              className="text-center"
              style={{
                border: '1pt solid black',
                fontWeight: 'bold',
                fontSize: '12pt',
                padding: '0.5mm 0',
                height: '4.9mm',
                letterSpacing: '0.02em',
                backgroundColor: '#e6e6e6',
              }}
            >
              SERVIÇO EXECUTADO
            </td>
          </tr>
          {/* Cabeçalhos das colunas */}
          <tr style={{ height: '4.1mm' }}>
            <td style={thBase}>N.º</td>
            <td style={thBase}>PROCEDIMENTO</td>
            <td colSpan={8} style={thBase}>CÓDIGO TABELA</td>
            <td style={{ ...thBase, borderRight: 'none' }}>VALOR R$</td>
          </tr>
          {/* 3 linhas de itens (391 / 387 / 391 DXA ≈ 6.9 / 6.8 / 6.9mm) */}
          {[
            { h: '6.9mm', n: '01' },
            { h: '6.8mm', n: '02' },
            { h: '6.9mm', n: '03' },
          ].map(row => (
            <tr key={row.n} style={{ height: row.h }}>
              <td style={tdBase}>{row.n}</td>
              <td style={tdBase}> </td>
              {Array.from({ length: 8 }).map((_, i) => (
                <td key={i} style={tdBase}></td>
              ))}
              <td style={{ ...tdBase, borderRight: 'none' }}></td>
            </tr>
          ))}
          {/* Linha TOTAL (458 DXA ≈ 8.1mm) */}
          <tr style={{ height: '8.1mm' }}>
            <td
              colSpan={10}
              style={{
                ...tdBase,
                textAlign: 'right',
                paddingRight: '2mm',
                fontWeight: 'bold',
                fontSize: '11pt',
              }}
            >
              TOTAL
            </td>
            <td style={{ ...tdBase, borderRight: 'none' }}></td>
          </tr>
          {/* Linha final: data realização + assinaturas (1450 DXA ≈ 25.6mm) */}
          <tr style={{ height: '25.6mm' }}>
            <td colSpan={2} style={{ padding: '2mm', verticalAlign: 'top', borderRight: '1pt solid black' }}>
              <div style={{ fontSize: '10pt' }}>
                Data da realização do procedimento <span style={{ borderBottom: '0.5pt solid black', display: 'inline-block', width: '8mm' }}>&nbsp;</span>
                /<span style={{ borderBottom: '0.5pt solid black', display: 'inline-block', width: '8mm' }}>&nbsp;</span>
                /<span style={{ borderBottom: '0.5pt solid black', display: 'inline-block', width: '14mm' }}>&nbsp;</span>
              </div>
              <div style={{ marginTop: '15mm', textAlign: 'center' }}>
                <span style={{ borderTop: '0.5pt solid black', paddingTop: '0.5mm', fontSize: '10pt', display: 'inline-block', paddingLeft: '8mm', paddingRight: '8mm' }}>
                  Assinatura do Beneficiário ou Responsável
                </span>
              </div>
            </td>
            <td colSpan={9} style={{ padding: '2mm', verticalAlign: 'top', textAlign: 'left', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '10pt' }}>Carimbo e Assinatura do Credenciado</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ═══════════════════ BLOCO 4 – RESERVADO PARA AUTORIZAÇÃO ═══════════════════ */}
      <table
        className="border-collapse"
        style={{
          width: '187.6mm',
          border: '1.5pt solid black',
          marginBottom: '2mm',
        }}
      >
        <tbody>
          <tr>
            <td
              className="text-center"
              style={{
                border: '1pt solid black',
                fontWeight: 'bold',
                fontSize: '10pt',
                padding: '0.5mm 0',
                height: '4.1mm',
                backgroundColor: '#e6e6e6',
              }}
            >
              RESERVADO PARA AUTORIZAÇÃO
            </td>
          </tr>
          <tr style={{ height: '24mm' }}>
            <td style={{ padding: '3mm 10mm' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Caixa SENHA DE AUTORIZAÇÃO */}
                <div
                  style={{
                    width: '75mm',
                    height: '14mm',
                    border: '1.25pt solid black',
                    borderTop: 'none',
                    position: 'relative',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Linha superior esquerda */}
                  <div style={{ position: 'absolute', left: 0, top: 0, width: '10mm', borderTop: '1.25pt solid black' }} />
                  {/* Linha superior direita */}
                  <div style={{ position: 'absolute', right: 0, top: 0, width: '10mm', borderTop: '1.25pt solid black' }} />
                  {/* Texto centralizado */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '10mm',
                      right: '10mm',
                      top: '-2.5mm',
                      textAlign: 'center',
                      fontSize: '9.5pt',
                      fontWeight: 'bold',
                      lineHeight: '1',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    SENHA DE AUTORIZAÇÃO
                  </div>
                  {/* Quadrados da senha (9 blocos conforme a imagem 2) */}
                  <div style={{ display: 'flex', marginTop: '2.5mm' }}>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '5mm',
                          height: '5mm',
                          border: '0.75pt solid black',
                          marginLeft: i === 0 ? 0 : '-0.75pt',
                          background: 'white',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Caixa DATA DA AUTORIZAÇÃO */}
                <div
                  style={{
                    width: '75mm',
                    height: '14mm',
                    border: '1.25pt solid black',
                    borderTop: 'none',
                    position: 'relative',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Linha superior esquerda */}
                  <div style={{ position: 'absolute', left: 0, top: 0, width: '10mm', borderTop: '1.25pt solid black' }} />
                  {/* Linha superior direita */}
                  <div style={{ position: 'absolute', right: 0, top: 0, width: '10mm', borderTop: '1.25pt solid black' }} />
                  {/* Texto centralizado */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '10mm',
                      right: '10mm',
                      top: '-2.5mm',
                      textAlign: 'center',
                      fontSize: '9.5pt',
                      fontWeight: 'bold',
                      lineHeight: '1',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    DATA DA AUTORIZAÇÃO
                  </div>
                  {/* Campos da data */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3mm', fontSize: '9.5pt', marginTop: '2.5mm' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ borderBottom: '0.75pt solid black', width: '11mm', height: '4.5mm' }}>&nbsp;</span>
                      <span style={{ fontSize: '8pt' }}>dia</span>
                    </div>
                    <span style={{ marginBottom: '1mm', fontWeight: 'bold' }}>/</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ borderBottom: '0.75pt solid black', width: '11mm', height: '4.5mm' }}>&nbsp;</span>
                      <span style={{ fontSize: '8pt' }}>mês</span>
                    </div>
                    <span style={{ marginBottom: '1mm', fontWeight: 'bold' }}>/</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ borderBottom: '0.75pt solid black', width: '16mm', height: '4.5mm' }}>&nbsp;</span>
                      <span style={{ fontSize: '8pt' }}>ano</span>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ═══════════════════ RODAPÉ ═══════════════════ */}
      <div
        className="relative"
        style={{ marginTop: '3mm', minHeight: '5mm' }}
      >
        <div
          className="text-center"
          style={{
            fontSize: '9pt',
            fontWeight: 'bold',
            color: '#cc3300',
            letterSpacing: '0.02em',
          }}
        >
          OBS.: ESTA GUIA DEVERÁ SER UTILIZADA PARA CADA TIPO DE SERVIÇO, DISTINTAMENTE.
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            fontSize: '7pt',
            color: '#888',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          LMD
        </div>
      </div>
    </div>
  );
}

/* ───────── Estilos reutilizados ───────── */

const cellOpcao: React.CSSProperties = {
  padding: '0 3mm',
  fontSize: '10pt',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

/* Wrapper interno do <td>: faz "Rótulo ........ [ ]" */
const optionRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '2mm',
};

const thBase: React.CSSProperties = {
  borderRight: '1pt solid black',
  borderBottom: '1pt solid black',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '10pt',
  padding: '0.5mm 1mm',
};

const tdBase: React.CSSProperties = {
  borderRight: '1pt solid black',
  borderBottom: '1pt solid black',
  textAlign: 'center',
  fontSize: '10pt',
  padding: '0.5mm 1mm',
  verticalAlign: 'middle',
};