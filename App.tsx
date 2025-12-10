import * as React from 'react';
import { useState } from 'react';
import { Layout, Music, MessageSquare, ListMusic, Gauge, Guitar } from 'lucide-react';
import Fretboard from './components/Fretboard';
import Metronome from './components/Metronome';
import PracticePlanner from './components/PracticePlanner';
import AICoach from './components/AICoach';
import { View, NoteName } from './types';
import { SCALES, getScaleNotes, NOTES } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  // Fretboard State
  const [selectedRoot, setSelectedRoot] = useState<NoteName>('C');
  const [selectedScaleType, setSelectedScaleType] = useState<keyof typeof SCALES>('MAJOR');
  
  const activeNotes = React.useMemo(() => {
    return getScaleNotes(selectedRoot, SCALES[selectedScaleType]);
  }, [selectedRoot, selectedScaleType]);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Welcome Card */}
                 <div className="bg-gradient-to-br from-wood-600 to-wood-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Guitar size={150} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Ready to shred?</h1>
                    <p className="text-wood-100 mb-6 max-w-xs">Your personal tutor is ready. Start a new practice routine or explore music theory today.</p>
                    <button 
                        onClick={() => setCurrentView('practice')}
                        className="bg-white text-wood-900 px-6 py-2 rounded-lg font-bold hover:bg-wood-50 transition-colors shadow-lg"
                    >
                        Start Practicing
                    </button>
                 </div>

                 {/* Quick Tools */}
                 <div className="bg-zinc-800 rounded-2xl p-8 border border-zinc-700 shadow-xl flex flex-col justify-center items-center">
                    <h2 className="text-xl font-bold text-zinc-200 mb-6">Quick Metronome</h2>
                    <Metronome />
                 </div>
             </div>

             {/* Recent/Stats Area - Placeholder for V1 */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2">
                     <AICoach />
                 </div>
                 <div className="bg-zinc-800 rounded-2xl p-6 border border-zinc-700">
                     <h3 className="text-zinc-400 font-bold uppercase text-xs tracking-wider mb-4">Daily Tip</h3>
                     <p className="text-zinc-300 italic">"Slow is smooth, and smooth is fast. Don't rush your scales; accuracy builds speed naturally."</p>
                     <div className="mt-4 pt-4 border-t border-zinc-700">
                         <h4 className="text-wood-500 font-bold text-sm mb-2">Recommended Scale</h4>
                         <div className="flex items-center gap-2 text-zinc-200">
                            <span className="w-8 h-8 rounded bg-zinc-700 flex items-center justify-center font-bold">A</span>
                            <span>Minor Pentatonic</span>
                         </div>
                         <button 
                            onClick={() => {
                                setSelectedRoot('A');
                                setSelectedScaleType('PENTATONIC_MINOR');
                                setCurrentView('theory');
                            }}
                            className="mt-3 text-sm text-wood-400 hover:text-wood-300 underline"
                        >
                            View on Fretboard
                         </button>
                     </div>
                 </div>
             </div>
          </div>
        );
      case 'practice':
        return <PracticePlanner />;
      case 'theory':
        return (
            <div className="space-y-8 h-full flex flex-col">
                <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 shadow-xl">
                    <div className="flex flex-wrap gap-6 items-end mb-6">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Root Note</label>
                            <div className="flex gap-1 flex-wrap">
                                {NOTES.map(note => (
                                    <button
                                        key={note}
                                        onClick={() => setSelectedRoot(note)}
                                        className={`w-8 h-8 rounded text-sm font-bold transition-all ${
                                            selectedRoot === note 
                                            ? 'bg-wood-500 text-white shadow-lg scale-110' 
                                            : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                                        }`}
                                    >
                                        {note}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Scale Type</label>
                            <select 
                                value={selectedScaleType}
                                onChange={(e) => setSelectedScaleType(e.target.value as keyof typeof SCALES)}
                                className="w-full bg-zinc-700 border-none rounded-lg p-2 text-white focus:ring-2 focus:ring-wood-500 outline-none"
                            >
                                {Object.keys(SCALES).map(s => (
                                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <Fretboard 
                        highlightNotes={activeNotes} 
                        rootNote={selectedRoot} 
                        className="w-full overflow-x-auto py-8"
                    />
                    
                    <div className="mt-6 p-4 bg-zinc-900/50 rounded-lg border border-zinc-700/50">
                        <h4 className="text-zinc-400 text-sm font-bold mb-2">Notes in Scale</h4>
                        <div className="flex gap-2">
                            {activeNotes.map((n, i) => (
                                <span key={i} className={`px-3 py-1 rounded-full text-sm font-mono ${n === selectedRoot ? 'bg-wood-600 text-white' : 'bg-zinc-700 text-zinc-300'}`}>
                                    {n}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Mini Theory Tutor */}
                <div className="flex-1 min-h-[400px]">
                    <AICoach />
                </div>
            </div>
        );
      case 'tools':
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-8">
                <Metronome />
                <div className="text-center text-zinc-500 max-w-md">
                    <p>More tools like Tuner and Chord Library coming soon in updates.</p>
                </div>
            </div>
        );
      default:
        return <div>Not Found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-900 text-zinc-100 font-sans selection:bg-wood-500 selection:text-white">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 flex-shrink-0 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between transition-all duration-300">
        <div>
            <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-zinc-800">
                <Guitar className="text-wood-500 w-8 h-8" />
                <span className="ml-3 font-bold text-xl tracking-tight hidden lg:block text-white">
                    Strum<span className="text-wood-500">AI</span>
                </span>
            </div>

            <nav className="p-4 space-y-2">
                {[
                    { id: 'dashboard', icon: Layout, label: 'Dashboard' },
                    { id: 'practice', icon: ListMusic, label: 'Practice Plan' },
                    { id: 'theory', icon: Music, label: 'Theory & Scales' },
                    { id: 'tools', icon: Gauge, label: 'Tools' },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id as View)}
                        className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${
                            currentView === item.id 
                            ? 'bg-wood-600 text-white shadow-lg shadow-wood-900/40' 
                            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                        }`}
                    >
                        <item.icon size={22} className={`${currentView === item.id ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                        <span className="ml-3 font-medium hidden lg:block">{item.label}</span>
                        {currentView === item.id && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white hidden lg:block animate-pulse" />
                        )}
                    </button>
                ))}
            </nav>
        </div>
        
        <div className="p-4 border-t border-zinc-800 hidden lg:block">
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                <p className="text-xs text-zinc-500 leading-relaxed">
                    Offline Mode Enabled. <br/>
                    <span className="text-wood-500 font-bold">Practice daily.</span> 
                </p>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col">
          <header className="h-20 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-8 z-10">
               <h2 className="text-xl font-semibold text-zinc-200 capitalize flex items-center gap-2">
                   {currentView === 'dashboard' && <Layout size={20} className="text-wood-500" />}
                   {currentView === 'practice' && <ListMusic size={20} className="text-wood-500" />}
                   {currentView === 'theory' && <Music size={20} className="text-wood-500" />}
                   {currentView === 'tools' && <Gauge size={20} className="text-wood-500" />}
                   {currentView}
               </h2>
               <div className="flex items-center gap-4">
                   {/* Status indicators removed for offline version */}
               </div>
          </header>
          
          <div className="flex-1 overflow-auto p-4 lg:p-8 bg-zinc-900 scroll-smooth">
              <div className="max-w-7xl mx-auto h-full">
                {renderContent()}
              </div>
          </div>
      </main>
    </div>
  );
};

export default App;