import { useReceitaStore, type MedicamentoReceita } from '../../../store/useReceitaStore';
import { REGRAS_MODELO } from '../../../data/regrasReceita';
import FolhaDuasVias from './FolhaDuasVias';
import BlocoEmitente from './BlocoEmitente';
import ItemPrescricao from './ItemPrescricao';

/**
 * Receita com retenção — antimicrobianos (RDC 471/2021) e agonistas GLP-1 (RDC 973/2025).
 * 2 vias; a farmácia retém a 2ª e devolve a 1ª ao paciente (art. 10).
 * Exige nome completo, idade e sexo do paciente e endereço completo + telefone
 * do emitente (art. 6º). Não pode levar controlado junto (art. 8º).
 */
export default function ReceitaRetencao({
  medicamentos = [],
  textoLivre,
  soGlp1 = false,
}: {
  medicamentos?: MedicamentoReceita[];
  textoLivre?: string;
  soGlp1?: boolean;
}) {
  const pacienteNome = useReceitaStore((s) => s.pacienteNome);
  const pacienteIdade = useReceitaStore((s) => s.pacienteIdade);
  const pacienteSexo = useReceitaStore((s) => s.pacienteSexo);
  const local = useReceitaStore((s) => s.local);
  const data = useReceitaStore((s) => s.data);
  const regra = REGRAS_MODELO.RETENCAO;
  const titulo = soGlp1 ? 'Receita com retenção' : 'Receita — antimicrobiano';
  const validade = soGlp1 ? 90 : regra.validadeDias;
  const sexo = pacienteSexo === 'F' ? 'Feminino' : pacienteSexo === 'M' ? 'Masculino' : '__________';

  const via = (rotulo: string) => (
    <div style={{ padding: '7mm 10mm 6mm', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', fontSize: '11.5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{titulo}</div>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{rotulo}</div>
      </div>

      <BlocoEmitente />

      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #000', padding: '5px 0 2px', marginBottom: '6px' }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 700 }}>Paciente: </span>
          {pacienteNome || '______________________________________'}
        </div>
        <div style={{ whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 700 }}>Idade: </span>
          {pacienteIdade ? `${pacienteIdade.replace(/\s*anos?$/i, '')} anos` : '_____'}
        </div>
        <div style={{ whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 700 }}>Sexo: </span>
          {sexo}
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
        <div style={{ fontSize: '11px' }}>
          <div>{local || 'Fortaleza-CE'}, {data || '____/____/______'}</div>
          <div style={{ fontSize: '10px' }}>Válida por {validade} dias a partir da emissão.</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', width: '62mm', paddingTop: '2px', fontSize: '10px' }}>
            Assinatura e carimbo do prescritor
          </div>
        </div>
      </div>
    </div>
  );

  return <FolhaDuasVias rotulos={regra.rotuloVias!} renderVia={via} />;
}
