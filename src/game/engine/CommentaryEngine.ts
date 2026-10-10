// Triumph League - Dynamic Dual-Voice Football Commentary Engine
// Featuring Arthur Vance (Lead Play-by-Play) & Marcus Sterling (Tactical Co-Commentator)

export interface CommentaryLine {
  id: string;
  speaker: 'Arthur Vance' | 'Marcus Sterling';
  speakerRole: 'Lead Commentator' | 'Co-Commentator';
  text: string;
  priority: number; // Higher numbers preempt lower priority lines (Goals: 10, Saves: 8, Shots: 6, Passes: 2)
  timestamp: number;
}

export type CommentaryCategory =
  | 'kickoff'
  | 'buildup_pass'
  | 'through_ball'
  | 'shot_taken'
  | 'shot_missed'
  | 'post_hit'
  | 'goalkeeper_save'
  | 'goal'
  | 'tackle'
  | 'foul'
  | 'counter_attack'
  | 'half_time'
  | 'full_time'
  | 'penalty_awarded'
  | 'corner';

class CommentaryEngine {
  private activeLine: CommentaryLine | null = null;
  private queue: CommentaryLine[] = [];
  private isMuted: boolean = false;
  private volume: number = 0.85;
  private speechSynth: SpeechSynthesis | null = null;
  private listeners: ((line: CommentaryLine | null) => void)[] = [];
  private lastTriggerTime = 0;
  private lastCategory: CommentaryCategory | null = null;
  private recentPhrases: Set<string> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechSynth = window.speechSynthesis;
    }
  }

  public subscribe(callback: (line: CommentaryLine | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.activeLine);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.activeLine));
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.volume === 0) {
      this.isMuted = true;
    } else {
      this.isMuted = false;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.speechSynth) {
      this.speechSynth.cancel();
    }
  }

  // --- Modular Commentary Database ---
  private phraseBank: Record<
    CommentaryCategory,
    { speaker: 'Arthur Vance' | 'Marcus Sterling'; text: (ctx: Record<string, string | number>) => string }[]
  > = {
    kickoff: [
      {
        speaker: 'Arthur Vance',
        text: (c) =>
          `Welcome to Triumph League! Arthur Vance alongside Marcus Sterling, live from ${c.stadium || 'the Arena'}. We are underway!`,
      },
      {
        speaker: 'Arthur Vance',
        text: (c) =>
          `The whistle blows and Triumph League matchday is live! ${c.home} vs ${c.away}. Here we go!`,
      },
      {
        speaker: 'Marcus Sterling',
        text: () =>
          `Both teams look fired up today, Arthur. High energy right from the first whistle.`,
      },
    ],
    buildup_pass: [
      {
        speaker: 'Arthur Vance',
        text: (c) => `Neat exchange by ${c.player || 'the midfielder'}. Keeping the tempo flowing.`,
      },
      {
        speaker: 'Arthur Vance',
        text: () => `Patient buildup, shifting play across the pitch.`,
      },
      {
        speaker: 'Marcus Sterling',
        text: () => `Good positional discipline there, stretching the opposition block.`,
      },
      {
        speaker: 'Arthur Vance',
        text: (c) => `Crisp ball into the feet of ${c.player || 'their talisman'}.`,
      },
    ],
    through_ball: [
      {
        speaker: 'Arthur Vance',
        text: (c) => `Sublime vision! ${c.player || 'He'} threads it right through the defense!`,
      },
      {
        speaker: 'Arthur Vance',
        text: () => `The through-ball splits the center-backs wide open!`,
      },
      {
        speaker: 'Marcus Sterling',
        text: () => `Sensational timing on that pass! The runner timed it to perfection!`,
      },
    ],
    shot_taken: [
      {
        speaker: 'Arthur Vance',
        text: (c) => `Pulls the trigger from range! That is venomous!`,
      },
      {
        speaker: 'Arthur Vance',
        text: (c) => `${c.player || 'He'} takes aim... unleashes a strike towards goal!`,
      },
      {
        speaker: 'Marcus Sterling',
        text: () => `No hesitation! Caught that right on the laces!`,
      },
    ],
    shot_missed: [
      {
        speaker: 'Arthur Vance',
        text: () => `Just whiskers past the post! Had the keeper scrambling!`,
      },
      {
        speaker: 'Arthur Vance',
        text: () => `Flashes it wide! A golden chance goes begging!`,
      },
      {
        speaker: 'Marcus Sterling',
        text: () => `He rushed that finish, Arthur. Had more time than he realized.`,
      },
    ],
    post_hit: [
      {
        speaker: 'Arthur Vance',
        text: () => `OFF THE WOODWORK! The frame of the goal comes to the rescue!`,
      },
      {
        speaker: 'Arthur Vance',
        text: () => `RATTLES THE POST! Inches away from sheer brilliance!`,
      },
      {
        speaker: 'Marcus Sterling',
        text: () => `Unbelievable strike! Keeper was beaten all ends up!`,
      },
    ],
    goalkeeper_save: [
      {
        speaker: 'Arthur Vance',
        text: (c) => `WHAT A SAVE! ${c.keeper || 'The goalkeeper'} pulls off a world-class stop!`,
      },
      {
        speaker: 'Arthur Vance',
        text: (c) => `Fingertip deflection from ${c.keeper || 'the keeper'}! Sensational agility!`,
      },
      {
        speaker: 'Marcus Sterling',
        text: () => `Top-drawer reflexes. He made himself as big as possible!`,
      },
    ],
    goal: [
      {
        speaker: 'Arthur Vance',
        text: (c) =>
          `GOAAAL! ABSOLUTE THUNDERBOLT! ${c.player || 'He'} tears the net open! ${c.homeScore} to ${c.awayScore}!`,
      },
      {
        speaker: 'Arthur Vance',
        text: (c) =>
          `IT'S IN! PURE FOOTBALL POETRY! ${c.team || 'They'} break the deadlock in stunning fashion!`,
      },
      {
        speaker: 'Marcus Sterling',
        text: (c) =>
          `Listen to this stadium erupt! What technique from ${c.player || 'the finisher'}, clinical in the box!`,
      },
      {
        speaker: 'Arthur Vance',
        text: (c) =>
          `GOAL FOR ${c.team?.toString().toUpperCase() || 'TRIUMPH LEAGUE'}! An unstoppable strike into the top corner!`,
      },
    ],
    tackle: [
      {
        speaker: 'Arthur Vance',
        text: (c) => `Crunching challenge! ${c.tackler || 'The defender'} times the tackle to perfection!`,
      },
      {
        speaker: 'Marcus Sterling',
        text: () => `Clean ball, strong committed defending. That stops the break.`,
      },
    ],
    foul: [
      {
        speaker: 'Arthur Vance',
        text: () => `Whistle sounds! Late tackle and the referee steps in.`,
      },
      {
        speaker: 'Marcus Sterling',
        text: () => `Caught him on the follow-through. Definitely a foul.`,
      },
    ],
    counter_attack: [
      {
        speaker: 'Arthur Vance',
        text: () => `Turnover in midfield! Lightning counter-attack is on!`,
      },
      {
        speaker: 'Marcus Sterling',
        text: () => `Look at the numbers surging forward! Defense is backpedaling!`,
      },
    ],
    corner: [
      {
        speaker: 'Arthur Vance',
        text: () => `Deflected behind. Corner kick awarded. Danger looms.`,
      },
      {
        speaker: 'Marcus Sterling',
        text: () => `They've got height in the box. Delivery needs to be pinpoint.`,
      },
    ],
    half_time: [
      {
        speaker: 'Arthur Vance',
        text: (c) =>
          `There is the half-time whistle! A scintillating 45 minutes of football. Score stands at ${c.homeScore}-${c.awayScore}.`,
      },
      {
        speaker: 'Marcus Sterling',
        text: () =>
          `Tactically fascinating first half. Both managers have plenty to address in the dressing room.`,
      },
    ],
    full_time: [
      {
        speaker: 'Arthur Vance',
        text: (c) =>
          `FULL TIME! The referee calls an end to a majestic contest in Triumph League! Final score: ${c.homeScore}-${c.awayScore}.`,
      },
      {
        speaker: 'Marcus Sterling',
        text: () =>
          `What a showcase for Triumph League. Outstanding intensity and dedication from both sides.`,
      },
    ],
    penalty_awarded: [
      {
        speaker: 'Arthur Vance',
        text: () => `PENALTY! The referee points straight to the spot! Heartbreak for the defenders!`,
      },
      {
        speaker: 'Marcus Sterling',
        text: () => `Reckless challenge inside the 18-yard box. Referee had no choice!`,
      },
    ],
  };

  public triggerEvent(
    category: CommentaryCategory,
    context: Record<string, string | number> = {},
    priority: number = 5
  ) {
    const now = Date.now();

    // Prevent excessive spam of identical categories within short intervals (except goals and saves)
    if (
      this.lastCategory === category &&
      now - this.lastTriggerTime < 3000 &&
      category !== 'goal' &&
      category !== 'goalkeeper_save'
    ) {
      return;
    }

    const availableTemplates = this.phraseBank[category] || this.phraseBank.buildup_pass;
    const filtered = availableTemplates.filter((t) => {
      const text = t.text(context);
      return !this.recentPhrases.has(text);
    });

    const pool = filtered.length > 0 ? filtered : availableTemplates;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    const renderedText = choice.text(context);

    // Track recently used phrases
    this.recentPhrases.add(renderedText);
    if (this.recentPhrases.size > 20) {
      this.recentPhrases.clear();
    }

    const line: CommentaryLine = {
      id: `comm_${now}_${Math.random().toString(36).substring(2, 6)}`,
      speaker: choice.speaker,
      speakerRole: choice.speaker === 'Arthur Vance' ? 'Lead Commentator' : 'Co-Commentator',
      text: renderedText,
      priority,
      timestamp: now,
    };

    this.lastTriggerTime = now;
    this.lastCategory = category;

    this.speak(line);
  }

  private speak(line: CommentaryLine) {
    this.activeLine = line;
    this.notify();

    // If SpeechSynthesis is available and audio is not muted, speak aloud!
    if (!this.isMuted && this.volume > 0 && this.speechSynth && 'SpeechSynthesisUtterance' in window) {
      try {
        // Cancel previous if higher priority
        if (line.priority >= 7) {
          this.speechSynth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(line.text);
        utterance.volume = this.volume;

        // Give Arthur a deeper, dramatic voice and Marcus a slightly higher, analytical cadence
        if (line.speaker === 'Arthur Vance') {
          utterance.rate = 1.08;
          utterance.pitch = 0.94;
        } else {
          utterance.rate = 1.12;
          utterance.pitch = 1.06;
        }

        // Try to pick a natural English voice if present
        const voices = this.speechSynth.getVoices();
        if (voices.length > 0) {
          const ukVoice = voices.find(
            (v) =>
              v.lang.includes('en-GB') ||
              v.name.includes('UK') ||
              v.name.includes('Natural') ||
              v.name.includes('English')
          );
          if (ukVoice) utterance.voice = ukVoice;
        }

        this.speechSynth.speak(utterance);
      } catch {
        // Speech synthesis policy fallback - onscreen captions continue uninterrupted
      }
    }

    // Auto-dismiss active subtitle line after 4.5 seconds
    setTimeout(() => {
      if (this.activeLine?.id === line.id) {
        this.activeLine = null;
        this.notify();
      }
    }, 4500);
  }

  public reset() {
    this.activeLine = null;
    this.queue = [];
    if (this.speechSynth) {
      try {
        this.speechSynth.cancel();
      } catch {}
    }
    this.notify();
  }
}

export const commentaryEngine = new CommentaryEngine();
