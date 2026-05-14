-- Enums
CREATE TYPE convenio_type AS ENUM ('IPM', 'ISSEC');
CREATE TYPE genero_type AS ENUM ('M', 'F');

-- Tabela de Médicos (Estende auth.users)
CREATE TABLE medicos (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nome TEXT NOT NULL,
  crm TEXT NOT NULL,
  numero_credenciamento_ipm TEXT,
  numero_credenciamento_issec TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Solicitações
CREATE TABLE solicitacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medico_id UUID NOT NULL REFERENCES medicos(id),
  paciente_nome TEXT NOT NULL,
  paciente_matricula TEXT NOT NULL,
  nascimento DATE NOT NULL,
  genero genero_type NOT NULL,
  telefone TEXT,
  convenio convenio_type NOT NULL,
  exames_selecionados JSONB NOT NULL DEFAULT '[]',
  soap_gerado TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Médicos podem ver seus próprios dados" 
  ON medicos FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Médicos podem ver suas solicitações" 
  ON solicitacoes FOR SELECT USING (auth.uid() = medico_id);

CREATE POLICY "Médicos podem criar suas solicitações" 
  ON solicitacoes FOR INSERT WITH CHECK (auth.uid() = medico_id);
