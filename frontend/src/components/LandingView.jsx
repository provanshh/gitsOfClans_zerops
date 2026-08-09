import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ApiKeyModal } from './ApiKeyModal';
import { 
  Search, ArrowRight, AlertCircle, Sword, Shield, Cpu, Layers, GitPullRequest, 
  Trophy, Zap, Key, Flame, Castle, Gem, ChevronRight, Pickaxe, Trees, Mountain, 
  Gamepad2, Code2, Eye, Blocks, Bot, Play, Sparkles, Heart, Anchor, Ship, Sparkle,
  Terminal, GitBranch, Brain, Users
} from 'lucide-react';

export function LandingView({ onSubmitRepo, error, isLoading, apiConfig, onSaveApiConfig }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isAutoDemo, setIsAutoDemo] = useState(false);
  const [repoMode, setRepoMode] = useState('single');
  const [musicOn, setMusicOn] = useState(false);
  const [terminalLines, setTerminalLines] = useState([]);
  const audioCtxRef = useRef(null);
  const musicNodesRef = useRef([]);
  const musicTimeoutRef = useRef(null);

  const hasApiKey = apiConfig && apiConfig.key && apiConfig.key.trim() !== '';

  // ── Web Audio helpers ──────────────────────────────────────────────
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((freq, type = 'square', duration = 0.08, vol = 0.15) => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }, [getAudioCtx]);

  const playHoverSound = useCallback(() => playTone(880, 'sine', 0.05, 0.08), [playTone]);
  const playClickSound = useCallback(() => {
    playTone(440, 'square', 0.06, 0.2);
    setTimeout(() => playTone(660, 'square', 0.08, 0.15), 60);
  }, [playTone]);

  // ── Chiptune BGM ──────────────────────────────────────────────────
  const melody = [261, 294, 330, 349, 392, 440, 494, 523, 494, 440, 392, 349, 330, 294];
  const bgmIntervalRef = useRef(null);
  const melodyIdxRef = useRef(0);

  const startBGM = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      if (bgmIntervalRef.current) return;
      bgmIntervalRef.current = setInterval(() => {
        const note = melody[melodyIdxRef.current % melody.length];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.value = note;
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
        melodyIdxRef.current++;
      }, 380);
    } catch (e) {}
  }, [getAudioCtx]);

  const stopBGM = useCallback(() => {
    if (bgmIntervalRef.current) {
      clearInterval(bgmIntervalRef.current);
      bgmIntervalRef.current = null;
    }
  }, []);

  const toggleMusic = () => {
    playClickSound();
    if (musicOn) {
      stopBGM();
      setMusicOn(false);
    } else {
      startBGM();
      setMusicOn(true);
    }
  };

  useEffect(() => () => stopBGM(), [stopBGM]);

  // ── Terminal animation for Problems section ────────────────────────
  const terminalContent = [
    '$ git log --oneline --graph | head -50',
    '> ERROR: Cannot parse 14,000 commits mentally',
    '$ cat src/components/App.jsx | wc -l',
    '> 3,847 lines — impossible to review manually',
    '$ gh pr list --state open',
    '> 47 open PRs — which one breaks production?',
    '$ find . -name "*.js" | xargs grep "TODO"',
    '> 892 TODOs across 140 files — technical debt unknown',
    '// SOLUTION: gits-of-clans --spawn --visualize --ai',
    '> Village built. 3D world ready. AI crew standing by... ✓',
  ];

  useEffect(() => {
    let timer;
    const runTerminal = () => {
      let i = 0;
      setTerminalLines([]);
      const tick = () => {
        if (i < terminalContent.length) {
          const line = terminalContent[i];
          setTerminalLines(prev => [...prev, line]);
          i++;
          timer = setTimeout(tick, 600);
        } else {
          timer = setTimeout(runTerminal, 3500);
        }
      };
      timer = setTimeout(tick, 400);
    };
    runTerminal();
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    playClickSound();
    const finalRepo = repoUrl.trim() || 'expressjs/express';
    onSubmitRepo(finalRepo);
  };

  const handlePresetClick = (url) => {
    playClickSound();
    setRepoUrl(url);
    if (url.includes(',')) {
      setRepoMode('multi');
    } else {
      setRepoMode('single');
    }
    onSubmitRepo(url);
  };

  const startAutoDemo = () => {
    playClickSound();
    setIsAutoDemo(true);
    setRepoUrl('');
    const targetText = 'expressjs/express';
    let currentIndex = 0;

    const typeChar = () => {
      if (currentIndex < targetText.length) {
        setRepoUrl(targetText.substring(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeChar, 40);
      } else {
        setTimeout(() => {
          onSubmitRepo(targetText, true);
        }, 300);
      }
    };
    
    typeChar();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Pixelify+Sans:wght@400;600;700&family=Press+Start+2P&family=Share+Tech+Mono&family=VT323&display=swap');

        .gits-landing-container {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          width: 100vw;
          height: 100vh;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          background: linear-gradient(180deg, rgba(10, 25, 12, 0.7) 0%, rgba(15, 35, 18, 0.85) 50%, rgba(8, 18, 9, 0.95) 100%), url('/minecraft_bg.jpg') center/cover no-repeat fixed;
          font-family: 'VT323', monospace;
          color: white;
          display: flex;
          flex-direction: column;
          z-index: 100;
          pointer-events: auto !important;
          -webkit-overflow-scrolling: touch;
        }

        .pixel-particles {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: #4CAF35;
          bottom: -10px;
          animation: floatUp 15s linear infinite;
          box-shadow: inset -2px -2px 0 rgba(0,0,0,0.3);
        }
        
        .particle.gold { background-color: #FF9D19; animation-duration: 12s; }
        .particle.diamond { background-color: #42A5E8; animation-duration: 18s; }

        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }

        .gits-content-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-bottom: 40px;
        }

        .gits-header {
          width: 100%;
          padding: 12px 24px;
          background: #2b180d;
          border-bottom: 4px solid #1c0e06;
          box-shadow: 0 8px 16px rgba(0,0,0,0.6), inset 0 -3px 0 #120904, inset 0 3px 0 #5c3820;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 20;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .grass-block-icon {
          width: 32px;
          height: 32px;
          background: #6B3F20;
          border-top: 10px solid #4CAF35;
          box-shadow: inset -4px -4px 0 rgba(0,0,0,0.3), inset 4px 0 0 rgba(255,255,255,0.2);
          image-rendering: pixelated;
        }

        .header-title {
          font-family: 'Press Start 2P', monospace;
          font-size: 1.2rem;
          color: white;
          text-shadow: 3px 3px 0 #000;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .version-tag {
          background: #FF9D19;
          color: #000;
          font-size: 0.7rem;
          padding: 2px 6px;
          border: 2px solid #000;
        }

        .wooden-badge {
          background: #163B20;
          border: 2px solid #0a1c0f;
          padding: 4px 8px;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 0.9rem;
          color: #72D34A;
          box-shadow: inset 2px 2px 0 rgba(255,255,255,0.1);
        }

        .wooden-btn {
          background: linear-gradient(180deg, #FFB733 0%, #FF9D19 50%, #D66800 100%);
          border: none;
          border-top: 3px solid #FFD685;
          border-bottom: 5px solid #803B00;
          border-left: 3px solid #E68A00;
          border-right: 3px solid #E68A00;
          color: white;
          font-family: 'Pixelify Sans', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          padding: 8px 16px;
          cursor: pointer;
          text-shadow: 1px 1px 0 #000;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.1s, filter 0.1s;
        }

        .wooden-btn:hover {
          filter: brightness(1.1);
        }
        
        .wooden-btn:active {
          transform: translateY(4px);
          border-bottom-width: 1px;
          margin-top: 4px;
        }

        .hero-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 60px;
          text-align: center;
          position: relative;
        }

        .banner-pill {
          background: rgba(0, 0, 0, 0.6);
          border: 2px solid #3d2314;
          padding: 8px 24px;
          border-radius: 20px;
          font-family: 'Share Tech Mono', monospace;
          color: #FF9D19;
          font-size: 1rem;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }

        .giant-title {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 6rem;
          font-weight: 700;
          color: white;
          margin: 0;
          line-height: 1.1;
          text-shadow: 
            0 4px 0 #6B3F20,
            0 8px 0 #3d2314,
            0 12px 24px rgba(0,0,0,0.8);
          letter-spacing: 2px;
          position: relative;
        }

        .lantern {
          position: absolute;
          top: -20px;
          font-size: 2rem;
          animation: swing 3s ease-in-out infinite alternate;
          transform-origin: top center;
        }
        .lantern.left { left: -60px; }
        .lantern.right { right: -60px; }

        @keyframes swing {
          0% { transform: rotate(-10deg); }
          100% { transform: rotate(10deg); }
        }

        .subtitle-box {
          background: rgba(22, 59, 32, 0.8);
          border: 2px solid #4CAF35;
          padding: 12px 32px;
          margin-top: 24px;
          font-size: 1.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }

        .demo-cta-container {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .demo-btn {
          background: linear-gradient(180deg, #FFB733 0%, #FF9D19 40%, #D66800 100%);
          border: none;
          border-top: 3px solid #FFD685;
          border-bottom: 5px solid #803B00;
          border-left: 3px solid #E68A00;
          border-right: 3px solid #E68A00;
          color: white;
          font-family: 'Press Start 2P', monospace;
          font-size: 1.2rem;
          padding: 16px 32px;
          cursor: pointer;
          text-shadow: 2px 2px 0 #000;
          box-shadow: 0 8px 24px rgba(255, 157, 25, 0.4);
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s;
        }

        .demo-btn:hover {
          transform: scale(1.05);
          filter: brightness(1.2);
        }

        .demo-btn:active {
          transform: scale(1.05) translateY(4px);
          border-bottom-width: 1px;
          margin-top: 4px;
          box-shadow: 0 4px 12px rgba(255, 157, 25, 0.4);
        }

        .demo-subtitle {
          margin-top: 12px;
          color: #FFD685;
          font-family: 'Share Tech Mono', monospace;
          font-size: 1.1rem;
        }

        .stats-strip {
          display: flex;
          gap: 20px;
          margin-top: 60px;
          width: 100%;
          max-width: 1000px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .stat-card {
          background: #2b180d;
          border: 4px solid #140a05;
          box-shadow: inset 3px 3px 0 #5c3820, inset -3px -3px 0 #120904, 0 8px 16px rgba(0,0,0,0.6);
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 200px;
        }

        .stat-value {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: #FFD685;
          text-shadow: 2px 2px 0 #000;
          margin-bottom: 4px;
        }

        .stat-label {
          font-family: 'VT323', monospace;
          font-size: 1.2rem;
          color: #a38c7a;
          letter-spacing: 1px;
        }

        .parchment-scroll {
          background: #e8d5b5;
          border: 4px solid #8b6b4a;
          box-shadow: inset 0 0 20px rgba(139, 107, 74, 0.5), 0 8px 16px rgba(0,0,0,0.5);
          padding: 24px 40px;
          margin-top: 40px;
          max-width: 800px;
          position: relative;
        }

        .parchment-scroll::before, .parchment-scroll::after {
          content: '';
          position: absolute;
          left: -10px;
          right: -10px;
          height: 16px;
          background: #5c3820;
          border: 2px solid #2b180d;
          border-radius: 8px;
        }
        
        .parchment-scroll::before { top: -10px; }
        .parchment-scroll::after { bottom: -10px; }

        .parchment-text {
          font-family: 'Fira Code', monospace;
          font-weight: 600;
          color: #2b180d;
          font-size: 1.1rem;
          line-height: 1.6;
          text-align: center;
          margin: 0;
        }

        .crafting-station {
          background: #3a2213;
          border: 4px solid #1c0e06;
          box-shadow: inset 3px 3px 0 #5c3820, inset -3px -3px 0 #120904, 0 16px 40px rgba(0,0,0,0.8);
          width: 100%;
          max-width: 820px;
          margin-top: 60px;
          padding: 32px;
          position: relative;
        }

        .character-prop {
          position: absolute;
          bottom: 100%;
          font-size: 4rem;
          filter: drop-shadow(0 4px 0 rgba(0,0,0,0.5));
          z-index: 5;
        }
        .steve-prop { left: 40px; }
        .wolf-prop { right: 40px; transform: scaleX(-1); }

        .mode-toggle {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .mode-btn {
          background: #2b180d;
          border: 2px solid #140a05;
          color: #a38c7a;
          font-family: 'VT323', monospace;
          font-size: 1.4rem;
          padding: 8px 20px;
          cursor: pointer;
          box-shadow: inset 2px 2px 0 #5c3820;
          transition: all 0.2s;
        }

        .mode-btn.active {
          background: #4CAF35;
          color: white;
          border-color: #163B20;
          border-top: 3px solid #72D34A;
          box-shadow: inset 0 -3px 0 #2E7D32, 0 4px 8px rgba(0,0,0,0.5);
          text-shadow: 1px 1px 0 #000;
        }

        .input-group {
          background: #140c07;
          border: 3px solid #2b180d;
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          padding: 8px 16px;
          margin-bottom: 16px;
        }

        .input-icon {
          color: #FFD685;
          margin-right: 12px;
        }

        .repo-input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-family: 'Share Tech Mono', monospace;
          font-size: 1.5rem;
          outline: none;
        }
        
        .repo-input::placeholder {
          color: #5c3820;
        }

        .helper-text {
          font-family: 'VT323', monospace;
          color: #FFD685;
          font-size: 1.2rem;
          margin-bottom: 24px;
          text-align: center;
        }

        .action-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-bottom: 24px;
        }

        .primary-cta {
          background: linear-gradient(180deg, #66BB6A 0%, #4CAF35 50%, #2E7D32 100%);
          border: none;
          border-top: 3px solid #81C784;
          border-bottom: 5px solid #1B5E20;
          border-left: 3px solid #4CAF35;
          border-right: 3px solid #4CAF35;
          color: white;
          font-family: 'Press Start 2P', monospace;
          font-size: 1.1rem;
          padding: 16px 32px;
          cursor: pointer;
          text-shadow: 2px 2px 0 #000;
          box-shadow: 0 6px 16px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          justify-content: center;
          transition: all 0.1s;
        }

        .primary-cta:hover { filter: brightness(1.1); }
        .primary-cta:active {
          transform: translateY(4px);
          border-bottom-width: 1px;
          margin-top: 4px;
        }

        .secondary-cta {
          flex: 0.6;
          justify-content: center;
        }

        .error-banner {
          background: #3b0909;
          border: 2px solid #ff4444;
          color: #ff9999;
          padding: 12px;
          font-family: 'Share Tech Mono', monospace;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: inset 0 0 10px rgba(255,0,0,0.3);
        }

        .presets-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .preset-btn {
          background: #2b180d;
          border: 2px solid #140a05;
          color: #d1bfae;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 1.1rem;
          padding: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: inset 2px 2px 0 #5c3820;
          transition: all 0.2s;
        }

        .preset-btn:hover {
          background: #3d2314;
          color: white;
        }

        .features-section {
          margin-top: 80px;
          width: 100%;
          max-width: 1000px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .features-header {
          font-family: 'Press Start 2P', monospace;
          color: white;
          font-size: 1.5rem;
          text-shadow: 3px 3px 0 #000;
          margin-bottom: 12px;
          text-align: center;
        }

        .features-subtitle {
          font-family: 'VT323', monospace;
          color: #a38c7a;
          font-size: 1.5rem;
          margin-bottom: 40px;
          text-align: center;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          width: 100%;
        }

        .feature-card {
          background: #2b180d;
          border: 4px solid #140a05;
          padding: 24px;
          box-shadow: inset 3px 3px 0 #5c3820, inset -3px -3px 0 #120904, 0 8px 16px rgba(0,0,0,0.5);
        }

        .feature-title {
          font-family: 'Pixelify Sans', sans-serif;
          color: #FFD685;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          text-shadow: 1px 1px 0 #000;
        }

        .feature-desc {
          font-family: 'VT323', monospace;
          color: #d1bfae;
          font-size: 1.2rem;
          line-height: 1.4;
          margin: 0;
        }

        .hud-footer {
          margin-top: 80px;
          width: 100%;
          background: rgba(0,0,0,0.8);
          border-top: 4px solid #1c0e06;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          position: relative;
          z-index: 20;
        }

        .hearts-row {
          display: flex;
          gap: 4px;
          color: #ff4444;
        }

        .xp-bar-container {
          width: 400px;
          height: 12px;
          background: #000;
          border: 2px solid #1c0e06;
          position: relative;
        }

        .xp-bar-fill {
          width: 100%;
          height: 100%;
          background: #72D34A;
          box-shadow: inset 0 4px 0 rgba(255,255,255,0.4);
        }

        .xp-level {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          color: #72D34A;
          font-family: 'Press Start 2P', monospace;
          font-size: 1rem;
          text-shadow: 2px 2px 0 #000;
        }

        .footer-text {
          font-family: 'VT323', monospace;
          color: #a38c7a;
          font-size: 1.2rem;
          text-align: center;
        }
        
        .footer-copyright {
          font-family: 'VT323', monospace;
          color: #5c3820;
          font-size: 1rem;
        }

        /* ── Music Button ─────────────────────────────────────────── */
        .music-toggle-btn {
          background: #1c0e06;
          border: 2px solid #5c3820;
          border-top: 2px solid #8b6534;
          color: #FFD685;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 1rem;
          padding: 6px 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
          box-shadow: inset 2px 2px 0 rgba(255,255,255,0.08);
        }
        .music-toggle-btn:hover { background: #2b180d; color: #fff; }
        .music-toggle-btn.playing {
          background: #163B20;
          border-color: #4CAF35;
          color: #72D34A;
          box-shadow: 0 0 12px rgba(114,211,74,0.4), inset 2px 2px 0 rgba(255,255,255,0.1);
        }

        /* ── Problems Section ─────────────────────────────────────── */
        .problems-section {
          margin-top: 80px;
          width: 100%;
          max-width: 1000px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .problems-header-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 8px;
        }

        .problems-title {
          font-family: 'Share Tech Mono', monospace;
          color: #72D34A;
          font-size: 1.8rem;
          margin: 0;
          text-shadow: 0 0 20px rgba(114,211,74,0.4);
          letter-spacing: 1px;
        }

        .problems-subtitle {
          font-family: 'Share Tech Mono', monospace;
          color: #5c3820;
          font-size: 1rem;
          margin-bottom: 32px;
          text-align: center;
        }

        .terminal-window {
          width: 100%;
          background: #0d1117;
          border: 2px solid #30363d;
          border-radius: 6px;
          margin-bottom: 40px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.8);
        }

        .terminal-titlebar {
          background: #21262d;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid #30363d;
        }

        .terminal-dot {
          width: 12px; height: 12px;
          border-radius: 50%;
          display: inline-block;
        }
        .terminal-dot.red    { background: #ff5f57; }
        .terminal-dot.yellow { background: #ffbd2e; }
        .terminal-dot.green  { background: #28ca41; }

        .terminal-title {
          font-family: 'Share Tech Mono', monospace;
          color: #8b949e;
          font-size: 0.85rem;
          margin-left: 8px;
        }

        .terminal-body {
          padding: 16px 20px;
          min-height: 180px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.95rem;
          line-height: 1.7;
        }

        .terminal-line {
          display: block;
          animation: fadeInLine 0.2s ease-out;
        }

        .terminal-line.command { color: #e6edf3; }
        .terminal-line.output  { color: #f85149; }
        .terminal-line.solution { color: #72D34A; font-weight: bold; text-shadow: 0 0 10px rgba(114,211,74,0.5); }

        @keyframes fadeInLine {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cursor-blink {
          animation: cursorBlink 0.8s step-end infinite;
          color: #72D34A;
        }

        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        /* ── Problem Cards ────────────────────────────────────────── */
        .problems-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          width: 100%;
        }

        .problem-card {
          background: #0d1117;
          border: 1px solid #30363d;
          border-left: 4px solid #72D34A;
          padding: 24px;
          position: relative;
          transition: border-color 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }

        .problem-card:nth-child(2) { border-left-color: #42A5E8; }
        .problem-card:nth-child(3) { border-left-color: #FF9D19; }
        .problem-card:nth-child(4) { border-left-color: #FF4081; }

        .problem-card:hover {
          box-shadow: 0 0 20px rgba(114,211,74,0.15);
          border-color: #58a6ff;
          border-left-color: inherit;
        }

        .problem-number {
          position: absolute;
          top: 16px;
          right: 16px;
          font-family: 'Press Start 2P', monospace;
          font-size: 1.8rem;
          color: #21262d;
          font-weight: 900;
        }

        .problem-icon-wrap {
          margin-bottom: 12px;
        }

        .problem-card-title {
          font-family: 'Pixelify Sans', sans-serif;
          color: #e6edf3;
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0 0 12px 0;
        }

        .problem-code {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 4px;
          padding: 10px 14px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.85rem;
          color: #8b949e;
          margin-bottom: 12px;
          white-space: pre;
          line-height: 1.6;
        }

        .problem-card-desc {
          font-family: 'VT323', monospace;
          color: #8b949e;
          font-size: 1.1rem;
          line-height: 1.4;
          margin: 0 0 12px 0;
        }

        .problem-solution {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.9rem;
          color: #8b949e;
        }

        .problem-solution span {
          color: #72D34A;
          font-weight: bold;
        }
      `}</style>

      <div className="gits-landing-container">
        {/* Floating Particles */}
        <div className="pixel-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className={`particle ${i % 3 === 0 ? 'gold' : i % 5 === 0 ? 'diamond' : ''}`}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 15}s`
              }}
            />
          ))}
        </div>

        {/* Header Bar */}
        <header className="gits-header">
          <div className="header-left">
            <div className="grass-block-icon" />
            <h1 className="header-title">
              GITS OF CLANS
              <span className="version-tag">v2.0</span>
            </h1>
            <div className="wooden-badge">MINECRAFT REPOSITORY VILLAGE</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className={`music-toggle-btn ${musicOn ? 'playing' : ''}`}
              onClick={toggleMusic}
              title={musicOn ? 'Stop Music' : 'Play Music'}
            >
              {musicOn ? '🔊 BGM ON' : '🔇 BGM OFF'}
            </button>
            <button className="wooden-btn" onClick={() => { playClickSound(); setIsKeyModalOpen(true); }} onMouseEnter={playHoverSound}>
              <Key size={18} />
              API Key: {hasApiKey ? apiConfig.model : 'Not Set'}
            </button>
          </div>
        </header>

        <div className="gits-content-wrapper">
          
          {/* Hero Section */}
          <div className="hero-section">
            <div className="banner-pill">
              ⚔️ CLASH OF REPOSITORIES · 3D MINECRAFT VILLAGES · AI-POWERED
            </div>
            <h1 className="giant-title">
              <span className="lantern left">🏮</span>
              GITS OF CLANS
              <span className="lantern right">🏮</span>
            </h1>
            <div className="subtitle-box">
              Transform GitHub repos into 🟩 living 3D Minecraft villages
            </div>
          </div>

          {/* Main Demo CTA */}
          <div className="demo-cta-container">
            <button className="demo-btn" onClick={startAutoDemo} onMouseEnter={playHoverSound} disabled={isLoading || isAutoDemo}>
              <Play size={24} fill="currentColor" /> 🎮 RUN AUTOMATIC GUIDED DEMO
            </button>
            <div className="demo-subtitle">▶ Watch the full AI workflow in action</div>
          </div>

          {/* Stats Strip */}
          <div className="stats-strip">
            <div className="stat-card">
              <div className="stat-value">🏆 1,337</div>
              <div className="stat-label">CLAN TROPHIES</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">🏰 24,800+</div>
              <div className="stat-label">VILLAGES SPAWNED</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">💎 100%</div>
              <div className="stat-label">REALTIME EXTRUSION</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">🔥 AI POWERED</div>
              <div className="stat-label">CREW BUILDERS</div>
            </div>
          </div>

          {/* Description Parchment Scroll */}
          <div className="parchment-scroll">
            <p className="parchment-text">
              ⚡ Your code files become towering voxel buildings. PRs become pirate galleons. AI crews edit code in real-time.
            </p>
          </div>

          {/* Crafting Station Panel */}
          <div className="crafting-station">
            <div className="character-prop steve-prop">🧑‍🌾</div>
            <div className="character-prop wolf-prop">🐺</div>

            <div className="mode-toggle">
              <button 
                className={`mode-btn ${repoMode === 'single' ? 'active' : ''}`}
                onClick={() => setRepoMode('single')}
              >
                🟩 Single Repo
              </button>
              <button 
                className={`mode-btn ${repoMode === 'multi' ? 'active' : ''}`}
                onClick={() => setRepoMode('multi')}
              >
                📦📦 Multiple Repos
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <Search className="input-icon" size={28} />
                <input
                  type="text"
                  className="repo-input"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder={repoMode === 'single' ? "e.g. expressjs/express" : "e.g. facebook/react, expressjs/express"}
                  disabled={isLoading || isAutoDemo}
                />
              </div>

              {repoMode === 'multi' && (
                <div className="helper-text">
                  💡 Separate multiple repos with commas for archipelago comparison
                </div>
              )}

              {error && (
                <div className="error-banner">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <div className="action-buttons">
                <button type="submit" className="primary-cta" disabled={isLoading || isAutoDemo}>
                  <Pickaxe size={24} />
                  {isLoading ? 'GENERATING WORLD...' : 'SPAWN VILLAGE'}
                </button>
                <button type="button" className="wooden-btn secondary-cta" onClick={() => setIsKeyModalOpen(true)}>
                  <Key size={20} />
                  SET API KEY
                </button>
              </div>
            </form>

            <div className="presets-grid">
              <button className="preset-btn" onClick={() => handlePresetClick('facebook/react')} disabled={isLoading || isAutoDemo}>
                🛡️ React
              </button>
              <button className="preset-btn" onClick={() => handlePresetClick('expressjs/express')} disabled={isLoading || isAutoDemo}>
                ⚡ Express
              </button>
              <button className="preset-btn" onClick={() => handlePresetClick('facebook/react, expressjs/express')} disabled={isLoading || isAutoDemo}>
                ⚔️ React + Express
              </button>
              <button className="preset-btn" onClick={() => handlePresetClick('vuejs/core, psf/black')} disabled={isLoading || isAutoDemo}>
                🐉 Vue + Black
              </button>
            </div>
          </div>

          {/* Problems We Solve — Terminal Section */}
          <div className="problems-section">
            <div className="problems-header-row">
              <Terminal size={28} color="#72D34A" />
              <h2 className="problems-title">// PROBLEMS_WE_SOLVE.md</h2>
            </div>
            <p className="problems-subtitle">{'/* Every developer hits these walls. We built the way through. */'}</p>

            <div className="terminal-window">
              <div className="terminal-titlebar">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
                <span className="terminal-title">gits-of-clans — bash — 120×40</span>
              </div>
              <div className="terminal-body">
                {terminalLines.filter(line => typeof line === 'string').map((line, i) => (
                  <div key={i} className={`terminal-line ${line.startsWith('>') ? 'output' : line.startsWith('//') ? 'solution' : 'command'}`}>
                    {line}
                    {i === terminalLines.length - 1 && <span className="cursor-blink">█</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="problems-grid">
              <div className="problem-card">
                <div className="problem-number">01</div>
                <div className="problem-icon-wrap"><Terminal size={32} color="#72D34A" /></div>
                <h3 className="problem-card-title">Codebase Blindness</h3>
                <pre className="problem-code">{`// You have 200 files.
// Which one matters?
// You have no idea.`}</pre>
                <p className="problem-card-desc">Large repos feel like black boxes. No mental map. No visual hierarchy. Just flat file trees and grep.</p>
                <div className="problem-solution">{'→ '}<span>3D villages where size = complexity</span></div>
              </div>

              <div className="problem-card">
                <div className="problem-number">02</div>
                <div className="problem-icon-wrap"><GitBranch size={32} color="#42A5E8" /></div>
                <h3 className="problem-card-title">PR Review Hell</h3>
                <pre className="problem-code">{`// 47 open PRs.
// Each touches 30 files.
// Reviewer burnout: 100%`}</pre>
                <p className="problem-card-desc">Pull requests are invisible until they break prod. No spatial context. No visual diff. Just raw diffs.</p>
                <div className="problem-solution">{'→ '}<span>PRs become visible pirate ships docking</span></div>
              </div>

              <div className="problem-card">
                <div className="problem-number">03</div>
                <div className="problem-icon-wrap"><Brain size={32} color="#FF9D19" /></div>
                <h3 className="problem-card-title">AI Edit Risk</h3>
                <pre className="problem-code">{`// AI changes 12 files.
// You approved blindly.
// Production is down.`}</pre>
                <p className="problem-card-desc">Current AI coding tools make changes without visual feedback. You can't see the blast radius until it's too late.</p>
                <div className="problem-solution">{'→ '}<span>Watch buildings change in real-time, approve with Mayor Stamp</span></div>
              </div>

              <div className="problem-card">
                <div className="problem-number">04</div>
                <div className="problem-icon-wrap"><Users size={32} color="#FF4081" /></div>
                <h3 className="problem-card-title">Multi-Repo Chaos</h3>
                <pre className="problem-code">{`// frontend/ backend/ infra/
// How do they relate?
// Nobody actually knows.`}</pre>
                <p className="problem-card-desc">Comparing multiple repos means switching contexts, reading READMEs, and guessing. No unified view exists.</p>
                <div className="problem-solution">{'→ '}<span>Archipelago of floating islands, side-by-side</span></div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="features-section">
            <h2 className="features-header">⚔️ WHY GITS OF CLANS? ⚔️</h2>
            <div className="features-subtitle">The ultimate fusion of version control and 3D base building.</div>
            
            <div className="features-grid">
              <div className="feature-card">
                <h3 className="feature-title"><Castle size={24} color="#FFD685" /> Voxel Skyscraper Buildings</h3>
                <p className="feature-desc">Files become buildings based on complexity. Deep directories form nested town squares.</p>
              </div>
              <div className="feature-card">
                <h3 className="feature-title"><Shield size={24} color="#FFD685" /> Archipelago Multi-Clan Wars</h3>
                <p className="feature-desc">Compare multiple repos side-by-side in a sprawling ocean archipelago.</p>
              </div>
              <div className="feature-card">
                <h3 className="feature-title"><Ship size={24} color="#FFD685" /> PR Pirate Galleons</h3>
                <p className="feature-desc">Watch active pull requests dock at your repository port as heavily armed ships.</p>
              </div>
              <div className="feature-card">
                <h3 className="feature-title"><Bot size={24} color="#FFD685" /> Realtime AI Crew Edits</h3>
                <p className="feature-desc">Summon AI workers to edit code files and watch the buildings physically change in 3D.</p>
              </div>
            </div>
          </div>

        </div>

        {/* HUD Footer */}
        <footer className="hud-footer">
          <div className="hearts-row">
            {Array.from({ length: 10 }).map((_, i) => (
              <Heart key={i} size={24} fill="currentColor" />
            ))}
          </div>
          <div className="xp-bar-container">
            <div className="xp-level">LVL 99</div>
            <div className="xp-bar-fill"></div>
          </div>
          <div className="footer-text">Built for developers. Powered by AI. Crafted in Minecraft.</div>
          <div className="footer-copyright">© 2026 Gits of Clans · Open Source · Built with ❤️ for the Dev Community.</div>
        </footer>

        {isKeyModalOpen && (
          <ApiKeyModal 
            isOpen={isKeyModalOpen} 
            onClose={() => setIsKeyModalOpen(false)} 
            apiConfig={apiConfig}
            onSaveApiConfig={onSaveApiConfig}
          />
        )}
      </div>
    </>
  );
}
