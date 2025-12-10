import { PracticeRoutine } from "../types";

// Local Mock Service - No API Key required

export const generatePracticeRoutine = async (
  level: string,
  duration: number,
  focus: string
): Promise<PracticeRoutine> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Generate a plausible routine based on inputs
  const items = [
    {
      title: "Warm-up: Chromatics",
      durationMinutes: Math.max(2, Math.floor(duration * 0.15)),
      description: "Play chromatic scales (1-2-3-4) on each string. Focus on alternate picking and minimizing finger movement.",
      category: "warmup" as const
    },
    {
      title: `${focus} Drills`,
      durationMinutes: Math.floor(duration * 0.5),
      description: `Dedicated exercises for ${focus}. Ensure you are using a metronome starting at a comfortable speed.`,
      category: "technique" as const
    },
    {
      title: "Musical Application",
      durationMinutes: Math.floor(duration * 0.2),
      description: `Apply your ${focus} skills to a backing track or a song section you are learning.`,
      category: "repertoire" as const
    },
    {
      title: "Cool Down",
      durationMinutes: Math.max(2, Math.floor(duration * 0.15)),
      description: "Gentle finger stretches and open chord strumming to relax the hand muscles.",
      category: "cool-down" as const
    }
  ];

  // Adjust total duration to match request roughly
  const calculatedTotal = items.reduce((acc, item) => acc + item.durationMinutes, 0);

  return {
    title: `${level} ${focus} Routine`,
    totalDuration: calculatedTotal,
    items: items
  };
};

export const chatWithTutor = async (history: {role: 'user' | 'model', text: string}[], message: string): Promise<string> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 800));

  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('scale')) {
      return "Scales are fundamental! For beginners, I recommend starting with the Minor Pentatonic. Would you like to see a diagram?";
  }
  if (lowerMsg.includes('chord')) {
      return "Chords build the harmony. Make sure you're arching your fingers so you don't mute adjacent strings.";
  }
  if (lowerMsg.includes('tune') || lowerMsg.includes('tuning')) {
      return "Tuning is essential. Use the 'Tools' tab (coming soon) or an external tuner to get to E Standard (E A D G B E).";
  }

  return "I'm running in offline mode, so my AI brain is resting. Keep practicing your basics! Focus on timing and clean execution.";
};