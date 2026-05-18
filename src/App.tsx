/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Music, 
  Trophy, 
  Gamepad2, 
  Volume2, 
  RefreshCw,
  Heart
} from 'lucide-react';

// --- Constants & Types ---

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const TICK_SPEED = 150;

type Point = { x: number; y: number };

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  url: string;
  cover: string;
}

const DUMMY_TRACKS: Track[] = [
  {
    id: 1,
    title: "Synthwave Dreams",
    artist: "AI Maestro",
    duration: "3:45",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop"
  },
  {
    id: 2,
    title: "Neon Pulse",
    artist: "Cyber Rhythm",
    duration: "4:02",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&h=400&fit=crop"
  },
  {
    id: 3,
    title: "Digital Horizon",
    artist: "Flux Generator",
    duration: "2:58",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=400&h=400&fit=crop"
  }
];

// --- Main Component ---

export default function App() {
  // Game State
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  // Music State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = DUMMY_TRACKS[currentTrackIndex];

  // --- Game Logic ---

  const generateFood = useCallback(() => {
    let newFood: Point;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  }, [snake]);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      // Check collision with self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check if ate food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    const timer = setInterval(moveSnake, TICK_SPEED);
    return () => clearInterval(timer);
  }, [moveSnake]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    generateFood();
  };

  // --- Music Logic ---

  useEffect(() => {
    if (audioRef.current) {
      if (isPlayingMusic) {
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlayingMusic, currentTrackIndex]);

  const togglePlayMusic = () => setIsPlayingMusic(!isPlayingMusic);

  const skipTrack = (dir: 'next' | 'prev') => {
    if (dir === 'next') {
      setCurrentTrackIndex((prev) => (prev + 1) % DUMMY_TRACKS.length);
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + DUMMY_TRACKS.length) % DUMMY_TRACKS.length);
    }
    setIsPlayingMusic(true);
  };

  // --- UI Components ---

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-[#e0e0e0] font-sans overflow-hidden border-8 border-[#1a1a1a]">
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={() => skipTrack('next')}
      />

      {/* Header Section */}
      <header className="h-20 border-b border-[#00FF00]/30 px-8 flex items-center justify-between bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#00FF00] rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(0,255,0,0.4)]">
            <div className="w-6 h-6 border-2 border-[#050505]"></div>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-neon-green uppercase font-display">Synth Snake</h1>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FFFF]/60 leading-none mb-1">Session Node</p>
            <p className="font-mono text-xl text-neon-cyan">ACTIVE_7</p>
          </div>
          <div className="h-10 w-px bg-[#1a1a1a]"></div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#FF00FF]/60 leading-none mb-1">System Status</p>
            <p className="font-mono text-xl text-neon-pink">STABLE</p>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Audio Library */}
        <section className="w-80 border-r border-[#1a1a1a] bg-[#080808] flex flex-col overflow-hidden text-[25px]">
          <div className="p-6 border-b border-[#1a1a1a]">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-neon-cyan mb-4">Audio Library</h2>
            <div className="space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar">
              {DUMMY_TRACKS.map((track, idx) => (
                <div 
                  key={track.id}
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    setIsPlayingMusic(true);
                  }}
                  className={`group p-3 border-l-4 cursor-pointer transition-colors ${
                    currentTrackIndex === idx 
                      ? 'bg-[#111] border-neon-cyan' 
                      : 'border-transparent hover:bg-[#111] hover:border-[#1a1a1a]'
                  } flex justify-between items-center`}
                >
                  <div className="min-w-0 pr-2">
                    <p className={`text-sm font-bold truncate ${currentTrackIndex === idx ? 'text-white' : 'text-gray-400'}`}>
                      {track.title.toUpperCase()}
                    </p>
                    <p className="text-[10px] text-gray-600 uppercase truncate">{track.artist}</p>
                  </div>
                  <span className={`text-[10px] font-mono flex-shrink-0 ${currentTrackIndex === idx ? 'text-neon-cyan' : 'text-gray-600'}`}>
                    {currentTrackIndex === idx ? 'PLAYING' : track.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto p-6 hidden lg:block">
            <div className="aspect-square w-full bg-[#111] border border-[#1a1a1a] flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#00FFFF_0%,_transparent_70%)] group-hover:opacity-40 transition-opacity"></div>
              <p className="text-[10px] font-mono text-neon-cyan mb-2 z-10 transition-all group-hover:neon-text-cyan">WAVEFORM_ANALYSIS</p>
              <div className="flex items-end gap-1 h-24 z-10 relative">
                {[...Array(7)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: isPlayingMusic ? [20, 60, 40, 80, 30] : [20, 25, 20] }}
                    transition={{ duration: 0.5 + Math.random(), repeat: Infinity, delay: i * 0.1 }}
                    className="w-2 bg-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.4)]"
                  />
                ))}
              </div>
              <img 
                src={currentTrack.cover} 
                alt="" 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isPlayingMusic ? 'opacity-20' : 'opacity-0'}`}
              />
            </div>
          </div>
        </section>

        {/* Center Section: Snake Game */}
        <section className="flex-1 flex flex-col items-center justify-center bg-[linear-gradient(rgba(26,26,26,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(26,26,26,0.3)_1px,transparent_1px)] bg-[size:40px_40px]">
          <div className="relative p-4 border-2 border-[#00FF00] shadow-[0_0_50px_rgba(0,255,0,0.15)] bg-[#050505]">
            <div className="absolute -top-6 left-0 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-[#00FF00] animate-pulse"></div>
               <span className="text-[10px] font-mono text-[#00FF00] uppercase tracking-widest">Grid_Active: 800x800</span>
            </div>

            {/* Game Grid */}
            <div className="relative w-[480px] h-[480px] bg-[#050505] overflow-hidden">
               {/* Background Elements */}
               <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 opacity-30 pointer-events-none">
                  {Array.from({ length: 400 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-[#111]" />
                  ))}
               </div>

               {/* Snake */}
               {snake.map((segment, i) => (
                <div
                  key={`${segment.x}-${segment.y}-${i}`}
                  className={`absolute rounded-sm ${
                    i === 0 
                      ? 'bg-[#00FF00] z-10 shadow-[0_0_15px_#00FF00]' 
                      : 'bg-[#00FF00]/40'
                  } border border-[#050505]`}
                  style={{
                    width: `${100 / GRID_SIZE}%`,
                    height: `${100 / GRID_SIZE}%`,
                    left: `${(segment.x * 100) / GRID_SIZE}%`,
                    top: `${(segment.y * 100) / GRID_SIZE}%`,
                  }}
                >
                  {i === 0 && (
                    <div className="w-1 h-1 bg-black absolute top-1 left-1.5"></div>
                  )}
                </div>
              ))}

              {/* Food */}
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute bg-[#FF00FF] rounded-full shadow-[0_0_20px_#FF00FF]"
                style={{
                  width: `${100 / GRID_SIZE}%`,
                  height: `${100 / GRID_SIZE}%`,
                  left: `${(food.x * 100) / GRID_SIZE}%`,
                  top: `${(food.y * 100) / GRID_SIZE}%`,
                }}
              />

              {/* Overlays */}
              <AnimatePresence>
                {gameOver && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#050505]/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 border-4 border-[#FF00FF]/30"
                  >
                    <h2 className="text-6xl font-black italic tracking-tighter text-white mb-2 text-neon-pink">FATAL ERROR</h2>
                    <p className="font-mono text-gray-500 mb-8 uppercase tracking-[0.5em]">Game_Over / Final_Score: {score}</p>
                    <button 
                      onClick={resetGame}
                      className="px-10 py-4 bg-[#FF00FF] hover:bg-[#FF00FF]/80 text-[#050505] font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(255,0,255,0.4)]"
                    >
                      Reboot Core
                    </button>
                  </motion.div>
                )}

                {isPaused && !gameOver && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-transparent flex flex-col items-center justify-center z-20 pointer-events-none"
                  >
                    <div className="bg-[#050505] px-6 py-2 border-2 border-[#00FFFF] text-neon-cyan font-mono tracking-[0.5em] text-sm uppercase">
                      Process_Paused
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute -bottom-6 right-0">
               <span className="text-[10px] font-mono text-[#00FF00]/50 uppercase tracking-widest">Protocol: V.104</span>
            </div>
          </div>
          
          <div className="mt-8 flex gap-8">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">Input Map</span>
              <div className="px-4 py-2 border border-[#00FF00]/30 rounded text-neon-green text-[10px] font-mono uppercase">Arrow Keys / WASD</div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">Action</span>
              <div className="px-4 py-2 border border-[#FF00FF]/30 rounded text-neon-pink text-[10px] font-mono uppercase">Eat Neon Nodes</div>
            </div>
          </div>
        </section>

        {/* Sidebar Right: Score & Player Controls */}
        <section className="w-80 border-l border-[#1a1a1a] bg-[#080808] flex flex-col overflow-hidden">
          <div className="p-8 flex flex-col items-center border-b border-[#1a1a1a]">
            <p className="text-xs font-bold tracking-[0.4em] text-gray-500 uppercase mb-2">Live Bitrate</p>
            <h3 className="text-8xl font-black text-white tracking-tighter font-display leading-tight">{score}</h3>
            <div className="flex items-center gap-2 mt-2">
               <div className="w-2 h-2 rounded-full bg-[#00FF00] animate-pulse shadow-[0_0_5px_#00FF00]"></div>
               <p className="text-xs font-mono text-neon-green tracking-widest uppercase">Sync Established</p>
            </div>
          </div>
          
          <div className="p-8 flex flex-col items-center border-b border-[#1a1a1a]">
            <p className="text-xs font-bold tracking-[0.4em] text-gray-500 uppercase mb-2">High Buffer</p>
            <h3 className="text-4xl font-black text-gray-500 tracking-tighter italic font-display">{highScore.toString().padStart(4, '0')}</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center p-8 space-y-10">
            <div className="flex flex-col items-center gap-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-neon-cyan">Master Volume</p>
              <div className="w-full h-1 bg-[#1a1a1a] rounded-full relative">
                <div className="absolute top-0 left-0 h-full w-[70%] bg-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.5)]"></div>
                <div className="absolute -top-1.5 left-[70%] w-4 h-4 bg-white border-2 border-[#00FFFF] rounded-full shadow-lg"></div>
              </div>
            </div>

            <div className="flex justify-center items-center gap-6">
              <button 
                onClick={() => skipTrack('prev')}
                className="w-10 h-10 border border-[#1a1a1a] flex items-center justify-center hover:border-neon-cyan text-gray-500 transition-colors hover:text-neon-cyan"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>
              
              <button 
                onClick={togglePlayMusic}
                className="w-16 h-16 bg-[#00FFFF] text-[#050505] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:scale-105 active:scale-95 transition-all"
              >
                {isPlayingMusic ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </button>

              <button 
                onClick={() => skipTrack('next')}
                className="w-10 h-10 border border-[#1a1a1a] flex items-center justify-center hover:border-neon-cyan text-gray-500 transition-colors hover:text-neon-cyan"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Bar */}
      <footer className="h-12 border-t border-[#1a1a1a] bg-[#050505] px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">CPU_LOAD: 12%</span>
          <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">SYS_BUFFER: 256MB</span>
          <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">PING: 14MS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00FF00]"></div>
          <span className="text-[9px] font-mono text-[#00FF00] uppercase tracking-[0.3em]">System Broadcast Online</span>
        </div>
      </footer>
    </div>
  );
}

