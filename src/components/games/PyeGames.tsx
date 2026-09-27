import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Trophy,
  Users,
  Bot,
  RotateCcw,
  Sparkles,
  Flame,
  Award,
  Dice5,
  Shield,
  ChevronRight,
  Info,
  Play,
  Volume2,
  X,
  Coins,
} from 'lucide-react';
import { User, GameScoreRecord } from '../../types';
import { Storage } from '../../services/storage';
import { PyeLogo } from '../ui/PyeLogo';

interface PyeGamesProps {
  currentUser: User | null;
  onOpenAuth: (tab?: 'login' | 'signup') => void;
  onOpenWallet?: () => void;
}

type ActiveGameId = 'overview' | 'chess' | 'checkers' | 'ludo' | 'tiktaktoe' | 'snakes_ladders' | 'monopoly';

export const PyeGames: React.FC<PyeGamesProps> = ({
  currentUser,
  onOpenAuth,
  onOpenWallet,
}) => {
  const [activeGame, setActiveGame] = useState<ActiveGameId>('overview');
  const [gameHistory, setGameHistory] = useState<GameScoreRecord[]>(() =>
    Storage.getGameRecords(currentUser?.id)
  );

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleGameWin = (gameTitle: string, rewardCoins: number = 25) => {
    if (currentUser) {
      const record = Storage.recordGameOutcome({
        userId: currentUser.id,
        gameId: activeGame,
        result: 'win',
        score: 100,
        coinsEarned: rewardCoins,
        opponentName: 'PYE AI Engine',
      });
      setGameHistory((prev) => [record, ...prev]);
      showToast(`Victory! You earned +${rewardCoins} PYE Silver Coins!`);
    } else {
      showToast('Victory! Sign in to claim PYE Silver Coin rewards.');
    }
  };

  // --- 1. TIC-TAC-TOE STATE & LOGIC ---
  const [tttBoard, setTttBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [tttTurn, setTttTurn] = useState<'X' | 'O'>('X');
  const [tttWinner, setTttWinner] = useState<string | null>(null);
  const [tttMode, setTttMode] = useState<'ai' | 'pvp'>('ai');

  const checkTttWinner = (board: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    if (board.every((cell) => cell !== null)) return 'draw';
    return null;
  };

  const handleTttClick = (index: number) => {
    if (tttBoard[index] || tttWinner) return;

    const next = [...tttBoard];
    next[index] = tttTurn;
    setTttBoard(next);

    const win = checkTttWinner(next);
    if (win) {
      setTttWinner(win);
      if (win === 'X') handleGameWin('Tic-Tac-Toe', 15);
      return;
    }

    if (tttMode === 'ai' && tttTurn === 'X') {
      setTttTurn('O');
      // AI Move
      setTimeout(() => {
        const available = next
          .map((v, i) => (v === null ? i : null))
          .filter((v) => v !== null) as number[];
        if (available.length > 0) {
          const aiPick = available[Math.floor(Math.random() * available.length)];
          const aiBoard = [...next];
          aiBoard[aiPick] = 'O';
          setTttBoard(aiBoard);
          const aiWin = checkTttWinner(aiBoard);
          if (aiWin) {
            setTttWinner(aiWin);
          } else {
            setTttTurn('X');
          }
        }
      }, 350);
    } else {
      setTttTurn(tttTurn === 'X' ? 'O' : 'X');
    }
  };

  const resetTtt = () => {
    setTttBoard(Array(9).fill(null));
    setTttTurn('X');
    setTttWinner(null);
  };

  // --- 2. CHESS STATE & LOGIC (Lightweight playable interactive chess) ---
  const initialChessBoard = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    Array(8).fill(''),
    Array(8).fill(''),
    Array(8).fill(''),
    Array(8).fill(''),
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
  ];
  const [chessBoard, setChessBoard] = useState<string[][]>(initialChessBoard);
  const [selectedChessCell, setSelectedChessCell] = useState<[number, number] | null>(null);
  const [chessTurn, setChessTurn] = useState<'white' | 'black'>('white');
  const [capturedByWhite, setCapturedByWhite] = useState<string[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<string[]>([]);

  const isWhitePiece = (piece: string) => ['♖', '♘', '♗', '♕', '♔', '♙'].includes(piece);
  const isBlackPiece = (piece: string) => ['♜', '♞', '♝', '♛', '♚', '♟'].includes(piece);

  const handleChessCellClick = (r: number, c: number) => {
    const targetPiece = chessBoard[r][c];

    if (!selectedChessCell) {
      if (
        (chessTurn === 'white' && isWhitePiece(targetPiece)) ||
        (chessTurn === 'black' && isBlackPiece(targetPiece))
      ) {
        setSelectedChessCell([r, c]);
      }
      return;
    }

    const [fromR, fromC] = selectedChessCell;
    if (fromR === r && fromC === c) {
      setSelectedChessCell(null);
      return;
    }

    // Move piece
    const movedPiece = chessBoard[fromR][fromC];
    const newBoard = chessBoard.map((row) => [...row]);

    // Check capture
    if (targetPiece) {
      if (isBlackPiece(targetPiece)) {
        setCapturedByWhite((prev) => [...prev, targetPiece]);
        if (targetPiece === '♚') {
          handleGameWin('Chess', 50);
          showToast('Checkmate! Black King captured!');
        }
      } else {
        setCapturedByBlack((prev) => [...prev, targetPiece]);
        if (targetPiece === '♔') {
          showToast('White King captured! Game Over.');
        }
      }
    }

    newBoard[r][c] = movedPiece;
    newBoard[fromR][fromC] = '';
    setChessBoard(newBoard);
    setSelectedChessCell(null);
    setChessTurn(chessTurn === 'white' ? 'black' : 'white');
  };

  const resetChess = () => {
    setChessBoard(initialChessBoard);
    setSelectedChessCell(null);
    setChessTurn('white');
    setCapturedByWhite([]);
    setCapturedByBlack([]);
  };

  // --- 3. CHECKERS STATE & LOGIC ---
  const initialCheckers = () => {
    const board: (string | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) board[r][c] = 'b'; // Black
      }
    }
    for (let r = 5; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) board[r][c] = 'r'; // Red / Pink
      }
    }
    return board;
  };

  const [checkersBoard, setCheckersBoard] = useState(initialCheckers);
  const [selectedChecker, setSelectedChecker] = useState<[number, number] | null>(null);
  const [checkersTurn, setCheckersTurn] = useState<'r' | 'b'>('r');
  const [checkersScore, setCheckersScore] = useState({ r: 0, b: 0 });

  const handleCheckerClick = (r: number, c: number) => {
    const piece = checkersBoard[r][c];

    if (!selectedChecker) {
      if (piece && piece.startsWith(checkersTurn)) {
        setSelectedChecker([r, c]);
      }
      return;
    }

    const [fr, fc] = selectedChecker;
    if (fr === r && fc === c) {
      setSelectedChecker(null);
      return;
    }

    // Step move or Jump move
    const rowDiff = r - fr;
    const colDiff = Math.abs(c - fc);
    const isValidStep =
      (checkersTurn === 'r' ? rowDiff === -1 : rowDiff === 1) && colDiff === 1 && !piece;
    const isValidJump =
      Math.abs(rowDiff) === 2 && colDiff === 2 && !piece;

    if (isValidStep || isValidJump) {
      const nextBoard = checkersBoard.map((row) => [...row]);
      let currentPiece = nextBoard[fr][fc]!;

      // Promotion to King
      if (checkersTurn === 'r' && r === 0) currentPiece = 'rK';
      if (checkersTurn === 'b' && r === 7) currentPiece = 'bK';

      if (isValidJump) {
        const jumpedR = (fr + r) / 2;
        const jumpedC = (fc + c) / 2;
        nextBoard[jumpedR][jumpedC] = null;
        setCheckersScore((prev) => ({
          ...prev,
          [checkersTurn]: prev[checkersTurn] + 1,
        }));
      }

      nextBoard[r][c] = currentPiece;
      nextBoard[fr][fc] = null;
      setCheckersBoard(nextBoard);
      setSelectedChecker(null);
      setCheckersTurn(checkersTurn === 'r' ? 'b' : 'r');

      if (checkersScore[checkersTurn] + (isValidJump ? 1 : 0) >= 12) {
        handleGameWin('Checkers', 35);
      }
    } else if (piece && piece.startsWith(checkersTurn)) {
      setSelectedChecker([r, c]);
    }
  };

  const resetCheckers = () => {
    setCheckersBoard(initialCheckers());
    setSelectedChecker(null);
    setCheckersTurn('r');
    setCheckersScore({ r: 0, b: 0 });
  };

  // --- 4. LUDO STATE & LOGIC ---
  const [ludoTokens, setLudoTokens] = useState({
    player1: [0, 0, 0, 0], // Player (Pink)
    player2: [0, 0, 0, 0], // AI Blue
  });
  const [ludoDice, setLudoDice] = useState<number>(6);
  const [ludoTurn, setLudoTurn] = useState<'p1' | 'p2'>('p1');
  const [isRollingLudo, setIsRollingLudo] = useState(false);

  const rollLudoDice = () => {
    if (isRollingLudo) return;
    setIsRollingLudo(true);
    let rolls = 0;
    const interval = setInterval(() => {
      setLudoDice(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 6) {
        clearInterval(interval);
        const finalDice = Math.floor(Math.random() * 6) + 1;
        setLudoDice(finalDice);
        setIsRollingLudo(false);

        // Move active token for current turn
        if (ludoTurn === 'p1') {
          setLudoTokens((prev) => {
            const updated = [...prev.player1];
            updated[0] = Math.min(52, updated[0] + finalDice);
            if (updated[0] >= 52) handleGameWin('Ludo', 30);
            return { ...prev, player1: updated };
          });
          setLudoTurn('p2');
        } else {
          setLudoTokens((prev) => {
            const updated = [...prev.player2];
            updated[0] = Math.min(52, updated[0] + finalDice);
            return { ...prev, player2: updated };
          });
          setLudoTurn('p1');
        }
      }
    }, 80);
  };

  const resetLudo = () => {
    setLudoTokens({ player1: [0, 0, 0, 0], player2: [0, 0, 0, 0] });
    setLudoDice(6);
    setLudoTurn('p1');
  };

  // --- 5. SNAKES AND LADDERS STATE & LOGIC ---
  const [snlPlayerPos, setSnlPlayerPos] = useState<number>(1);
  const [snlAiPos, setSnlAiPos] = useState<number>(1);
  const [snlDice, setSnlDice] = useState<number>(1);
  const [isRollingSnl, setIsRollingSnl] = useState(false);
  const [snlTurn, setSnlTurn] = useState<'player' | 'ai'>('player');

  const ladders: Record<number, number> = { 4: 25, 12: 38, 28: 55, 40: 68, 62: 81, 74: 93 };
  const snakes: Record<number, number> = { 32: 10, 48: 26, 65: 42, 85: 53, 97: 64 };

  const rollSnlDice = () => {
    if (isRollingSnl) return;
    setIsRollingSnl(true);
    let count = 0;
    const timer = setInterval(() => {
      setSnlDice(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 6) {
        clearInterval(intervalSnl);
      }
    }, 70);

    const intervalSnl = setInterval(() => {
      clearInterval(timer);
      const roll = Math.floor(Math.random() * 6) + 1;
      setSnlDice(roll);
      setIsRollingSnl(false);

      if (snlTurn === 'player') {
        let nextPos = snlPlayerPos + roll;
        if (nextPos > 100) nextPos = 100 - (nextPos - 100);
        if (ladders[nextPos]) {
          showToast(`Gravity Lift! Climbed to ${ladders[nextPos]}`);
          nextPos = ladders[nextPos];
        } else if (snakes[nextPos]) {
          showToast(`Wormhole! Slipped down to ${snakes[nextPos]}`);
          nextPos = snakes[nextPos];
        }
        setSnlPlayerPos(nextPos);
        if (nextPos === 100) {
          handleGameWin('Snakes & Ladders', 40);
          return;
        }
        setSnlTurn('ai');

        // AI turn automated
        setTimeout(() => {
          const aiRoll = Math.floor(Math.random() * 6) + 1;
          let nextAi = snlAiPos + aiRoll;
          if (nextAi > 100) nextAi = 100 - (nextAi - 100);
          if (ladders[nextAi]) nextAi = ladders[nextAi];
          if (snakes[nextAi]) nextAi = snakes[nextAi];
          setSnlAiPos(nextAi);
          setSnlTurn('player');
        }, 1200);
      }
    }, 450);
  };

  const resetSnl = () => {
    setSnlPlayerPos(1);
    setSnlAiPos(1);
    setSnlDice(1);
    setSnlTurn('player');
  };

  // --- 6. PYE TYCOON (Original Monopoly-Style) STATE & LOGIC ---
  interface TycoonProperty {
    id: number;
    name: string;
    price: number;
    rent: number;
    color: string;
    owner: 'player' | 'ai' | null;
  }

  const initialTycoonProperties: TycoonProperty[] = [
    { id: 0, name: 'Genesis Gate', price: 0, rent: 0, color: 'border-white/30', owner: null },
    { id: 1, name: 'Neon Alley', price: 60, rent: 10, color: 'bg-rose-500/20 text-rose-300', owner: null },
    { id: 2, name: 'Quantum Core', price: 80, rent: 15, color: 'bg-rose-500/20 text-rose-300', owner: null },
    { id: 3, name: 'Spaces Hub', price: 100, rent: 20, color: 'bg-amber-500/20 text-amber-300', owner: null },
    { id: 4, name: 'Orbital Ring', price: 120, rent: 25, color: 'bg-amber-500/20 text-amber-300', owner: null },
    { id: 5, name: 'Cyber Citadel', price: 160, rent: 35, color: 'bg-cyan-500/20 text-cyan-300', owner: null },
    { id: 6, name: 'Pyramid Station', price: 200, rent: 45, color: 'bg-cyan-500/20 text-cyan-300', owner: null },
    { id: 7, name: 'Universe Palace', price: 300, rent: 70, color: 'bg-purple-500/20 text-purple-300', owner: null },
  ];

  const [tycoonProps, setTycoonProps] = useState<TycoonProperty[]>(initialTycoonProperties);
  const [tycoonPlayerPos, setTycoonPlayerPos] = useState(0);
  const [tycoonAiPos, setTycoonAiPos] = useState(0);
  const [tycoonPlayerBalance, setTycoonPlayerBalance] = useState(1500);
  const [tycoonAiBalance, setTycoonAiBalance] = useState(1500);
  const [tycoonDice, setTycoonDice] = useState<[number, number]>([3, 4]);
  const [isRollingTycoon, setIsRollingTycoon] = useState(false);
  const [tycoonTurn, setTycoonTurn] = useState<'player' | 'ai'>('player');

  const rollTycoonDice = () => {
    if (isRollingTycoon) return;
    setIsRollingTycoon(true);
    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const total = d1 + d2;
      setTycoonDice([d1, d2]);
      setIsRollingTycoon(false);

      if (tycoonTurn === 'player') {
        const nextPos = (tycoonPlayerPos + total) % tycoonProps.length;
        if (nextPos < tycoonPlayerPos) {
          // Passed Genesis Gate
          setTycoonPlayerBalance((b) => b + 200);
          showToast('Passed Genesis Gate! Collected +200 SPC');
        }
        setTycoonPlayerPos(nextPos);

        const currentProp = tycoonProps[nextPos];
        if (currentProp.owner === 'ai') {
          // Pay rent
          setTycoonPlayerBalance((b) => Math.max(0, b - currentProp.rent));
          setTycoonAiBalance((b) => b + currentProp.rent);
          showToast(`Landed on AI property! Paid ${currentProp.rent} SPC rent.`);
        }
        setTycoonTurn('ai');

        // AI Turn
        setTimeout(() => {
          const aiRoll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
          const aiNext = (tycoonAiPos + aiRoll) % tycoonProps.length;
          setTycoonAiPos(aiNext);
          const aiProp = tycoonProps[aiNext];
          if (aiProp.owner === 'player') {
            setTycoonAiBalance((b) => Math.max(0, b - aiProp.rent));
            setTycoonPlayerBalance((b) => b + aiProp.rent);
            showToast(`AI landed on your property! Collected +${aiProp.rent} SPC rent.`);
          } else if (!aiProp.owner && aiProp.price > 0 && tycoonAiBalance >= aiProp.price) {
            // AI buys
            setTycoonProps((prev) =>
              prev.map((p) => (p.id === aiProp.id ? { ...p, owner: 'ai' } : p))
            );
            setTycoonAiBalance((b) => b - aiProp.price);
          }
          setTycoonTurn('player');
        }, 1500);
      }
    }, 400);
  };

  const buyTycoonProperty = () => {
    const prop = tycoonProps[tycoonPlayerPos];
    if (prop.owner || prop.price === 0) return;
    if (tycoonPlayerBalance < prop.price) {
      showToast('Insufficient SPC balance to buy this district.');
      return;
    }

    setTycoonPlayerBalance((b) => b - prop.price);
    setTycoonProps((prev) =>
      prev.map((p) => (p.id === prop.id ? { ...p, owner: 'player' } : p))
    );
    showToast(`Acquired ${prop.name}! You will now earn rent.`);
    if (tycoonProps.filter((p) => p.owner === 'player').length >= 4) {
      handleGameWin('PYE Tycoon', 60);
    }
  };

  const resetTycoon = () => {
    setTycoonProps(initialTycoonProperties);
    setTycoonPlayerPos(0);
    setTycoonAiPos(0);
    setTycoonPlayerBalance(1500);
    setTycoonAiBalance(1500);
    setTycoonTurn('player');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24 select-none">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2 rounded-xl bg-zinc-900 border border-[#FF007A]/60 text-white text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          {toastMsg}
        </div>
      )}

      {/* Header Banner with official PYE Logo */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#FF007A]/20 via-[#FF5500]/15 to-[#FFA000]/10 border border-[#FF007A]/30 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <PyeLogo size={42} />
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF007A]/20 border border-[#FF007A]/40 text-[#FFA000] text-[10px] font-bold uppercase tracking-wider">
                  <Gamepad2 className="w-3 h-3" />
                  PYE Arcade & Multiplayer
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
                  PYE Games
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
              Experience turn-based classics redesigned with high-octane cyber aesthetic. Compete against smart AI or invite fellow pioneers to earn PYE Silver Coins.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center gap-3">
              <Coins className="w-6 h-6 text-[#FFA000]" />
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">Your Arcade Balance</div>
                <div className="text-sm font-black text-white font-mono">
                  {currentUser?.silverCoins ?? 1000} <span className="text-[#FFA000] text-xs">SPC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Switcher: Overview vs Active Games */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'All Games', icon: Gamepad2 },
          { id: 'chess', label: 'PYE Chess', icon: Trophy },
          { id: 'checkers', label: 'Checkers', icon: Award },
          { id: 'ludo', label: 'Ludo Arena', icon: Dice5 },
          { id: 'tiktaktoe', label: 'Tic-Tac-Toe', icon: Sparkles },
          { id: 'snakes_ladders', label: 'Snakes & Lifts', icon: Flame },
          { id: 'monopoly', label: 'PYE Tycoon', icon: Shield },
        ].map((g) => {
          const Icon = g.icon;
          const active = activeGame === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setActiveGame(g.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                active
                  ? 'bg-gradient-to-r from-[#FF007A] to-[#FF5500] text-white shadow-md shadow-[#FF007A]/25'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{g.label}</span>
            </button>
          );
        })}
      </div>

      {/* --- ALL GAMES GRID (OVERVIEW) --- */}
      {activeGame === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: 'chess',
              title: 'PYE Chess',
              desc: 'High-intellect tactical warfare on an 8x8 neon grid. Play vs PYE Neural AI.',
              players: '1-2 Players',
              reward: '+50 SPC',
              badge: 'Strategic',
            },
            {
              id: 'checkers',
              title: 'Cyber Checkers',
              desc: 'Diagonal jumps and king promotions in electric magenta & obsidian.',
              players: '2 Players / AI',
              reward: '+35 SPC',
              badge: 'Tactical',
            },
            {
              id: 'ludo',
              title: 'Ludo Arena',
              desc: 'Race 4 tokens through spatial runways into your central home zone.',
              players: '2-4 Players',
              reward: '+30 SPC',
              badge: 'Multiplayer',
            },
            {
              id: 'tiktaktoe',
              title: 'Neon Tic-Tac-Toe',
              desc: 'Fast 3x3 strategic match with win-streaks and instant rematch.',
              players: 'Quick Match',
              reward: '+15 SPC',
              badge: 'Casual',
            },
            {
              id: 'snakes_ladders',
              title: 'Snakes & Gravity Lifts',
              desc: 'Roll through 100 tiles. Ascend gravity lifts and dodge cosmic wormholes.',
              players: 'Multi-Pioneer',
              reward: '+40 SPC',
              badge: 'Dice Luck',
            },
            {
              id: 'monopoly',
              title: 'PYE Tycoon',
              desc: 'Acquire districts around Genesis Gate, collect rent, and dominate the economy.',
              players: 'Economy Sim',
              reward: '+60 SPC',
              badge: 'Board Tycoon',
            },
          ].map((game) => (
            <div
              key={game.id}
              className="p-5 rounded-3xl bg-[#0f0f18] border border-white/5 hover:border-[#FF007A]/40 transition group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FF007A]/15 border border-[#FF007A]/30 text-[#FFA000] text-[10px] font-bold uppercase tracking-wider">
                    {game.badge}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400">
                    {game.reward}
                  </span>
                </div>
                <h3 className="text-base font-black text-white group-hover:text-[#FFA000] transition">
                  {game.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {game.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {game.players}
                </span>
                <button
                  onClick={() => setActiveGame(game.id as any)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FFA000] text-xs font-bold text-white shadow-md hover:scale-105 active:scale-95 transition flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Play Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- 1. TIC-TAC-TOE --- */}
      {activeGame === 'tiktaktoe' && (
        <div className="p-6 rounded-3xl bg-[#0f0f18] border border-white/10 space-y-6 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF007A]" />
              Neon Tic-Tac-Toe
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTttMode(tttMode === 'ai' ? 'pvp' : 'ai')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-300 border border-zinc-700 hover:text-white transition"
              >
                {tttMode === 'ai' ? 'Vs AI' : 'Local 2P'}
              </button>
              <button
                onClick={resetTtt}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition"
                title="Reset board"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-zinc-300">
            {tttWinner ? (
              <span className="font-bold text-emerald-400">
                {tttWinner === 'draw' ? 'Stalemate Draw!' : `Player ${tttWinner} Victorious!`}
              </span>
            ) : (
              <span>Turn: Player <strong className={tttTurn === 'X' ? 'text-[#FF007A]' : 'text-[#FFA000]'}>{tttTurn}</strong></span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
            {tttBoard.map((val, idx) => (
              <button
                key={idx}
                onClick={() => handleTttClick(idx)}
                className={`w-20 h-20 rounded-2xl bg-zinc-900 border text-3xl font-black flex items-center justify-center transition shadow-lg ${
                  val === 'X'
                    ? 'text-[#FF007A] border-[#FF007A]/50 bg-[#FF007A]/10 shadow-[#FF007A]/20'
                    : val === 'O'
                    ? 'text-[#FFA000] border-[#FFA000]/50 bg-[#FFA000]/10 shadow-[#FFA000]/20'
                    : 'border-white/10 hover:border-white/30 hover:bg-zinc-800'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- 2. CHESS --- */}
      {activeGame === 'chess' && (
        <div className="p-6 rounded-3xl bg-[#0f0f18] border border-white/10 space-y-6 max-w-xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#FFA000]" />
                PYE Chess
              </h3>
              <p className="text-[11px] text-zinc-400">Select piece, then tap destination square.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-xs font-mono text-zinc-300">
                Turn: {chessTurn === 'white' ? 'White' : 'Black'}
              </span>
              <button
                onClick={resetChess}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition"
                title="Reset Chess Board"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Captured Pieces Bar */}
          <div className="flex items-center justify-between text-xs font-mono px-2 py-1 bg-zinc-900/60 rounded-xl">
            <span className="text-zinc-300">Captured: {capturedByWhite.join(' ')}</span>
            <span className="text-zinc-500">{capturedByBlack.join(' ')}</span>
          </div>

          {/* Chessboard Grid */}
          <div className="grid grid-cols-8 border-2 border-zinc-700 rounded-2xl overflow-hidden shadow-2xl max-w-[420px] mx-auto">
            {chessBoard.map((row, r) =>
              row.map((piece, c) => {
                const isDark = (r + c) % 2 === 1;
                const isSelected = selectedChessCell?.[0] === r && selectedChessCell?.[1] === c;
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleChessCellClick(r, c)}
                    className={`w-12 h-12 sm:w-13 sm:h-13 flex items-center justify-center text-2xl transition ${
                      isSelected
                        ? 'bg-[#FF007A]/60 text-white ring-2 ring-[#FF007A]'
                        : isDark
                        ? 'bg-zinc-800/90 hover:bg-zinc-700'
                        : 'bg-zinc-900/90 hover:bg-zinc-800'
                    }`}
                  >
                    {piece}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- 3. CHECKERS --- */}
      {activeGame === 'checkers' && (
        <div className="p-6 rounded-3xl bg-[#0f0f18] border border-white/10 space-y-6 max-w-xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-[#FF007A]" />
                Cyber Checkers
              </h3>
              <p className="text-[11px] text-zinc-400">Score: Red ({checkersScore.r}) vs Black ({checkersScore.b})</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${checkersTurn === 'r' ? 'bg-[#FF007A]/20 text-[#FF007A]' : 'bg-zinc-700 text-zinc-300'}`}>
                {checkersTurn === 'r' ? "Red's Turn" : "Black's Turn"}
              </span>
              <button
                onClick={resetCheckers}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-8 border-2 border-zinc-700 rounded-2xl overflow-hidden shadow-2xl max-w-[420px] mx-auto">
            {checkersBoard.map((row, r) =>
              row.map((piece, c) => {
                const isPlayableSquare = (r + c) % 2 === 1;
                const isSelected = selectedChecker?.[0] === r && selectedChecker?.[1] === c;
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCheckerClick(r, c)}
                    className={`w-12 h-12 flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-[#FF007A]/50 ring-2 ring-[#FF007A]'
                        : isPlayableSquare
                        ? 'bg-zinc-900'
                        : 'bg-zinc-800/40'
                    }`}
                  >
                    {piece && (
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-[10px] shadow-md ${
                          piece.startsWith('r')
                            ? 'bg-gradient-to-r from-[#FF007A] to-[#FF5500] border-white/60 text-white'
                            : 'bg-zinc-950 border-zinc-500 text-zinc-300'
                        }`}
                      >
                        {piece.includes('K') ? '♔' : ''}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- 4. LUDO ARENA --- */}
      {activeGame === 'ludo' && (
        <div className="p-6 rounded-3xl bg-[#0f0f18] border border-white/10 space-y-6 max-w-lg mx-auto text-center">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Dice5 className="w-5 h-5 text-[#FFA000]" />
              Ludo Arena
            </h3>
            <button
              onClick={resetLudo}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/5 space-y-4">
            <div className="flex items-center justify-around">
              <div className="space-y-1">
                <div className="text-xs text-zinc-400 font-bold">You (Pink)</div>
                <div className="text-sm font-mono text-[#FF007A] font-bold">
                  Progress: {ludoTokens.player1[0]}/52
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-zinc-400 font-bold">AI Rival (Blue)</div>
                <div className="text-sm font-mono text-cyan-400 font-bold">
                  Progress: {ludoTokens.player2[0]}/52
                </div>
              </div>
            </div>

            {/* Simulated Track Progress Bar */}
            <div className="space-y-2">
              <div className="h-4 bg-zinc-800 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-[#FF007A] to-[#FF5500] transition-all duration-300"
                  style={{ width: `${(ludoTokens.player1[0] / 52) * 100}%` }}
                />
              </div>
              <div className="h-4 bg-zinc-800 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${(ludoTokens.player2[0] / 52) * 100}%` }}
                />
              </div>
            </div>

            {/* Big Interactive Dice */}
            <div className="py-4">
              <button
                onClick={rollLudoDice}
                disabled={isRollingLudo}
                className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-950 border-2 border-[#FF007A]/50 text-5xl font-black text-white flex items-center justify-center shadow-xl shadow-[#FF007A]/20 active:scale-95 transition"
              >
                {ludoDice}
              </button>
              <p className="text-xs text-zinc-400 mt-3">
                {isRollingLudo ? 'Rolling...' : `Tap dice to roll (${ludoTurn === 'p1' ? 'Your Turn' : "AI Turn"})`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- 5. SNAKES & GRAVITY LIFTS --- */}
      {activeGame === 'snakes_ladders' && (
        <div className="p-6 rounded-3xl bg-[#0f0f18] border border-white/10 space-y-6 max-w-xl mx-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#FF5500]" />
              Snakes & Gravity Lifts (1-100)
            </h3>
            <button
              onClick={resetSnl}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 rounded-xl text-xs font-mono">
            <span className="text-[#FF007A] font-bold">You: Square #{snlPlayerPos}</span>
            <span className="text-cyan-400 font-bold">AI: Square #{snlAiPos}</span>
          </div>

          {/* Board preview tiles (last 20 squares shown prominently) */}
          <div className="grid grid-cols-10 gap-1.5 text-center text-[10px] font-mono">
            {Array.from({ length: 100 }, (_, i) => 100 - i).slice(0, 30).map((tile) => {
              const hasPlayer = snlPlayerPos === tile;
              const hasAi = snlAiPos === tile;
              return (
                <div
                  key={tile}
                  className={`p-2 rounded-lg border flex flex-col items-center justify-center ${
                    hasPlayer
                      ? 'bg-[#FF007A] text-white border-white shadow-lg'
                      : hasAi
                      ? 'bg-cyan-500 text-black border-white'
                      : ladders[tile]
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : snakes[tile]
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-zinc-900/60 text-zinc-400 border-white/5'
                  }`}
                >
                  <span>{tile}</span>
                  {hasPlayer && <span className="text-[9px] font-bold">YOU</span>}
                  {hasAi && <span className="text-[9px] font-bold">AI</span>}
                </div>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={rollSnlDice}
              disabled={isRollingSnl || snlTurn !== 'player'}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF007A] via-[#FF5500] to-[#FFA000] text-sm font-black text-white shadow-xl shadow-[#FF007A]/20 hover:scale-105 active:scale-95 transition disabled:opacity-50"
            >
              {isRollingSnl ? 'Rolling Dice...' : `Roll Dice (Rolled: ${snlDice})`}
            </button>
          </div>
        </div>
      )}

      {/* --- 6. PYE TYCOON --- */}
      {activeGame === 'monopoly' && (
        <div className="p-6 rounded-3xl bg-[#0f0f18] border border-white/10 space-y-6 max-w-xl mx-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#FFA000]" />
              PYE Tycoon (Universe Monopoly)
            </h3>
            <button
              onClick={resetTycoon}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-zinc-900 border border-[#FF007A]/30">
              <div className="text-zinc-400">Your Holdings</div>
              <div className="text-base font-bold text-[#FF007A]">{tycoonPlayerBalance} SPC</div>
              <div className="text-[10px] text-zinc-500">
                Properties: {tycoonProps.filter((p) => p.owner === 'player').length}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900 border border-cyan-500/30">
              <div className="text-zinc-400">AI Rival Holdings</div>
              <div className="text-base font-bold text-cyan-400">{tycoonAiBalance} SPC</div>
              <div className="text-[10px] text-zinc-500">
                Properties: {tycoonProps.filter((p) => p.owner === 'ai').length}
              </div>
            </div>
          </div>

          {/* Properties Board Track */}
          <div className="grid grid-cols-4 gap-2">
            {tycoonProps.map((prop, idx) => {
              const isPlayerHere = tycoonPlayerPos === idx;
              const isAiHere = tycoonAiPos === idx;
              return (
                <div
                  key={prop.id}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between h-22 ${
                    isPlayerHere
                      ? 'border-[#FF007A] ring-2 ring-[#FF007A]/50 bg-zinc-900'
                      : 'border-white/10 bg-zinc-900/60'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-bold text-zinc-400 truncate">{prop.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      {prop.price > 0 ? `${prop.price} SPC` : 'PASS +200'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className={prop.owner === 'player' ? 'text-[#FF007A] font-bold' : prop.owner === 'ai' ? 'text-cyan-400 font-bold' : 'text-zinc-600'}>
                      {prop.owner ? prop.owner.toUpperCase() : 'FREE'}
                    </span>
                    <div className="flex gap-0.5">
                      {isPlayerHere && <span className="w-2 h-2 rounded-full bg-[#FF007A]" title="You" />}
                      {isAiHere && <span className="w-2 h-2 rounded-full bg-cyan-400" title="AI" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={rollTycoonDice}
              disabled={isRollingTycoon || tycoonTurn !== 'player'}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF007A] to-[#FF5500] text-xs font-bold text-white shadow-lg disabled:opacity-50"
            >
              {isRollingTycoon ? 'Rolling...' : `Roll Dice (${tycoonDice[0]} + ${tycoonDice[1]})`}
            </button>

            {tycoonProps[tycoonPlayerPos].price > 0 && !tycoonProps[tycoonPlayerPos].owner && (
              <button
                onClick={buyTycoonProperty}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-bold text-white shadow-lg"
              >
                Acquire Property ({tycoonProps[tycoonPlayerPos].price} SPC)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
