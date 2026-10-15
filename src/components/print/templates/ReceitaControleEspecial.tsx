import { useReceitaStore, type MedicamentoReceita } from '../../../store/useReceitaStore';
import { REGRAS_MODELO } from '../../../data/regrasReceita';
import FolhaDuasVias from './FolhaDuasVias';
import BlocoEmitente from './BlocoEmitente';
import ItemPrescricao from './ItemPrescricao';

/**
 * Receita de Controle Especial — listas C1, C5 e adendo A2 (Portaria 344/98).
 * - Título com a expressão exata "Receita de Controle Especial" (sem ela a farmácia deve recusar).
 * - 2 vias: 1ª retida na farmácia, 2ª orientação ao paciente.
 * - Paciente: nome, CPF (ou "Não possui") e endereço completo.
 * - Quantidade em número e por extenso; no máximo 3 substâncias (o agrupador garante).
 * - Comprador (com identidade e órgão emissor) e fornecedor em branco para a farmácia.
 */
export default function ReceitaControleEspecial({
  medicamentos = [],
  textoLivre,
}: {
  medicamentos?: MedicamentoReceita[];
  textoLivre?: string;
}) {
  const pacienteNome = useReceitaStore((s) => s.pacienteNome);
  const pacienteCpf = useReceitaStore((s) => s.pacienteCpf);
  const pacienteSemCpf = useReceitaStore((s) => s.pacienteSemCpf);
  const pacienteEndereco = useReceitaStore((s) => s.pacienteEndereco);
  const pacienteCidade = useReceitaStore((s) => s.pacienteCidade);
  const pacienteUf = useReceitaStore((s) => s.pacienteUf);
  const pacienteCep = useReceitaStore((s) => s.pacienteCep);
  const local = useReceitaStore((s) => s.local);
  const data = useReceitaStore((s) => s.data);
  const regra = REGRAS_MODELO.RCE;

  const enderecoPaciente = [
    pacienteEndereco,
    [pacienteCidade, pacienteUf].filter(Boolean).join('/'),
    pacienteCep ? `CEP ${pacienteCep}` : '',
  ]
    .filter((s) => s && s.trim())
    .join(' - ');
  const cpf = pacienteSemCpf && !pacienteCpf ? 'Não possui' : pacienteCpf;

  const linha = (rotulo: string, largura?: string) => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', marginBottom: '3px', ...(largura ? { width: largura } : { flex: 1 }) }}>
      <span style={{ whiteSpace: 'nowrap' }}>{rotulo}</span>
      <span style={{ flex: 1, borderBottom: '0.5pt solid #000', minHeight: '11px' }} />
    </div>
  );

  const via = (rotulo: string) => (
    <div style={{ padding: '6mm 10mm 5mm', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', fontSize: '11.5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Receita de Controle Especial</div>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{rotulo}</div>
      </div>

      <BlocoEmitente />

      <div style={{ borderBottom: '1px solid #000', padding: '4px 0 2px', marginBottom: '4px', lineHeight: 1.4 }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700 }}>Paciente: </span>
            {pacienteNome || '______________________________________'}
          </div>
          <div style={{ whiteSpace: 'nowrap' }}>
            <span style={{ fontWeight: 700 }}>CPF: </span>
            {cpf || '_______________'}
          </div>
        </div>
        <div>
          <span style={{ fontWeight: 700 }}>Endereço: </span>
          {enderecoPaciente || '________________________________________________________'}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontWeight: 700, marginBottom: '3px' }}>Prescrição:</div>
        {textoLivre ? (
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '12px', lineHeight: 1.4 }}>{textoLivre}</div>
        ) : (
          medicamentos.map((m, i) => <ItemPrescricao key={m.id} med={m} numero={i + 1} />)
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '4px 0 5px' }}>
        <div style={{ fontSize: '11px' }}>
          {local || 'Fortaleza-CE'}, {data || '____/____/______'}
        </div>
        <div style={{ borderTop: '1px solid #000', width: '62mm', paddingTop: '2px', fontSize: '10px', textAlign: 'center' }}>
          Assinatura do emitente
        </div>
      </div>

      <div style={{ display: 'flex', border: '1px solid #000', fontSize: '10px' }}>
        <div style={{ flex: 1, borderRight: '1px solid #000', padding: '3px 5px' }}>
          <div style={{ fontWeight: 700, textTransform: 'uppercase', textAlign: 'center', borderBottom: '0.5pt solid #000', marginBottom: '3px' }}>
            Identificação do comprador
          </div>
          {linha('Nome:')}
          <div style={{ display: 'flex', gap: '6px' }}>
            {linha('Ident.:')}
            {linha('Órg. emissor:', '40%')}
          </div>
          {linha('End.:')}
          <div style={{ display: 'flex', gap: '6px' }}>
            {linha('Cidade:')}
            {linha('UF:', '18%')}
          </div>
          {linha('Telefone:')}
        </div>
        <div style={{ flex: 1, padding: '3px 5px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 700, textTransform: 'uppercase', textAlign: 'center', borderBottom: '0.5pt solid #000', marginBottom: '3px' }}>
            Identificação do fornecedor
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5pt solid #000', paddingTop: '2px' }}>
            <span>Assinatura do farmacêutico</span>
            <span>Data ____/____/______</span>
          </div>
        </div>
      </div>
    </div>
  );

  return <FolhaDuasVias rotulos={regra.rotuloVias!} renderVia={via} />;
}
