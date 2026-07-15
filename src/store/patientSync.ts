import { useRecentPatientsStore, type PacienteRecente } from './useRecentPatientsStore';

export interface PatientSyncData {
  pacienteNome?: string;
  pacienteCpf?: string;
  pacienteIdade?: string;
  numeroBeneficiario?: string;
  genero?: 'M' | 'F';
  convenio?: 'IPM' | 'ISSEC' | 'SADT' | 'PARTICULAR';
  pacienteEndereco?: string;
  pacienteCep?: string;
  pacienteCidade?: string;
  pacienteUf?: string;
  pacienteTelefone?: string;
  pacienteDataNascimento?: string;
}

type SyncListener = (senderId: string, data: PatientSyncData) => void;

const listeners = new Set<SyncListener>();

export function subscribePatientSync(listener: SyncListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function publishPatientSync(senderId: string, data: PatientSyncData) {
  listeners.forEach((listener) => {
    try {
      listener(senderId, data);
    } catch (err) {
      console.error('Error in patient sync listener:', err);
    }
  });
}

/**
 * Saves/updates a patient in the recent patients history (useRecentPatientsStore).
 */
export function savePatientToHistory(paciente: Omit<PacienteRecente, 'updatedAt'>) {
  if (!paciente.nome || paciente.nome.trim().length < 3) return;
  useRecentPatientsStore.getState().adicionarPaciente(paciente);
}
