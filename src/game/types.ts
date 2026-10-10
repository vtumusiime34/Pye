// Triumph League - Core Type Definitions

export type PlayerPosition = 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST';

export interface PlayerAttributes {
  pace: number;       // 1 - 99
  shooting: number;   // 1 - 99
  passing: number;    // 1 - 99
  dribbling: number;  // 1 - 99
  defending: number;  // 1 - 99
  physical: number;   // 1 - 99
  goalkeeping?: number; // 1 - 99 (GK only)
  stamina: number;    // Max stamina 100
}

export interface PlayerData {
  id: string;
  name: string;
  shortName: string;
  number: number;
  position: PlayerPosition;
  attributes: PlayerAttributes;
  overallRating: number;
  heightCm: number;
  skinTone: 'fair' | 'tan' | 'dark' | 'deep';
  hairColor: string;
  hairStyle: 'short' | 'buzz' | 'dreads' | 'curly' | 'fade';
  preferredFoot: 'left' | 'right';
  isCaptain?: boolean;
}

export interface TeamKit {
  primaryColor: string;     // Jersey main
  secondaryColor: string;   // Accent / stripes
  shortsColor: string;
  socksColor: string;
  numberColor: string;
  pattern: 'solid' | 'stripes' | 'sash' | 'halves' | 'gradient';
}

export type TeamFormation = '4-3-3' | '4-4-2' | '4-2-3-1' | '3-5-2' | '5-3-2';

export interface TeamData {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  foundedYear: number;
  city: string;
  stadiumName: string;
  stadiumCapacity: string;
  starRating: number; // 3.5 - 5.0
  primaryKit: TeamKit;
  awayKit: TeamKit;
  goalkeeperKit: TeamKit;
  formation: TeamFormation;
  players: PlayerData[];
  tactics: {
    attackingStyle: 'balanced' | 'fast_break' | 'possession' | 'wing_play';
    defensivePressing: 'low_block' | 'balanced' | 'high_press';
    mentality: 'ultra_defensive' | 'defensive' | 'balanced' | 'attacking' | 'all_out_attack';
  };
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type MatchPhase =
  | 'pre_match'
  | 'kickoff'
  | 'in_play'
  | 'goal_scored'
  | 'celebration'
  | 'out_of_bounds'
  | 'throw_in'
  | 'corner_kick'
  | 'goal_kick'
  | 'free_kick'
  | 'penalty'
  | 'half_time'
  | 'full_time'
  | 'shootout';

export interface MatchScore {
  home: number;
  away: number;
}

export interface MatchStats {
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homePossessionPercent: number;
  awayPossessionPercent: number;
  homePasses: number;
  awayPasses: number;
  homePassAccuracy: number;
  awayPassAccuracy: number;
  homeTackles: number;
  awayTackles: number;
  homeCorners: number;
  awayCorners: number;
  homeFouls: number;
  awayFouls: number;
}

export interface MatchGoalEvent {
  minute: number;
  player: PlayerData;
  team: 'home' | 'away';
  isPenalty?: boolean;
}

export interface ControlState {
  moveX: number; // -1 to 1
  moveZ: number; // -1 to 1
  isSprinting: boolean;
  passRequested: boolean;
  throughRequested: boolean;
  shootRequested: boolean;
  shootPower: number; // 0 to 1
  lobRequested: boolean;
  tackleRequested: boolean;
  slideRequested: boolean;
  switchPlayerRequested: boolean;
  skillRequested: boolean;
}

export type CameraPreset = 'tv_broadcast' | 'end_to_end' | 'sideline_high' | 'action_cam';

export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';

export type MatchWeather = 'clear_day' | 'golden_sunset' | 'night_floodlit' | 'rain_night';

export interface LeagueStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}
