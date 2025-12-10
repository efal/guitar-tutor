import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { generatePracticeRoutine } from '../services/gemini';
import { PracticeRoutine } from '../types';
import { Loader2, PlayCircle, Clock, CheckCircle, Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

const PracticePlanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [routine, setRoutine] = useState<PracticeRoutine | null>(null);
  
  // Form State
  const [level, setLevel] = useState('Intermediate');
  const [duration, setDuration] = useState(15);
  const [focus, setFocus] = useState('Scales & Speed');

  // Timer State
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (routine) {
      setTimeLeft(routine.totalDuration * 60);
      setIsActive(false);
      setIsFinished(false);
    }
  }, [routine]);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
      playAlarm();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const playAlarm = () => {
     try {
         if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
         }
         const ctx = audioContextRef.current;
         if (ctx.state === 'suspended') ctx.resume();
         
         const osc = ctx.createOscillator();
         const gain = ctx.createGain();
         
         osc.connect(gain);
         gain.connect(ctx.destination);
         
         // Pleasant chime sound
         osc.type = 'sine';
         osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
         osc.frequency.linearRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
         
         gain.gain.setValueAtTime(0, ctx.currentTime);
         gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
         gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
         
         osc.start(ctx.currentTime);
         osc.stop(ctx.currentTime + 1.5);
     } catch (e) {
         console.error("Audio play failed", e);
     }
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setIsFinished(false);
    if (routine) setTimeLeft(routine.totalDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generatePracticeRoutine(level, duration, focus);
      setRoutine(data);
    } catch (e) {
      alert("Failed to generate routine. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = routine ? ((routine.totalDuration * 60 - timeLeft) / (routine.totalDuration * 60)) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Configuration Panel */}
      <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 h-fit">
        <h2 className="text-xl font-bold text-wood-100 mb-6 flex items-center gap-2">
           <PlayCircle className="text-wood-500" /> 
           Routine Builder
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Skill Level</label>
            <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                    <button
                        key={l}
                        onClick={() => setLevel(l)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            level === l 
                            ? 'bg-wood-600 text-white shadow-lg shadow-wood-900/50' 
                            : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                        }`}
                    >
                        {l}
                    </button>
                ))}
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-zinc-400 mb-2">Duration (Minutes)</label>
             <input 
                type="range" 
                min="5" 
                max="60" 
                step="5" 
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-wood-500"
             />
             <div className="text-right text-wood-400 font-mono mt-1">{duration} mins</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Focus Area</label>
            <select 
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="w-full bg-zinc-700 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-wood-500 outline-none"
            >
                <option>Chords & Strumming</option>
                <option>Scales & Speed</option>
                <option>Music Theory</option>
                <option>Improvisation</option>
                <option>Ear Training</option>
                <option>Song Learning</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-wood-600 to-wood-500 hover:from-wood-500 hover:to-wood-400 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Generate Plan"}
          </button>
        </div>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-2 space-y-4">
        {!routine && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-800/50 rounded-xl border border-dashed border-zinc-700 p-12">
                <Clock size={48} className="mb-4 opacity-50" />
                <p>Configure your preferences and hit Generate to start practicing.</p>
            </div>
        )}

        {loading && (
             <div className="h-full flex flex-col items-center justify-center text-wood-500 space-y-4">
                <Loader2 size={48} className="animate-spin" />
                <p className="text-zinc-400 animate-pulse">Consulting the AI maestro...</p>
            </div>
        )}

        {routine && !loading && (
            <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
                <div className="bg-zinc-800 p-6 border-b border-zinc-700 flex justify-between items-center relative overflow-hidden">
                    <div className="z-10">
                        <h3 className="text-2xl font-bold text-white">{routine.title}</h3>
                        <p className="text-zinc-400 text-sm">Total Time: {routine.totalDuration} minutes</p>
                    </div>
                    <div className="z-10 px-4 py-1 bg-wood-900/50 border border-wood-700/50 text-wood-400 text-xs rounded-full uppercase tracking-wider">
                        AI Generated
                    </div>
                </div>

                {/* Timer Control Bar */}
                <div className="bg-zinc-950 p-4 border-b border-zinc-800 sticky top-0 z-20 shadow-md">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Session Timer</span>
                                <div className={`text-4xl font-mono font-bold tabular-nums leading-none ${timeLeft < 60 && timeLeft > 0 ? 'text-red-500 animate-pulse' : 'text-wood-100'}`}>
                                    {formatTime(timeLeft)}
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={toggleTimer}
                                    className={`p-3 rounded-full transition-all ${isActive ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-wood-600 text-white hover:bg-wood-500 shadow-lg shadow-wood-900/50'}`}
                                >
                                    {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                                </button>
                                <button 
                                    onClick={resetTimer}
                                    className="p-3 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all"
                                    title="Reset Timer"
                                >
                                    <RotateCcw size={20} />
                                </button>
                            </div>
                         </div>
                         
                         {isFinished ? (
                             <div className="flex items-center gap-2 text-green-500 bg-green-900/20 px-4 py-2 rounded-lg border border-green-900/50 animate-pulse">
                                 <CheckCircle size={20} />
                                 <span className="font-bold">Session Complete!</span>
                             </div>
                         ) : (
                             <div className="hidden sm:block text-zinc-600">
                                 <Volume2 size={20} />
                             </div>
                         )}
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-4 overflow-hidden">
                        <div 
                            className="h-full bg-wood-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
                
                <div className="divide-y divide-zinc-800 max-h-[500px] overflow-y-auto">
                    {routine.items.map((item, index) => (
                        <div key={index} className="p-6 hover:bg-zinc-800/50 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-wood-500 group-hover:bg-wood-600 group-hover:text-white transition-colors">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <h4 className="font-bold text-lg text-zinc-200">{item.title}</h4>
                                        <span className="text-sm font-mono text-wood-400 whitespace-nowrap flex items-center gap-1">
                                            <Clock size={14} /> {item.durationMinutes}m
                                        </span>
                                    </div>
                                    <p className="text-zinc-400 text-sm leading-relaxed">{item.description}</p>
                                    <div className="mt-3 inline-block px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-500 uppercase font-bold tracking-wider">
                                        {item.category}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-zinc-800/50 border-t border-zinc-700 flex justify-end">
                    <button onClick={() => setRoutine(null)} className="text-zinc-400 hover:text-white text-sm">Clear Routine</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PracticePlanner;