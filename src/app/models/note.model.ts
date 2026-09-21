export interface Note {
  id?: number;
  assunto: string;
  resumo: string;
  categoria?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export type NotePayload = Pick<Note, 'assunto' | 'resumo' | 'categoria'>;
