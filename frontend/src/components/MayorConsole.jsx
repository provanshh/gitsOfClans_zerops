import React, { useState, useMemo } from 'react';
import { ShieldAlert, Key, Loader2, Send } from 'lucide-react';
import { ApiKeyModal } from './ApiKeyModal';

export function MayorConsole({
  clansData = [],
  activeCrew,
  onOpenCrewModal,
  selectedBuilding,
  onDispatchOrder,
  onStampPermit,
  onDenyPermit,
  pendingPermit,
  transmissions = [],
  apiConfig = {},
  onSaveApiConfig,
  autoTypedPrompt
}) {
  const [promptInput, setPromptInput] = useState('');
  const [askMayor, setAskMayor] = useState(true);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Sync typewriter prompt when autoTypedPrompt changes in Auto Demo
  React.useEffect(() => {
    if (autoTypedPrompt !== undefined) {
      setPromptInput(autoTypedPrompt);
    }
  }, [autoTypedPrompt]);

  const clan = clansData[0] || {};
  const totalFiles = clansData.reduce((s, c) => s + (c.total_files || 0), 0);
  const hasApiKey = Boolean(apiConfig?.apiKey);

  // Safely parse layout_json
  const layout = useMemo(() => {
    const raw = clan.layout_json;
    if (!raw) return {};
    if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return {}; } }
    return raw;
  }, [clan.layout_json]);

  const buildings = useMemo(() => Array.isArray(layout?.buildings) ? layout.buildings : [], [layout]);

  const langCounts = useMemo(() => {
    const counts = {};
    buildings.forEach(b => {
      const lang = b.extension || b.language || 'code';
      counts[lang] = (counts[lang] || 0) + 1;
    });
    return counts;
  }, [buildings]);

  const topLangs = Object.entries(langCounts).slice(0, 5);

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    // If no API key configured, prompt user to set one
    if (!hasApiKey) {
      setIsKeyModalOpen(true);
      return;
    }

    setIsDispatching(true);
    try {
      await onDispatchOrder(promptInput.trim());
    } finally {
      setIsDispatching(false);
      setPromptInput('');
    }
  };

  const clanLabel = clan.owner ? `${clan.owner.toUpperCase()}/${(clan.repo || '').toUpperCase()}` : 'CITY';

  return (
    <>
      {/* ── TOP LEFT: City Scan LIVE ── */}
      <div className="hud-top-left">
        <div className="hud-header">
          <div className="hud-title-pulse">
            <span className="pulse-dot" />
            <span className="hud-title">CITY SCAN LIVE</span>
          </div>
          <div className="hud-synced-tag">synced</div>
        </div>
        <div className="hud-big-number">
          {totalFiles || 0}
          <span className="hud-sub-number"> STRUCTURES MAPPED</span>
        </div>
        <div className="hud-lang-pills">
          {topLangs.map(([lang, count]) => (
            <div key={lang} className="lang-pill">
              <span>{lang.slice(0, 6).toUpperCase()}</span> <strong>{count}</strong>
            </div>
          ))}
          {topLangs.length === 0 && <div className="lang-pill"><span>SCANNING</span></div>}
        </div>
      </div>

      {/* ── TOP RIGHT: Clan City ── */}
      <div className="hud-top-right">
        <div className="hud-header-right">
          <span className="clan-title-text">{clanLabel} CLAN</span>
          <div className="hud-status-badge">LIVE</div>
        </div>
        <div className="hud-sub-right">
          PERMITS · MAYOR · {totalFiles} STRUCTURES · {Object.keys(langCounts).length || 0} TYPES
        </div>
        {/* API Key Status */}
        <div
          style={{
            marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
            padding: '3px 8px', background: hasApiKey ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${hasApiKey ? '#10b981' : '#ef4444'}`,
            fontSize: '0.7rem', fontWeight: 700, color: hasApiKey ? '#10b981' : '#ef4444'
          }}
          onClick={() => setIsKeyModalOpen(true)}
        >
          <Key size={12} />
          {hasApiKey ? `API: ${apiConfig.model}` : '⚠ NO API KEY — CLICK TO SET'}
        </div>
      </div>

      {/* ── BOTTOM LEFT: Mayor's Order ── */}
      <div className="hud-bottom-left">
        <div className="mayors-order-header">MAYOR'S ORDER</div>
        <div className="mayors-order-body">
          {/* Crew Selector */}
          <div className="crew-selector-row">
            <div className="crew-info-box" onClick={onOpenCrewModal} title="Click to change crew">
              <span className="crew-avatar">{activeCrew?.avatar || '👷'}</span>
              <div>
                <div className="crew-name">{activeCrew?.title || 'Worker'}</div>
                <div className="crew-effort">{activeCrew?.thinkingLevel || 'HIGH'} effort</div>
              </div>
            </div>
            <div className="permission-toggle-box">
              <span className="perm-label">PERMISSIONS</span>
              <div className="perm-btn-group">
                <button type="button" className={`btn-perm ${askMayor ? 'active' : ''}`} onClick={() => setAskMayor(true)}>ASK MAYOR</button>
                <button type="button" className={`btn-perm ${!askMayor ? 'active' : ''}`} onClick={() => setAskMayor(false)}>DON'T DISTURB</button>
              </div>
            </div>
          </div>

          {/* No API Key Warning Banner */}
          {!hasApiKey && (
            <div
              onClick={() => setIsKeyModalOpen(true)}
              style={{
                padding: '8px 12px', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444',
                borderRadius: 4, marginBottom: 10, cursor: 'pointer',
                fontFamily: 'monospace', fontSize: '0.78rem', color: '#fca5a5',
                display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              <Key size={14} />
              <span>⚠️ No API key configured. <strong style={{ color: '#f87171', textDecoration: 'underline' }}>Click here to set your API key</strong> so edits work in realtime!</span>
            </div>
          )}

          {/* Selected building info */}
          {selectedBuilding && (
            <div style={{ padding: '6px 10px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 4, marginBottom: 8, fontFamily: 'monospace', fontSize: '0.78rem', color: '#fbbf24' }}>
              📁 {selectedBuilding.path || selectedBuilding.name} · {selectedBuilding.lines_of_code || 0} LOC
            </div>
          )}

          {/* Prompt input */}
          <form className="order-input-form" onSubmit={handleDispatch}>
            <span className="prompt-arrow">&gt;</span>
            <input
              type="text"
              className="order-input"
              placeholder={selectedBuilding ? `Edit ${selectedBuilding.name}...` : 'What should the crew build?'}
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              disabled={isDispatching}
            />
            <button type="submit" className="btn-dispatch" disabled={!promptInput.trim() || isDispatching}>
              {isDispatching ? (
                <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> WORKING...</>
              ) : (
                <><Send size={14} /> DISPATCH</>
              )}
            </button>
            <button type="button" className="btn-halt" onClick={() => setPromptInput('')}>HALT</button>
          </form>
        </div>
      </div>

      {/* ── RIGHT SIDE: Mayor Console ── */}
      <div className="mayor-console-right">
        <div className="console-right-header">
          <div className="console-title">{clanLabel} CITY</div>
          <div className="console-subtitle">MAYOR CONSOLE</div>
        </div>

        <div className="console-right-body">
          {/* Crew On Duty */}
          <div className="crew-on-duty-card">
            <div className="duty-avatar">{activeCrew?.avatar || '👷'}</div>
            <div>
              <div className="duty-label">CREW ON DUTY</div>
              <div className="duty-name">{activeCrew?.title || 'Worker'}</div>
              <div className="duty-status">
                {isDispatching ? '🔨 Building in progress...' : pendingPermit ? '⚠️ Awaiting permit stamp' : '✅ Standing by'}
              </div>
            </div>
          </div>

          {/* API Config Card */}
          <div
            onClick={() => setIsKeyModalOpen(true)}
            style={{
              padding: '10px 14px', cursor: 'pointer',
              background: hasApiKey ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${hasApiKey ? '#10b981' : '#ef4444'}`,
              borderRadius: 4, display: 'flex', alignItems: 'center', gap: 10,
              transition: 'all 0.2s ease'
            }}
          >
            <Key size={18} style={{ color: hasApiKey ? '#10b981' : '#ef4444' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>AI ENGINE</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
                {hasApiKey ? apiConfig.model : 'NOT CONFIGURED'}
              </div>
              <div style={{ fontSize: '0.7rem', color: hasApiKey ? '#10b981' : '#ef4444' }}>
                {hasApiKey ? `${apiConfig.baseUrl?.replace('https://', '').split('/')[0]}` : 'Click to configure API key & model'}
              </div>
            </div>
          </div>

          {/* Context Stamina */}
          <div className="stamina-box">
            <div className="stamina-label"><span>CONTEXT STAMINA</span><span>100%</span></div>
            <div className="stamina-bar-bg"><div className="stamina-bar-fill" style={{ width: '100%' }} /></div>
          </div>

          {/* PERMIT - WRITE block */}
          {pendingPermit && (
            <div className="permit-write-box">
              <div className="permit-title">
                <ShieldAlert size={15} /> PERMIT - WRITE
              </div>
              <div className="permit-filepath">{pendingPermit.filePath}</div>
              <p className="permit-desc">{pendingPermit.explanation}</p>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 10 }}>
                +{pendingPermit.additions} added · -{pendingPermit.deletions} removed
              </div>
              <div className="permit-btn-group">
                <button type="button" className="btn-stamp" onClick={() => onStampPermit(pendingPermit)}>✅ STAMP</button>
                <button type="button" className="btn-deny" onClick={() => onDenyPermit(pendingPermit)}>❌ DENY</button>
              </div>
            </div>
          )}

          {/* Transmissions */}
          <div className="transmissions-section">
            <div className="transmissions-header">
              <span>TRANSMISSIONS</span>
              <span className="active-count-badge">{transmissions.length} ACTIVE</span>
            </div>
            <div className="transmissions-list">
              {transmissions.slice(0, 8).map((tx, i) => (
                <div key={i} className="tx-card">
                  <div className="tx-card-header">
                    <span className="tx-sender">{tx.sender}</span>
                    <span className={`tx-status ${tx.status}`}>{tx.status?.toUpperCase()}</span>
                  </div>
                  <div className="tx-text">{tx.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* API Key Modal (accessible from city view too) */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        config={apiConfig}
        onSaveConfig={onSaveApiConfig}
      />
    </>
  );
}
