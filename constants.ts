import { NoteName } from './types';

export const NOTES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const STRINGS: NoteName[] = ['E', 'B', 'G', 'D', 'A', 'E']; // High E (string 1) to Low E (string 6)

export const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

export const SCALES = {
  MAJOR: [0, 2, 4, 5, 7, 9, 11],
  MINOR: [0, 2, 3, 5, 7, 8, 10],
  PENTATONIC_MINOR: [0, 3, 5, 7, 10],
  PENTATONIC_MAJOR: [0, 2, 4, 7, 9],
  BLUES: [0, 3, 5, 6, 7, 10],
};

// Helper to get notes of a scale
export const getScaleNotes = (root: NoteName, intervals: number[]): NoteName[] => {
  const rootIndex = NOTES.indexOf(root);
  return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
};