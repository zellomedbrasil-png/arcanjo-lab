export type Convenio = 'IPM' | 'ISSEC' | 'PARTICULAR' | 'SADT';
export type Genero = 'M' | 'F';

export interface ConsultaGravada {
  nome: string;
  queixa: string;
  data: string;
}

export type TipoGuia =
  | 'LABORATORIO'
  // Cardiologia
  | 'ECOCARDIOGRAMA' | 'ECODOPPLER' | 'MAPA' | 'HOLTER' | 'ECG'
  | 'TEST_ERGOMETRICO' | 'ANGIOTC_CORONARIA' | 'ECOSTRESS' | 'DOPPLER_MEMBROS'
  // Ultrassonografia
  | 'US_ABD_TOTAL' | 'US_PELVICO' | 'US_TRANSVAGINAL' | 'US_PROSTATA' | 'US_TIREOIDE' | 'US_VIAS_BILIARES'
  | 'US_MAMA_BILATERAL' | 'US_PARTES_MOLES' | 'US_RENAL' | 'US_DOPPLER_CAROTIDAS'
  // Endoscopia
  | 'EDA' | 'COLONOSCOPIA' | 'RETOSSIGMOIDOSCOPIA' | 'EDA_BIOPSIA_HPYLORI' | 'COLONOSCOPIA_BIOPSIA' | 'PHMETRIA_ESOFAGICA' | 'MANOMETRIA_ESOFAGICA' | 'RETOSSIGMOIDOSCOPIA_BIOPSIA' | 'ECOENDOSCOPIA'
  // Gastroenterologia funcional (testes respiratórios — exigem agendamento)
  | 'TESTE_H2_LACTULOSE' | 'TESTE_H2_GLICOSE' | 'TESTE_H2_LACTOSE'
  // Imagem (Rx / TC / RM)
  | 'RX_TORAX' | 'RX_COLUNA' | 'TC_ABD' | 'TC_CRANIO' | 'RM_ABD' | 'RM_CRANIO' | 'DENSITOMETRIA'
  | 'TC_TORAX' | 'RM_COLUNA' | 'RM_JOELHO' | 'RM_OMBRO' | 'RX_BACIA' | 'CINTILOGRAFIA_OSSEA' | 'PET_CT'
  // Mastologia
  | 'MAMOGRAFIA' | 'MAMOGRAFIA_BILATERAL' | 'US_MAMA_UNILATERAL'
  // Geriatria / Funcionais
  | 'POLISSONOGRAFIA' | 'DOPPLER_TRANSCRANIANO' | 'ELETRONEUROMIOGRAFIA' | 'AUDIOMETRIA' | 'ESPIROMETRIA' | 'EEG_MAPEAMENTO'
  // Preventivo / Ginecologia
  | 'CITOLOGIA_CERVICAL' | 'COLPOSCOPIA' | 'HISTEROSCOPIA'
  // Urologia
  | 'UROFLUXOMETRIA' | 'URODINAMICA';

export interface Paciente {
  nome: string;
  genero: Genero;
  convenio: Convenio;
  cpf?: string;
  dataNascimento?: string;
  matriculaIpm?: string;
  cartaoIssec?: string;
  telefone?: string;
}

export interface Medico {
  id: string;
  nome: string;
  crm: string;
  numero_credenciamento_ipm?: string;
  numero_credenciamento_issec?: string;
}

export interface Solicitacao {
  id?: string;
  medico_id: string;
  paciente_nome: string;
  genero: Genero;
  convenio: Convenio;
  tipo_guia: TipoGuia;
  exames_selecionados: string[]; // Agora são blocos de texto por linha
  soap_gerado?: string;
  created_at?: string;
}

export * from '../data/exames';
