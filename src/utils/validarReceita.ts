// Checklist do que faz a farmácia devolver a receita. Roda antes de imprimir.
// "bloqueio" impede a impressão; "aviso" só informa.

import type { MedicamentoReceita, TipoReceita } from '../store/useReceitaStore';
import { classificarTextoLivre, REGRAS_MODELO } from '../data/regrasReceita';
import { pendenciasPrescritor, type Prescritor } from '../config/prescritor';
import { lerQuantidade } from './porExtenso';
import { infoDoMedicamento, itemNaoCabeNaVia, type DocumentoReceita } from './agruparReceita';

export interface Pendencia {
  nivel: 'bloqueio' | 'aviso';
  texto: string;
}

export interface DadosPaciente {
  pacienteNome: string;
  pacienteCpf: string;
  pacienteSemCpf: boolean;
  pacienteIdade: string;
  pacienteSexo: string;
  pacienteEndereco: string;
}

/** Duração em dias a partir de "30 dias", "8 semanas", "3 meses". null se não der para ler. */
export function duracaoEmDias(duracao: string): number | null {
  const m = (duracao || '').toLowerCase().match(/(\d+)\s*(dia|semana|m[eê]s|meses)/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (m[2].startsWith('dia')) return n;
  if (m[2].startsWith('semana')) return n * 7;
  return n * 30;
}

const nomeMed = (m: MedicamentoReceita) => (m.principioAtivo || m.nomeDigitado).trim();
const POSOLOGIA_VAGA = /conforme orienta|a crit[eé]rio|uso conforme|s\/n$|^se necess[aá]rio$/i;

/** Regras por item que valem em receita de 2 vias (antimicrobiano e controle especial). */
function validarItem(m: MedicamentoReceita, modelo: DocumentoReceita['modelo'], p: Pendencia[]) {
  const nome = nomeMed(m);
  if (!lerQuantidade(m.quantidade)) {
    p.push({ nivel: 'bloqueio', texto: `${nome}: a quantidade precisa começar com número (ex.: "30 comprimidos").` });
  }
  if (!m.posologia.trim() || POSOLOGIA_VAGA.test(m.posologia.trim())) {
    p.push({ nivel: 'bloqueio', texto: `${nome}: escreva a posologia completa. "Conforme orientação médica" é motivo de recusa.` });
  }
  if (itemNaoCabeNaVia(m, modelo)) {
    p.push({ nivel: 'bloqueio', texto: `${nome}: posologia e orientações longas demais para a meia folha — o texto seria cortado no papel. Encurte a orientação.` });
  }
  if (modelo !== 'RCE') return;

  const info = infoDoMedicamento(m);
  const limite = info.ate6Meses ? 180 : 60;
  const dias = duracaoEmDias(m.duracao);
  if (dias !== null && dias > limite && !m.justificativaLimite?.trim()) {
    p.push({
      nivel: 'bloqueio',
      texto: `${nome}: ${dias} dias passa do limite de ${info.ate6Meses ? '6 meses' : '60 dias'} da Receita de Controle Especial. Preencha a justificativa com CID (Port. 344, art. 60) ou reduza a quantidade.`,
    });
  }
  if (/cont[ií]nuo/i.test(m.duracao) && !dias) {
    p.push({
      nivel: 'aviso',
      texto: `${nome}: "uso contínuo" não define período. A receita vale 30 dias e cobre no máximo ${info.ate6Meses ? '6 meses' : '60 dias'} — confira se a quantidade respeita isso.`,
    });
  }
}

export function validarReceita(
  documentos: DocumentoReceita[],
  paciente: DadosPaciente,
  prescritor: Prescritor,
  modoTexto?: { texto: string; tipo: TipoReceita }
): Pendencia[] {
  const p: Pendencia[] = [];
  if (!paciente.pacienteNome.trim()) p.push({ nivel: 'bloqueio', texto: 'Informe o nome completo do paciente.' });

  const modelos = new Set(documentos.map((d) => d.modelo));
  const temRetencao = modelos.has('RETENCAO');
  const temRce = modelos.has('RCE');
  const notificacoes = documentos.filter((d) => !REGRAS_MODELO[d.modelo].imprimeReceita);

  if (temRetencao || temRce) {
    const faltam = pendenciasPrescritor(prescritor);
    if (faltam.length) {
      p.push({
        nivel: 'bloqueio',
        texto: `Complete seus dados de prescritor (${faltam.join(', ')}). Endereço completo e telefone do médico são obrigatórios na receita de antimicrobiano e na de controle especial.`,
      });
    }
  }

  const antimicrobiano = documentos.some((d) => d.modelo === 'RETENCAO' && !d.soGlp1);
  if (antimicrobiano) {
    if (!paciente.pacienteIdade.trim()) p.push({ nivel: 'bloqueio', texto: 'Antimicrobiano: informe a idade do paciente (RDC 471/2021).' });
    if (!paciente.pacienteSexo) p.push({ nivel: 'bloqueio', texto: 'Antimicrobiano: informe o sexo do paciente (RDC 471/2021).' });
  }

  if (temRce || notificacoes.length) {
    if (!paciente.pacienteEndereco.trim()) {
      p.push({
        nivel: temRce ? 'bloqueio' : 'aviso',
        texto: 'Controlado: informe o endereço completo do paciente.',
      });
    }
    if (!paciente.pacienteCpf.replace(/\D/g, '') && !paciente.pacienteSemCpf) {
      p.push({
        nivel: temRce ? 'bloqueio' : 'aviso',
        texto: 'Controlado: informe o CPF do paciente ou marque "Não possui CPF".',
      });
    }
  }

  for (const doc of documentos) {
    if (doc.modelo === 'RETENCAO' || doc.modelo === 'RCE') {
      doc.medicamentos.forEach((m) => validarItem(m, doc.modelo, p));
    }
    doc.medicamentos.forEach((m, i) => {
      const info = doc.infos[i];
      if (info?.naoConfirmada && info.modelo !== 'SIMPLES') {
        p.push({ nivel: 'aviso', texto: `${nomeMed(m)}: classificado como ${info.lista} pela IA — o nome não está na tabela. Confira a lista antes de imprimir.` });
      } else if (info?.naoConfirmada) {
        p.push({ nivel: 'aviso', texto: `${nomeMed(m)}: nome fora da tabela de controle. Vai na receita simples — use o botão IA ou confira se não é controlado/antimicrobiano.` });
      }
    });
  }

  for (const doc of notificacoes) {
    const regra = REGRAS_MODELO[doc.modelo];
    p.push({
      nivel: 'aviso',
      texto: `${nomeMed(doc.medicamentos[0])} (${doc.infos[0].lista}) não sai como receita: prescreva na ${regra.talonario}, talonário numerado. A guia de transcrição sai junto, marcada "NÃO É RECEITA".`,
    });
  }

  if (modoTexto) validarTextoLivre(modoTexto.texto, modoTexto.tipo, p);

  return p;
}

function validarTextoLivre(texto: string, tipo: TipoReceita, p: Pendencia[]) {
  const achados = classificarTextoLivre(texto);
  const notif = achados.filter((a) => !REGRAS_MODELO[a.info.modelo].imprimeReceita);
  const rce = achados.filter((a) => a.info.modelo === 'RCE');
  const retencao = achados.filter((a) => a.info.modelo === 'RETENCAO');
  const trecho = (a: { linha: string }) => `"${a.linha.slice(0, 40)}"`;

  for (const a of notif) {
    p.push({
      nivel: 'bloqueio',
      texto: `${trecho(a)} é lista ${a.info.lista}: exige ${REGRAS_MODELO[a.info.modelo].talonario}. Retire do texto e use o modo estruturado para gerar a guia.`,
    });
  }
  if (tipo === 'SIMPLES' && (rce.length || retencao.length)) {
    p.push({ nivel: 'bloqueio', texto: `O texto tem ${[...rce, ...retencao].map(trecho).join(', ')}: escolha o tipo de receita correto acima.` });
  }
  if (tipo === 'RETENCAO' && rce.length) {
    p.push({ nivel: 'bloqueio', texto: `Controlado não pode ir na receita de antimicrobiano (RDC 471, art. 8º): ${rce.map(trecho).join(', ')}.` });
  }
  if (tipo === 'ESPECIAL' && retencao.length) {
    p.push({ nivel: 'bloqueio', texto: `Antimicrobiano não pode ir na Receita de Controle Especial (RDC 471, art. 8º): ${retencao.map(trecho).join(', ')}.` });
  }
  if (tipo === 'ESPECIAL' && rce.length > 3) {
    p.push({ nivel: 'bloqueio', texto: 'A Receita de Controle Especial aceita no máximo 3 substâncias (Port. 344, art. 57). Use o modo estruturado, que divide automaticamente.' });
  }
  if (tipo !== 'SIMPLES') {
    p.push({ nivel: 'aviso', texto: 'Texto livre: confira se cada item tem quantidade em número e por extenso e posologia completa.' });
  }
}
