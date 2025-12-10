export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export interface Note {
  name: NoteName;
  octave?: number;
}

export interface FretboardNote extends Note {
  stringIndex: number; // 0-5 (High E to Low E usually, or reverse)
  fret: number;
}

export interface Scale {
  root: NoteName;
  type: string; // e.g., 'Major', 'Minor Pentatonic'
  notes: NoteName[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export interface PracticeItem {
  title: string;
  durationMinutes: number;
  description: string;
  category: 'warmup' | 'technique' | 'repertoire' | 'theory' | 'cool-down';
}

export interface PracticeRoutine {
  title: string;
  totalDuration: number;
  items: PracticeItem[];
}

export type View = 'dashboard' | 'practice' | 'theory' | 'tools';