import { callGemini } from '../config/gemini';

export interface ExtractedPatientData {
  pacienteNome: string | null;
  genero: 'M' | 'F' | null;
  convenio: 'IPM' | 'ISSEC' | 'SADT' | 'PARTICULAR' | null;
  numeroBeneficiario: string | null;
  queixaLimpa: string;
}

const SYSTEM_PROMPT_EXTRACT = `Você é um assistente de inteligência artificial especializado em prontuários médicos.
Sua tarefa é analisar a transcrição de uma consulta médica (ou um áudio ditado pelo médico) e extrair os dados cadastrais do paciente e a queixa clínica de forma estruturada.

Você deve responder APENAS com um objeto JSON válido contendo as seguintes propriedades:
{
  "pacienteNome": string ou null (Nome completo do paciente se mencionado),
  "genero": "M" | "F" | null (Gênero do paciente: "M" para Masculino, "F" para Feminino. Deduza por pronomes, títulos como "Seu/Dona" ou nomes próprios),
  "convenio": "IPM" | "ISSEC" | "SADT" | "PARTICULAR" | null (Mapeie: IPM -> "IPM", ISSEC -> "ISSEC", Outros planos/operadoras/Unimed/Cassi/Bradesco/etc -> "SADT", Particular/Dinheiro -> "PARTICULAR"),
  "numeroBeneficiario": string ou null (Número da carteira, cartão ou matrícula do convênio se citado),
  "queixaLimpa": string (A queixa clínica formatada profissionalmente. Remova saudações iniciais como "bom dia", conversas informais e frases sobre gravação ou teste. Foque nos aspectos clínicos importantes.)
}

Regras:
1. Seja fiel ao áudio. Não invente dados não mencionados.
2. Retorne obrigatoriamente um JSON puro no formato especificado.
3. Se um dado não foi falado, preencha como null (exceto queixaLimpa, que deve conter a transcrição clínica limpa).
4. No campo queixaLimpa, melhore a redação clínica mas sem adicionar sintomas não informados.`;

export async function extractPatientDataFromText(transcriptionText: string): Promise<ExtractedPatientData> {
  if (!transcriptionText || !transcriptionText.trim()) {
    throw new Error('Texto de transcrição vazio.');
  }

  try {
    const response = await callGemini({
      prompt: `Analise a seguinte transcrição de consulta:\n\n"${transcriptionText}"`,
      systemInstruction: SYSTEM_PROMPT_EXTRACT,
      jsonMode: true,
    });

    console.log('[AIExtractor] Raw AI response:', response);
    const parsedData = JSON.parse(response) as ExtractedPatientData;
    return parsedData;
  } catch (err) {
    console.error('[AIExtractor] Error extracting patient data:', err);
    // Fallback in case of JSON parse error or API failure
    return {
      pacienteNome: null,
      genero: null,
      convenio: null,
      numeroBeneficiario: null,
      queixaLimpa: transcriptionText,
    };
  }
}
