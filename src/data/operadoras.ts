export interface Operadora {
  nome: string;
  registroAns: string;
  grupo: 'Nacional' | 'Regional';
}

export const OPERADORAS: Operadora[] = [
  // Nacional
  { nome: 'Amil',                       registroAns: '326305', grupo: 'Nacional' },
  { nome: 'Bradesco Saúde',             registroAns: '005711', grupo: 'Nacional' },
  { nome: 'SulAmérica Saúde',           registroAns: '006246', grupo: 'Nacional' },
  { nome: 'Notre Dame Intermédica',     registroAns: '359017', grupo: 'Nacional' },
  { nome: 'Central Nacional Unimed',    registroAns: '339679', grupo: 'Nacional' },
  { nome: 'Seguros Unimed',             registroAns: '000701', grupo: 'Nacional' },
  { nome: 'Porto Seguro Saúde',         registroAns: '000582', grupo: 'Nacional' },
  { nome: 'Cassi',                      registroAns: '346659', grupo: 'Nacional' },
  { nome: 'Omint',                      registroAns: '359661', grupo: 'Nacional' },
  { nome: 'Prevent Senior',             registroAns: '302147', grupo: 'Nacional' },
  // Regional (CE)
  { nome: 'Hapvida',                    registroAns: '368253', grupo: 'Regional' },
  { nome: 'Unimed Fortaleza',           registroAns: '317144', grupo: 'Regional' },
  { nome: 'Camed',                      registroAns: '387061', grupo: 'Regional' },
  { nome: 'Camed BNB',                  registroAns: '385697', grupo: 'Regional' },
  { nome: 'Liv Saúde',                  registroAns: '418374', grupo: 'Regional' },
];
