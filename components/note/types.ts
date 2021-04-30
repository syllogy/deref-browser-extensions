export interface Note {
  id: string;
  body: string;
}

export interface SavableNote {
  id?: string;
  body: string;
}

export interface NoteApi {
  save: (note: SavableNote) => Promise<void>;
}
