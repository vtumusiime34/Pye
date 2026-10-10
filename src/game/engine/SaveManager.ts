// Triumph League - Persistent Save System (Local + Cloud-Ready Architecture)
import { TeamData, LeagueStanding, GraphicsQuality, CameraPreset } from '../types';
import { CLUBS } from '../data/clubs';

export interface GameSettingsSave {
  graphicsQuality: GraphicsQuality;
  cameraPreset: CameraPreset;
  soundVolume: number;
  commentaryVolume: number;
  crowdVolume: number;
  musicVolume: number;
  isMuted: boolean;
  targetFPS: 30 | 60 | 120;
  radarVisible: boolean;
  platformMode: 'auto' | 'mobile' | 'pc';
}

export interface CareerSave {
  clubId: string;
  clubName: string;
  primaryColor: string;
  secondaryColor: string;
  budgetMillions: number;
  stadiumLevel: number;
  seasonNumber: number;
  trophies: string[];
  transfersSigned: string[];
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface TriumphLeagueSaveData {
  version: number;
  settings: GameSettingsSave;
  career: CareerSave;
  leagueStandings: LeagueStanding[];
  achievements: AchievementItem[];
  careerStats: {
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    matchesDrawn: number;
    goalsScored: number;
    goalsConceded: number;
    cleanSheets: number;
    highestWinMargin: number;
  };
}

const STORAGE_KEY = 'triumph_league_save_v1';

const DEFAULT_SAVE: TriumphLeagueSaveData = {
  version: 1,
  settings: {
    graphicsQuality: 'high',
    cameraPreset: 'tv_broadcast',
    soundVolume: 0.85,
    commentaryVolume: 0.9,
    crowdVolume: 0.8,
    musicVolume: 0.7,
    isMuted: false,
    targetFPS: 60,
    radarVisible: true,
    platformMode: 'auto',
  },
  career: {
    clubId: 'apex_london',
    clubName: 'Apex London FC',
    primaryColor: '#1035ac',
    secondaryColor: '#f59e0b',
    budgetMillions: 50.0,
    stadiumLevel: 3,
    seasonNumber: 1,
    trophies: ['Triumph National Shield 2025'],
    transfersSigned: [],
  },
  leagueStandings: [
    { teamId: 'apex_london', played: 14, won: 11, drawn: 2, lost: 1, goalsFor: 34, goalsAgainst: 11, goalDifference: 23, points: 35, form: ['W', 'W', 'W', 'D', 'W'] },
    { teamId: 'real_vanguard', played: 14, won: 10, drawn: 3, lost: 1, goalsFor: 32, goalsAgainst: 12, goalDifference: 20, points: 33, form: ['W', 'W', 'D', 'W', 'W'] },
    { teamId: 'bavaria_titans', played: 14, won: 9, drawn: 3, lost: 2, goalsFor: 30, goalsAgainst: 15, goalDifference: 15, points: 30, form: ['W', 'L', 'W', 'W', 'D'] },
    { teamId: 'rio_stars', played: 14, won: 8, drawn: 3, lost: 3, goalsFor: 28, goalsAgainst: 18, goalDifference: 10, points: 27, form: ['D', 'W', 'W', 'L', 'W'] },
    { teamId: 'milan_interstellar', played: 14, won: 7, drawn: 4, lost: 3, goalsFor: 22, goalsAgainst: 16, goalDifference: 6, points: 25, form: ['W', 'D', 'D', 'W', 'L'] },
    { teamId: 'neo_tokyo', played: 14, won: 6, drawn: 2, lost: 6, goalsFor: 20, goalsAgainst: 22, goalDifference: -2, points: 20, form: ['L', 'W', 'L', 'W', 'D'] },
  ],
  achievements: [
    { id: 'first_goal', title: 'First of Many', description: 'Score your first goal in Triumph League', icon: '⚽', unlockedAt: new Date().toISOString() },
    { id: 'clean_sheet', title: 'Fortress', description: 'Keep a clean sheet against a 5-star club', icon: '🛡️' },
    { id: 'thunderbolt', title: 'Rocket Man', description: 'Score from outside the 18-yard box', icon: '🚀' },
    { id: 'hat_trick', title: 'Match Ball', description: 'Score 3 goals with one player in a single match', icon: '🎩' },
    { id: 'champions', title: 'Triumph Champion', description: 'Lift the Triumph League Championship Trophy', icon: '🏆' },
    { id: 'big_spender', title: 'Galactico Signing', description: 'Sign an 88+ rated superstar in Career Mode', icon: '💎' },
  ],
  careerStats: {
    matchesPlayed: 14,
    matchesWon: 11,
    matchesLost: 1,
    matchesDrawn: 2,
    goalsScored: 34,
    goalsConceded: 11,
    cleanSheets: 6,
    highestWinMargin: 4,
  },
};

export class SaveManager {
  private static data: TriumphLeagueSaveData = SaveManager.load();

  public static load(): TriumphLeagueSaveData {
    if (typeof window === 'undefined') return DEFAULT_SAVE;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_SAVE;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SAVE, ...parsed };
    } catch {
      return DEFAULT_SAVE;
    }
  }

  public static save(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {}
  }

  public static get(): TriumphLeagueSaveData {
    return this.data;
  }

  public static updateSettings(partial: Partial<GameSettingsSave>): void {
    this.data.settings = { ...this.data.settings, ...partial };
    this.save();
  }

  public static updateCareer(partial: Partial<CareerSave>): void {
    this.data.career = { ...this.data.career, ...partial };
    this.save();
  }

  public static recordMatchResult(
    userScore: number,
    opponentScore: number,
    isHome: boolean
  ): void {
    const isWin = userScore > opponentScore;
    const isDraw = userScore === opponentScore;

    this.data.careerStats.matchesPlayed += 1;
    this.data.careerStats.goalsScored += userScore;
    this.data.careerStats.goalsConceded += opponentScore;

    if (isWin) this.data.careerStats.matchesWon += 1;
    else if (isDraw) this.data.careerStats.matchesDrawn += 1;
    else this.data.careerStats.matchesLost += 1;

    if (opponentScore === 0) {
      this.data.careerStats.cleanSheets += 1;
      this.unlockAchievement('clean_sheet');
    }

    const margin = userScore - opponentScore;
    if (margin > this.data.careerStats.highestWinMargin) {
      this.data.careerStats.highestWinMargin = margin;
    }

    if (userScore > 0) {
      this.unlockAchievement('first_goal');
    }

    this.save();
  }

  public static unlockAchievement(id: string): void {
    const ach = this.data.achievements.find((a) => a.id === id);
    if (ach && !ach.unlockedAt) {
      ach.unlockedAt = new Date().toISOString();
      this.save();
    }
  }

  public static resetProgress(): void {
    this.data = { ...DEFAULT_SAVE };
    this.save();
  }
}
