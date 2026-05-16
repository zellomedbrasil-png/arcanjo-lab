export type Convenio = 'IPM' | 'ISSEC' | 'PARTICULAR';
export type Genero = 'M' | 'F';
export type TipoGuia =
  | 'LABORATORIO'
  | 'ECOCARDIOGRAMA' | 'ECODOPPLER' | 'MAPA' | 'HOLTER' | 'ECG'
  | 'US_ABD_TOTAL' | 'US_PELVICO' | 'US_TRANSVAGINAL' | 'US_PROSTATA' | 'US_TIREOIDE' | 'US_VIAS_BILIARES'
  | 'EDA' | 'COLONOSCOPIA' | 'RETOSSIGMOIDOSCOPIA'
  | 'RX_TORAX' | 'RX_COLUNA' | 'TC_ABD' | 'TC_CRANIO' | 'RM_ABD' | 'RM_CRANIO' | 'DENSITOMETRIA';

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
