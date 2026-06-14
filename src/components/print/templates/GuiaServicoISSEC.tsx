import { useAppStore } from '../../../store/useAppStore';
import { SERVICO_POR_ID, getServicoNome } from '../../../data/servicos';
import type { ServicoGrupo } from '../../../data/servicos';
import logoIssec from '../../../assets/logo_issec.jpeg';
import logoIssec2 from '../../../assets/logo_issec_2.jpeg';

/* ---------------------------------------------------------------------------
 *  GUIA DE SERVIÇO – II (ISSEC) — fiel ao formulário oficial.
 *  Usada para TERAPIAS (Fisioterapia, Fonoaudiologia, Psicologia).
 *  Aceita UM serviço por guia (uma única linha de procedimento + grade de
 *  autorização por sessão).
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

  // Guia de Serviço II aceita UM serviço por vez.
  const servicoId = servicosSelecionados[0];
  const grupo: ServicoGrupo | undefined = servicoId ? SERVICO_POR_ID[servicoId]?.grupo : undefined;
  const procedimento = servicoId ? getServicoNome(servicoId) : '';

  return (
    <div
      className="bg-white text-black select-none"
      style={{
        width: '210mm',
        minHeight: '297mm',
        paddingTop: '8mm',
        paddingBottom: '8mm',
        paddingLeft: '10mm',
        paddingRight: '7.5mm',
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: '10pt',
        lineHeight: 1.12,
        boxSizing: 'border-box',
      }}
    >
      {/* CABEÇALHO */}
      <div className="flex items-start justify-between" style={{ marginBottom: '1mm' }}>
        <img src={logoIssec2} alt="ISSEC" style={{ height: '16mm', width: 'auto', objectFit: 'contain' }} />
        <img src={logoIssec} alt="Governo do Estado do Ceará" style={{ height: '16mm', width: 'auto', objectFit: 'contain' }} />
      </div>

      <div className="text-center" style={{ fontSize: '15pt', fontWeight: 'bold', letterSpacing: '0.02em', marginTop: '1mm', marginBottom: '3mm' }}>
        GUIA DE SERVIÇO – II
      </div>

      {/* ═══════ BLOCO 1 – PROCEDIMENTO (tipo de tratamento) ═══════ */}
      <table className="border-collapse" style={{ width: '187.6mm', border: '1.5pt solid black', marginBottom: '2mm', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '40mm' }} />
          <col style={{ width: '49.2mm' }} />
          <col style={{ width: '49.2mm' }} />
          <col style={{ width: '49.2mm' }} />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={4} className="text-center" style={headerCell}>PROCEDIMENTO</td>
          </tr>
          <tr style={{ height: '12mm' }}>
            <td style={{ borderRight: '1pt solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '9.5pt', padding: '0 2mm', verticalAlign: 'middle' }}>
              TRATAMENTO OU<br />SERVIÇO ESPECIALIZADO
            </td>
            <td style={cellOpcao}><div style={optionRow}><span>Fisioterapia</span><Chk checked={grupo === 'FISIOTERAPIA'} /></div></td>
            <td style={cellOpcao}><div style={optionRow}><span>Fonoaudiologia</span><Chk checked={grupo === 'FONOAUDIOLOGIA'} /></div></td>
            <td style={cellOpcao}><div style={optionRow}><span>Psicologia</span><Chk checked={grupo === 'PSICOLOGIA'} /></div></td>
          </tr>
        </tbody>
      </table>

      {/* ═══════ BLOCO 2 – RESERVADO AO MÉDICO REQUISITANTE ═══════ */}
      <table className="border-collapse" style={{ width: '187.6mm', border: '1.5pt solid black', marginBottom: '2mm', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '13mm' }} />
          <col style={{ width: '120mm' }} />
          <col style={{ width: '32.6mm' }} />
          <col style={{ width: '22mm' }} />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={4} className="text-center" style={headerCell}>RESERVADO AO MÉDICO REQUISITANTE</td>
          </tr>

          {/* Nome (2 linhas, largura quase total) + Cartão ISSEC no topo direito */}
          <tr style={{ height: '18mm' }}>
            <td colSpan={4} style={{ borderBottom: '1pt solid black', padding: 0, height: '18mm', position: 'relative' }}>
              {/* Cartão ISSEC — caixa aberta no topo, canto superior direito */}
              <div style={{ position: 'absolute', right: '2mm', top: '3mm', width: '45mm', height: '9mm', border: '1.25pt solid black', borderTop: 'none', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: '6mm', borderTop: '1.25pt solid black' }} />
                <div style={{ position: 'absolute', right: 0, top: 0, width: '6mm', borderTop: '1.25pt solid black' }} />
                <div style={{ position: 'absolute', left: '6mm', right: '6mm', top: '-2.5mm', textAlign: 'center', fontSize: '9.5pt', fontWeight: 'bold', lineHeight: '1', whiteSpace: 'nowrap' }}>CARTÃO ISSEC</div>
                <div style={{ fontSize: '11pt', fontWeight: 'bold', fontFamily: 'monospace', marginTop: '1mm' }}>{numeroBeneficiario}</div>
              </div>
              {/* Linhas do nome */}
              <div style={{ paddingTop: '4mm' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: '0.75pt solid black', height: '7mm', boxSizing: 'border-box', paddingLeft: '2mm', paddingBottom: '0.5mm', marginRight: '50mm' }}>
                  <span style={{ fontSize: '10pt', fontWeight: 'bold', marginRight: '2mm', flexShrink: 0 }}>Nome do Beneficiário:</span>
                  <span style={{ flexGrow: 1, fontSize: '10pt', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pacienteNome}</span>
                </div>
                <div style={{ borderBottom: '0.75pt solid black', height: '5mm', marginLeft: '2mm', marginRight: '4mm', boxSizing: 'border-box' }} />
              </div>
            </td>
          </tr>

          {/* Subheader: N.º | PROCEDIMENTOS SOLICITADOS | QUANT. */}
          <tr style={{ height: '4.1mm' }}>
            <td style={{ borderRight: '1pt solid black', borderBottom: '1pt solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '9pt' }}>N.º</td>
            <td colSpan={2} style={{ borderRight: '1pt solid black', borderBottom: '1pt solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '10pt' }}>PROCEDIMENTOS SOLICITADOS</td>
            <td style={{ borderBottom: '1pt solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '9pt' }}>QUANT.</td>
          </tr>

          {/* Linha única 01 (um serviço por guia) */}
          <tr style={{ height: '11mm' }}>
            <td style={{ borderRight: '1pt solid black', borderBottom: '1pt solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '10pt', verticalAlign: 'middle' }}>01</td>
            <td colSpan={2} style={{ borderRight: '1pt solid black', borderBottom: '1pt solid black', padding: '1mm 2mm', fontSize: '10px', fontFamily: 'Arial, Helvetica, sans-serif', textTransform: 'uppercase', verticalAlign: 'middle' }}>{procedimento}</td>
            <td style={{ borderBottom: '1pt solid black', verticalAlign: 'middle' }}>&nbsp;</td>
          </tr>

          {/* Justificativa (esq) | Senha + Data + Carimbo (dir, mais larga que QUANT) */}
          <tr style={{ height: '34mm' }}>
            <td colSpan={2} style={{ borderRight: '1pt solid black', verticalAlign: 'top', padding: '1.5mm 2mm' }}>
              <span style={{ fontSize: '10pt' }}>Justificativa:</span>
              <div style={{ marginTop: '1mm', fontSize: '9.5px', fontFamily: 'Arial, Helvetica, sans-serif', lineHeight: 1.3, textTransform: 'uppercase', textAlign: 'justify' }}>
                {justificativaServicos}
              </div>
            </td>
            <td colSpan={2} style={{ padding: 0, verticalAlign: 'top' }}>
              <div style={{ borderBottom: '1pt solid black', padding: '1.5mm 2mm', fontSize: '9.5pt', height: '12mm', boxSizing: 'border-box' }}>
                Senha de Autorização da Consulta
              </div>
              <div style={{ padding: '2mm', height: 'calc(34mm - 12mm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '9pt', whiteSpace: 'nowrap' }}>
                  Data da solicitação
                  <span style={{ borderBottom: '0.5pt solid black', display: 'inline-block', width: '7mm' }}>&nbsp;</span>
                  /<span style={{ borderBottom: '0.5pt solid black', display: 'inline-block', width: '7mm' }}>&nbsp;</span>
                  /<span style={{ borderBottom: '0.5pt solid black', display: 'inline-block', width: '11mm' }}>&nbsp;</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: '9pt' }}>Carimbo e Assinatura do Médico</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ═══════ BLOCO 3 – SERVIÇO EXECUTADO ═══════ */}
      <table className="border-collapse" style={{ width: '187.6mm', border: '1.5pt solid black', marginBottom: '2mm', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '10mm' }} />
          <col style={{ width: '92.6mm' }} />
          {Array.from({ length: 8 }).map((_, i) => (<col key={i} style={{ width: '7.5mm' }} />))}
          <col style={{ width: '25mm' }} />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={11} className="text-center" style={{ ...headerCell, fontSize: '11pt' }}>SERVIÇO EXECUTADO</td>
          </tr>
          <tr style={{ height: '4.1mm' }}>
            <td style={thBase}>N.º</td>
            <td style={thBase}>PROCEDIMENTO</td>
            <td colSpan={8} style={thBase}>CÓDIGO TABELA</td>
            <td style={{ ...thBase, borderRight: 'none' }}>VALOR R$</td>
          </tr>
          <tr style={{ height: '8mm' }}>
            <td style={tdBase}>01</td>
            <td style={tdBase}></td>
            {Array.from({ length: 8 }).map((_, i) => (<td key={i} style={tdBase}></td>))}
            <td style={{ ...tdBase, borderRight: 'none' }}></td>
          </tr>
        </tbody>
      </table>

      {/* CÓDIGO DE TRATAMENTO */}
      <div style={{ border: '1.5pt solid black', borderBottom: 'none', padding: '1mm 2mm', fontSize: '10pt', fontWeight: 'bold', width: '187.6mm', boxSizing: 'border-box' }}>
        CÓDIGO DE TRATAMENTO:
      </div>

      {/* ═══════ BLOCO 4 – AUTORIZAÇÃO POR SESSÃO ═══════ */}
      <table className="border-collapse" style={{ width: '187.6mm', border: '1.5pt solid black', marginBottom: '2mm', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '52mm' }} />
          <col style={{ width: '38mm' }} />
          <col style={{ width: '97.6mm' }} />
        </colgroup>
        <tbody>
          <tr style={{ height: '8mm' }}>
            <td style={thBase}>Senha de Autorização</td>
            <td style={thBase}>Data da autorização</td>
            <td style={{ ...thBase, borderRight: 'none' }}>Assinatura do beneficiário ou responsável</td>
          </tr>
          {Array.from({ length: 15 }).map((_, i) => (
            <tr key={i} style={{ height: '6mm' }}>
              <td style={tdBase}></td>
              <td style={tdBase}></td>
              <td style={{ ...tdBase, borderRight: 'none' }}></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Carimbo do Credenciado */}
      <div style={{ border: '1.5pt solid black', padding: '2mm', fontSize: '10pt', fontWeight: 'bold', width: '187.6mm', boxSizing: 'border-box', marginBottom: '2mm' }}>
        Carimbo e Assinatura do Credenciado
      </div>

      {/* RODAPÉ */}
      <div className="text-center" style={{ marginTop: '2mm', fontSize: '9pt', fontWeight: 'bold', color: '#cc3300', letterSpacing: '0.02em' }}>
        OBS.: ESTA GUIA DEVERÁ SER UTILIZADA PARA CADA TIPO DE SERVIÇO, DISTINTAMENTE.
      </div>
    </div>
  );
}

/* ───────── Estilos reutilizados ───────── */
const headerCell: React.CSSProperties = {
  border: '1pt solid black',
  fontWeight: 'bold',
  fontSize: '10pt',
  padding: '0.5mm 0',
  height: '4.1mm',
  backgroundColor: '#e6e6e6',
};
const cellOpcao: React.CSSProperties = {
  padding: '0 3mm',
  fontSize: '10pt',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
  borderRight: '1pt solid black',
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
  fontSize: '9.5pt',
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
