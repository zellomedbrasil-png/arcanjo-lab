import { useAppStore } from '../../../store/useAppStore';
import { SERVICO_POR_ID, getServicoNome } from '../../../data/servicos';
import type { ServicoGrupo } from '../../../data/servicos';
import logoIssec from '../../../assets/logo_issec.jpeg';
import logoIssec2 from '../../../assets/logo_issec_2.jpeg';

/* ---------------------------------------------------------------------------
 *  GUIA DE SERVIÇO – II (ISSEC) — usada para TERAPIAS (Fisio, Fono, Psico,
 *  Nutrição, T.O., Acupuntura), conforme material de apoio ISSEC × IPM.
 *  Modelada sobre o layout oficial da Guia de Serviço – I (mesma família de
 *  formulário ISSEC), com o tipo de serviço adaptado para terapias.
 *  Página A4: 210 × 297 mm · Times New Roman 10pt.
 *  ------------------------------------------------------------------------- */

function Chk({ checked }: { checked: boolean }) {
  return (
    <span
      className="inline-flex items-center justify-center border border-black bg-white font-bold flex-shrink-0"
      style={{ width: '5mm', height: '5mm', fontSize: '10pt', lineHeight: '1' }}
    >
      {checked ? 'X' : ''}
    </span>
  );
}

export default function GuiaServicoISSEC() {
  const { pacienteNome, numeroBeneficiario, servicosSelecionados, justificativaServicos } = useAppStore();

  const gruposSelecionados = new Set<ServicoGrupo>(
    servicosSelecionados.map((id) => SERVICO_POR_ID[id]?.grupo).filter(Boolean) as ServicoGrupo[]
  );
  const has = (g: ServicoGrupo) => gruposSelecionados.has(g);

  const itens = servicosSelecionados.length > 0 ? servicosSelecionados.map(getServicoNome) : [''];

  return (
    <div
      className="bg-white text-black select-none"
      style={{
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
      {/* CABEÇALHO */}
      <div className="flex items-start justify-between" style={{ marginBottom: '2mm' }}>
        <img src={logoIssec2} alt="ISSEC" style={{ height: '18mm', width: 'auto', objectFit: 'contain' }} />
        <img src={logoIssec} alt="Governo do Estado do Ceará" style={{ height: '18mm', width: 'auto', objectFit: 'contain' }} />
      </div>

      <div
        className="text-center"
        style={{ fontSize: '16pt', fontWeight: 'bold', letterSpacing: '0.02em', marginTop: '2mm', marginBottom: '4mm' }}
      >
        GUIA DE SERVIÇO – II
      </div>

      {/* BLOCO 1 – TIPO DE TERAPIA */}
      <table
        className="border-collapse"
        style={{ width: '187.6mm', border: '1.5pt solid black', marginBottom: '2mm', tableLayout: 'fixed' }}
      >
        <colgroup>
          <col style={{ width: '32mm' }} />
          <col style={{ width: '51.8mm' }} />
          <col style={{ width: '51.9mm' }} />
          <col style={{ width: '51.9mm' }} />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={4} className="text-center"
              style={{ border: '1pt solid black', fontWeight: 'bold', fontSize: '10pt', padding: '0.5mm 0', height: '4.1mm', backgroundColor: '#e6e6e6' }}>
              TERAPIA
            </td>
          </tr>
          <tr style={{ height: '9.5mm' }}>
            <td rowSpan={2} style={{ width: '32mm', verticalAlign: 'middle', padding: '0 2mm' }}>
              <div className="flex items-center justify-center" style={{ height: '19mm' }}>
                <span style={{ fontWeight: 'bold', fontSize: '11pt', letterSpacing: '0.05em' }}>TIPO</span>
              </div>
            </td>
            <td style={cellOpcao}><div style={optionRow}><span>Fisioterapia</span><Chk checked={has('FISIOTERAPIA')} /></div></td>
            <td style={cellOpcao}><div style={optionRow}><span>Fonoaudiologia</span><Chk checked={has('FONOAUDIOLOGIA')} /></div></td>
            <td style={cellOpcao}><div style={optionRow}><span>Psicologia</span><Chk checked={has('PSICOLOGIA')} /></div></td>
          </tr>
          <tr style={{ height: '9.5mm' }}>
            <td style={cellOpcao}><div style={optionRow}><span>Nutrição</span><Chk checked={has('NUTRICAO')} /></div></td>
            <td style={cellOpcao}><div style={optionRow}><span>T. Ocupacional</span><Chk checked={has('TERAPIA_OCUPACIONAL')} /></div></td>
            <td style={cellOpcao}><div style={optionRow}><span>Acupuntura</span><Chk checked={has('ACUPUNTURA')} /></div></td>
          </tr>
        </tbody>
      </table>

      {/* BLOCO 2 – RESERVADO AO MÉDICO */}
      <table
        className="border-collapse"
        style={{ width: '187.6mm', border: '1.5pt solid black', marginBottom: '2mm', tableLayout: 'fixed' }}
      >
        <colgroup>
          <col style={{ width: '13.8mm' }} />
          <col style={{ width: '101.3mm' }} />
          <col style={{ width: '72.5mm' }} />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={3} className="text-center"
              style={{ border: '1pt solid black', fontWeight: 'bold', fontSize: '10pt', padding: '0.5mm 0', height: '4.1mm', backgroundColor: '#e6e6e6' }}>
              RESERVADO AO MÉDICO REQUISITANTE
            </td>
          </tr>

          {/* Nome + Cartão ISSEC */}
          <tr style={{ height: '20.3mm' }}>
            <td colSpan={3} style={{ borderBottom: '1pt solid black', padding: 0, height: '20.3mm' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: '20.3mm', boxSizing: 'border-box' }}>
                <div style={{ flexGrow: 1, marginRight: '6mm', display: 'flex', flexDirection: 'column', height: '20.3mm', boxSizing: 'border-box' }}>
                  <div style={{ height: '5.5mm' }} />
                  <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: '0.75pt solid black', height: '7.5mm', boxSizing: 'border-box', paddingLeft: '2mm', paddingBottom: '0.5mm' }}>
                    <span style={{ fontSize: '10pt', fontWeight: 'bold', marginRight: '2mm', flexShrink: 0 }}>Nome do Beneficiário:</span>
                    <span style={{ flexGrow: 1, fontSize: '10pt', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {pacienteNome}
                    </span>
                  </div>
                  <div style={{ borderBottom: '0.75pt solid black', height: '5.5mm', marginLeft: '2mm', boxSizing: 'border-box' }} />
                </div>
                <div style={{ width: '47mm', height: '20.3mm', position: 'relative', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', right: '2mm', top: '4.5mm', width: '45mm', height: '8.5mm', border: '1.25pt solid black', borderTop: 'none', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, width: '6mm', borderTop: '1.25pt solid black' }} />
                    <div style={{ position: 'absolute', right: 0, top: 0, width: '6mm', borderTop: '1.25pt solid black' }} />
                    <div style={{ position: 'absolute', left: '6mm', right: '6mm', top: '-2.5mm', textAlign: 'center', fontSize: '9.5pt', fontWeight: 'bold', lineHeight: '1', whiteSpace: 'nowrap' }}>
                      CARTÃO ISSEC
                    </div>
                    <div style={{ fontSize: '11pt', fontWeight: 'bold', fontFamily: 'monospace', marginTop: '1.5mm' }}>
                      {numeroBeneficiario}
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>

          {/* Subheader */}
          <tr style={{ height: '4.1mm' }}>
            <td style={{ borderRight: '1pt solid black', borderBottom: '1pt solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '9pt' }}>N.º</td>
            <td colSpan={2} style={{ borderBottom: '1pt solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '10pt' }}>TERAPIAS SOLICITADAS</td>
          </tr>

          {/* 3 linhas de terapias */}
          {[{ h: '9.4mm', n: '01' }, { h: '8.8mm', n: '02' }, { h: '11mm', n: '03' }].map((row, idx) => (
            <tr key={row.n} style={{ height: row.h }}>
              <td style={{ borderRight: '1pt solid black', borderBottom: '1pt solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '10pt', verticalAlign: 'middle' }}>
                {row.n}
              </td>
              <td colSpan={2} style={{ borderBottom: '1pt solid black', padding: '1mm 2mm', fontSize: '9.5px', fontFamily: 'Arial, Helvetica, sans-serif', textTransform: 'uppercase', verticalAlign: 'middle' }}>
                {itens[idx] || ''}
              </td>
            </tr>
          ))}

          {/* Justificativa + Senha/Data/Carimbo */}
          <tr style={{ height: '36.6mm' }}>
            <td colSpan={2} style={{ borderRight: '1pt solid black', verticalAlign: 'top', padding: '1.5mm 2mm' }}>
              <span style={{ fontSize: '10pt' }}>Justificativa:</span>
              <div style={{ marginTop: '1mm', fontSize: '9.5px', fontFamily: 'Arial, Helvetica, sans-serif', lineHeight: 1.3, textTransform: 'uppercase', textAlign: 'justify' }}>
                {justificativaServicos}
              </div>
            </td>
            <td style={{ padding: 0, verticalAlign: 'top' }}>
              <div style={{ borderBottom: '1pt solid black', padding: '1.5mm 2mm', fontSize: '10pt', height: '15mm', boxSizing: 'border-box' }}>
                Senha de Autorização da Consulta
              </div>
              <div style={{ padding: '2mm', height: 'calc(36.6mm - 15mm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '10pt' }}>
                  Data da solicitação <span style={{ borderBottom: '0.5pt solid black', display: 'inline-block', width: '8mm' }}>&nbsp;</span>
                  /<span style={{ borderBottom: '0.5pt solid black', display: 'inline-block', width: '8mm' }}>&nbsp;</span>
                  /<span style={{ borderBottom: '0.5pt solid black', display: 'inline-block', width: '14mm' }}>&nbsp;</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: '10pt' }}>Carimbo e Assinatura do Médico</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* BLOCO 3 – SERVIÇO EXECUTADO */}
      <table
        className="border-collapse"
        style={{ width: '187.5mm', border: '1.5pt solid black', marginBottom: '2mm', tableLayout: 'fixed' }}
      >
        <colgroup>
          <col style={{ width: '9.5mm' }} />
          <col style={{ width: '93mm' }} />
          {Array.from({ length: 8 }).map((_, i) => (<col key={i} style={{ width: '7.5mm' }} />))}
          <col style={{ width: '25mm' }} />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={11} className="text-center"
              style={{ border: '1pt solid black', fontWeight: 'bold', fontSize: '12pt', padding: '0.5mm 0', height: '4.9mm', letterSpacing: '0.02em', backgroundColor: '#e6e6e6' }}>
              SERVIÇO EXECUTADO
            </td>
          </tr>
          <tr style={{ height: '4.1mm' }}>
            <td style={thBase}>N.º</td>
            <td style={thBase}>TERAPIA / Nº SESSÕES</td>
            <td colSpan={8} style={thBase}>CÓDIGO TABELA</td>
            <td style={{ ...thBase, borderRight: 'none' }}>VALOR R$</td>
          </tr>
          {[{ h: '6.9mm', n: '01' }, { h: '6.8mm', n: '02' }, { h: '6.9mm', n: '03' }].map(row => (
            <tr key={row.n} style={{ height: row.h }}>
              <td style={tdBase}>{row.n}</td>
              <td style={tdBase}> </td>
              {Array.from({ length: 8 }).map((_, i) => (<td key={i} style={tdBase}></td>))}
              <td style={{ ...tdBase, borderRight: 'none' }}></td>
            </tr>
          ))}
          <tr style={{ height: '8.1mm' }}>
            <td colSpan={10} style={{ ...tdBase, textAlign: 'right', paddingRight: '2mm', fontWeight: 'bold', fontSize: '11pt' }}>TOTAL</td>
            <td style={{ ...tdBase, borderRight: 'none' }}></td>
          </tr>
          <tr style={{ height: '25.6mm' }}>
            <td colSpan={2} style={{ padding: '2mm', verticalAlign: 'top', borderRight: '1pt solid black' }}>
              <div style={{ fontSize: '10pt' }}>
                Data da realização <span style={{ borderBottom: '0.5pt solid black', display: 'inline-block', width: '8mm' }}>&nbsp;</span>
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

      {/* BLOCO 4 – RESERVADO PARA AUTORIZAÇÃO */}
      <table className="border-collapse" style={{ width: '187.6mm', border: '1.5pt solid black', marginBottom: '2mm' }}>
        <tbody>
          <tr>
            <td className="text-center"
              style={{ border: '1pt solid black', fontWeight: 'bold', fontSize: '10pt', padding: '0.5mm 0', height: '4.1mm', backgroundColor: '#e6e6e6' }}>
              RESERVADO PARA AUTORIZAÇÃO
            </td>
          </tr>
          <tr style={{ height: '24mm' }}>
            <td style={{ padding: '3mm 10mm' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '75mm', height: '14mm', border: '1.25pt solid black', borderTop: 'none', position: 'relative', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, width: '10mm', borderTop: '1.25pt solid black' }} />
                  <div style={{ position: 'absolute', right: 0, top: 0, width: '10mm', borderTop: '1.25pt solid black' }} />
                  <div style={{ position: 'absolute', left: '10mm', right: '10mm', top: '-2.5mm', textAlign: 'center', fontSize: '9.5pt', fontWeight: 'bold', lineHeight: '1', whiteSpace: 'nowrap' }}>
                    SENHA DE AUTORIZAÇÃO
                  </div>
                  <div style={{ display: 'flex', marginTop: '2.5mm' }}>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} style={{ width: '5mm', height: '5mm', border: '0.75pt solid black', marginLeft: i === 0 ? 0 : '-0.75pt', background: 'white' }} />
                    ))}
                  </div>
                </div>
                <div style={{ width: '75mm', height: '14mm', border: '1.25pt solid black', borderTop: 'none', position: 'relative', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, width: '10mm', borderTop: '1.25pt solid black' }} />
                  <div style={{ position: 'absolute', right: 0, top: 0, width: '10mm', borderTop: '1.25pt solid black' }} />
                  <div style={{ position: 'absolute', left: '10mm', right: '10mm', top: '-2.5mm', textAlign: 'center', fontSize: '9.5pt', fontWeight: 'bold', lineHeight: '1', whiteSpace: 'nowrap' }}>
                    DATA DA AUTORIZAÇÃO
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3mm', fontSize: '9.5pt', marginTop: '2.5mm' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ borderBottom: '0.75pt solid black', width: '11mm', height: '4.5mm' }}>&nbsp;</span><span style={{ fontSize: '8pt' }}>dia</span>
                    </div>
                    <span style={{ marginBottom: '1mm', fontWeight: 'bold' }}>/</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ borderBottom: '0.75pt solid black', width: '11mm', height: '4.5mm' }}>&nbsp;</span><span style={{ fontSize: '8pt' }}>mês</span>
                    </div>
                    <span style={{ marginBottom: '1mm', fontWeight: 'bold' }}>/</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ borderBottom: '0.75pt solid black', width: '16mm', height: '4.5mm' }}>&nbsp;</span><span style={{ fontSize: '8pt' }}>ano</span>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* RODAPÉ */}
      <div className="relative" style={{ marginTop: '3mm', minHeight: '5mm' }}>
        <div className="text-center" style={{ fontSize: '9pt', fontWeight: 'bold', color: '#cc3300', letterSpacing: '0.02em' }}>
          OBS.: ESTA GUIA DEVERÁ SER UTILIZADA PARA CADA TIPO DE SERVIÇO, DISTINTAMENTE.
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
