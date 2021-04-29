export interface Note {
  id: string;
  content: string;
}

export interface SavableNote {
  id?: string;
  content: string;
}

export interface NoteApi {
  save: (note: SavableNote) => Promise<string>;
  delete: (id: string) => Promise<void>;
}
