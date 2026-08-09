import React from 'react';
import { Building2, FileCode, Search, Shield, Play, Bot, Cpu } from 'lucide-react';

const CREW_MODELS = [
  'Claude 3.5 Sonnet (Architect)',
  'Claude 3.7 Sonnet (Advanced)',
  'Claude 3 Opus (Reasoning)',
  'GPT-4o (Fast Summary)'
];

export function Header({
  clansData = [],
  selectedModel,
  onSelectModel,
  onStartLiveConstruction,
  isLiveConstructing,
  onNewScan
}) {
  if (!clansData || clansData.length === 0) return null;

  const clanCount = clansData.length;
  const totalFiles = clansData.reduce((sum, c) => sum + (c.total_files || 0), 0);
  const totalLines = clansData.reduce((sum, c) => sum + (c.total_lines || 0), 0);
  
  const titleText = clanCount === 1 
    ? `${clansData[0].owner}/${clansData[0].repo}` 
    : `${clanCount} City Clans`;

  return (
    <header className="header-bar">
      <div className="brand-logo" onClick={onNewScan}>
        <div className="brand-icon">
          <Building2 size={20} color="#07070e" />
        </div>
        <div className="brand-text">
          Repo<span>City</span>
        </div>
      </div>

      <div className="repo-metrics">
        <div className="metric-badge">
          <Shield size={14} style={{ color: 'var(--accent-green)' }} />
          <span>Active Clan(s):</span>
          <strong style={{ color: '#fff' }}>{titleText}</strong>
        </div>

        {/* Crew Model Selector */}
        <div className="metric-badge" style={{ background: 'rgba(255, 215, 0, 0.1)', borderColor: '#ffd700' }}>
          <Cpu size={14} style={{ color: '#ffd700' }} />
          <span>Crew Model:</span>
          <select
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffd700',
              fontFamily: "'Fira Code', monospace",
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {CREW_MODELS.map((model) => (
              <option key={model} value={model} style={{ background: '#0d1b2a', color: '#fff' }}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Live Construction Animation Button */}
        <button
          className="btn-new-scan"
          style={{ background: isLiveConstructing ? '#00f0ff' : undefined, color: isLiveConstructing ? '#07070e' : undefined }}
          onClick={onStartLiveConstruction}
        >
          {isLiveConstructing ? <Bot size={14} className="spin" /> : <Play size={14} />}
          <span>{isLiveConstructing ? 'Agents Constructing...' : 'Agent Construction'}</span>
        </button>

        <div className="metric-badge">
          <Building2 size={14} />
          <span>Buildings:</span>
          <strong>{totalFiles}</strong>
        </div>

        <button className="btn-new-scan" onClick={onNewScan}>
          <Search size={14} />
          <span>Scan New Batch</span>
        </button>
      </div>
    </header>
  );
}
