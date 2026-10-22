import qrLaSalute from '../../../assets/farmacias/la-salute.png';
import qrMeicosFarma from '../../../assets/farmacias/meicos-farma.png';

/**
 * Farmácias de referência no rodapé das receitas A4 (simples e manipulação de 1 via).
 * Os QR Codes são os arquivos entregues pelas farmácias, só recortados ao redor:
 * nada de gerar de novo. Abaixo de ~24 mm o celular começa a errar a leitura.
 */
const FARMACIAS = [
  { nome: 'LA SALUTÉ', whatsapp: '(85) 99121-5119', qr: qrLaSalute },
  { nome: 'MEICOS FARMA', whatsapp: '(41) 9819-5551', qr: qrMeicosFarma },
];

export default function FarmaciasReferencia({ qrMm = 27 }: { qrMm?: number }) {
  return (
    <div style={{ borderTop: '0.5pt solid #bbb', marginTop: '3mm', paddingTop: '2mm', color: '#111', breakInside: 'avoid' }}>
      <p
        style={{
          fontSize: '7.5px',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          textAlign: 'center',
          color: '#444',
          marginBottom: '1.5mm',
        }}
      >
        Farmácias de referência — consulte disponibilidade
      </p>

      <div style={{ display: 'flex' }}>
        {FARMACIAS.map((f, i) => (
          <div
            key={f.nome}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4mm',
              ...(i > 0 ? { borderLeft: '0.5pt solid #ccc' } : {}),
            }}
          >
            <img
              src={f.qr}
              alt={`QR Code do WhatsApp da ${f.nome}`}
              width={400}
              height={400}
              style={{ width: `${qrMm}mm`, height: `${qrMm}mm`, imageRendering: 'pixelated', display: 'block' }}
            />
            <div style={{ textAlign: 'left', lineHeight: 1.35 }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em' }}>{f.nome}</p>
              <p style={{ fontSize: '9.5px' }}>WhatsApp {f.whatsapp}</p>
              <p style={{ fontSize: '7.5px', color: '#555', marginTop: '1mm' }}>Escaneie para solicitar seu medicamento</p>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '7px', color: '#555', textAlign: 'center', marginTop: '1.5mm' }}>
        O paciente possui liberdade para adquirir seus medicamentos em qualquer farmácia de sua preferência.
      </p>
    </div>
  );
}
