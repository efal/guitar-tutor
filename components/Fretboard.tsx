import * as React from 'react';
import { useMemo } from 'react';
import { NOTES, STRINGS, FRET_MARKERS } from '../constants';
import { NoteName } from '../types';

interface FretboardProps {
  highlightNotes?: NoteName[];
  rootNote?: NoteName;
  className?: string;
}

const Fretboard: React.FC<FretboardProps> = ({ highlightNotes = [], rootNote, className = '' }) => {
  const fretCount = 15; // Display 15 frets

  const stringNotes = useMemo(() => {
    return STRINGS.map((openStringNote) => {
      const startIndex = NOTES.indexOf(openStringNote);
      const notesOnString: { note: NoteName; fret: number }[] = [];
      for (let i = 0; i <= fretCount; i++) {
        const noteIndex = (startIndex + i) % 12;
        notesOnString.push({ note: NOTES[noteIndex], fret: i });
      }
      return notesOnString;
    });
  }, []);

  return (
    <div className={`overflow-x-auto pb-4 ${className}`}>
        <div className="inline-block min-w-[800px] select-none bg-fretboard-dark p-4 rounded-lg shadow-2xl border-4 border-wood-800 relative">
            {/* Frets rendering */}
            <div className="absolute top-4 bottom-4 left-12 right-4 flex pointer-events-none">
                {Array.from({ length: fretCount }).map((_, i) => (
                    <div key={i} className="flex-1 border-r-2 border-zinc-500 relative flex justify-center h-full">
                         {/* Fret Markers (Inlays) */}
                         {FRET_MARKERS.includes(i + 1) && (
                            <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-fretboard-inlay opacity-80 shadow-inner ${ (i+1) === 12 || (i+1) === 24 ? 'hidden' : '' }`} />
                         )}
                         {/* Double Inlay for 12th and 24th fret */}
                         {((i+1) === 12 || (i+1) === 24) && (
                             <div className="absolute top-1/2 -translate-y-1/2 flex flex-col gap-8">
                                 <div className="w-4 h-4 rounded-full bg-fretboard-inlay opacity-80 shadow-inner" />
                                 <div className="w-4 h-4 rounded-full bg-fretboard-inlay opacity-80 shadow-inner" />
                             </div>
                         )}
                         
                         {/* Fret Number */}
                         <span className="absolute -bottom-8 text-zinc-500 text-xs font-mono">
                             {i + 1}
                         </span>
                    </div>
                ))}
            </div>

            {/* Nut */}
            <div className="absolute top-4 bottom-4 left-10 w-2 bg-wood-200 shadow-lg z-10"></div>

            {/* Strings */}
            <div className="flex flex-col justify-between h-[200px] relative z-20 pl-2">
                {stringNotes.map((stringData, sIndex) => (
                    <div key={sIndex} className="relative flex items-center h-full">
                         {/* String Line */}
                        <div 
                            className="absolute left-0 right-0 bg-gradient-to-r from-zinc-300 to-zinc-500 shadow-sm" 
                            style={{ height: `${Math.max(1, 4 - sIndex * 0.5)}px` }} // Thicker low strings
                        ></div>

                        {/* Notes */}
                        <div className="flex w-full pl-10"> {/* pl-10 aligns with nut/open strings */}
                            {stringData.map((data, fIndex) => {
                                const isHighlighted = highlightNotes.includes(data.note);
                                const isRoot = rootNote === data.note;
                                
                                return (
                                    <div key={fIndex} className="flex-1 flex justify-center items-center relative h-8">
                                        {(isHighlighted || fIndex === 0) && ( // Show open strings or highlighted
                                            <div 
                                                className={`
                                                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-all duration-300
                                                    ${fIndex === 0 ? '-ml-5' : ''} /* Adjust open string position */
                                                    ${isRoot 
                                                        ? 'bg-wood-500 text-white scale-110 ring-2 ring-wood-300 z-30' 
                                                        : isHighlighted 
                                                            ? 'bg-zinc-200 text-zinc-900 z-20' 
                                                            : 'bg-zinc-800 text-zinc-500 border border-zinc-700 opacity-50 scale-75'
                                                    }
                                                `}
                                            >
                                                {data.note}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default Fretboard;