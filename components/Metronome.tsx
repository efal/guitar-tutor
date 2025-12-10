import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Minus, Plus } from 'lucide-react';

const Metronome: React.FC = () => {
  const [bpm, setBpm] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Refs for audio timing
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const timerIDRef = useRef<number | null>(null);
  const bpmRef = useRef(bpm);

  const lookahead = 25.0; // milliseconds
  const scheduleAheadTime = 0.1; // seconds

  // Keep bpmRef in sync
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  const playClick = useCallback((time: number) => {
    if (!audioContextRef.current) return;
    
    const osc = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    osc.frequency.value = 1000;
    gainNode.gain.setValueAtTime(1, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.start(time);
    osc.stop(time + 0.05);
  }, []);

  const nextNote = useCallback(() => {
    const secondsPerBeat = 60.0 / bpmRef.current;
    nextNoteTimeRef.current += secondsPerBeat;
  }, []);

  const scheduler = useCallback(() => {
    if (!audioContextRef.current) return;

    // While there are notes that will need to play before the next interval, 
    // schedule them and advance the pointer.
    while (nextNoteTimeRef.current < audioContextRef.current.currentTime + scheduleAheadTime) {
      playClick(nextNoteTimeRef.current);
      nextNote();
    }
    timerIDRef.current = window.setTimeout(scheduler, lookahead);
  }, [nextNote, playClick]);

  const togglePlay = () => {
    if (isPlaying) {
      if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
      setIsPlaying(false);
    } else {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      // Resume context if suspended (browser policy)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      // If nextNoteTime is in the past, reset it to now
      if (nextNoteTimeRef.current < audioContextRef.current.currentTime) {
         nextNoteTimeRef.current = audioContextRef.current.currentTime + 0.05;
      }
      
      setIsPlaying(true);
      scheduler();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 shadow-xl flex flex-col items-center space-y-6 w-full max-w-sm mx-auto">
        <h2 className="text-xl font-bold text-wood-300 uppercase tracking-widest">Metronome</h2>
        
        <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-wood-500 bg-zinc-900 shadow-[0_0_20px_rgba(184,126,77,0.2)]">
            <span className="text-4xl font-mono font-bold text-white">{bpm}</span>
            <span className="absolute bottom-6 text-xs text-zinc-500 font-bold uppercase">BPM</span>
        </div>

        <div className="flex items-center space-x-4 w-full justify-center">
            <button 
                onClick={() => setBpm(b => Math.max(40, b - 5))}
                className="p-3 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
            >
                <Minus size={20} />
            </button>
            
            <button 
                onClick={togglePlay}
                className={`p-6 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                    isPlaying 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/50' 
                    : 'bg-wood-500 hover:bg-wood-400 text-zinc-900 shadow-wood-900/50'
                }`}
            >
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>

            <button 
                onClick={() => setBpm(b => Math.min(240, b + 5))}
                className="p-3 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
            >
                <Plus size={20} />
            </button>
        </div>

        <input 
            type="range" 
            min="40" 
            max="240" 
            value={bpm} 
            onChange={(e) => setBpm(parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-wood-500"
        />
        <div className="flex justify-between w-full text-xs text-zinc-500 font-mono">
            <span>40</span>
            <span>240</span>
        </div>
    </div>
  );
};

export default Metronome;