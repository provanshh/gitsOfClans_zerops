import React, { useState, useEffect } from 'react';
import { LandingView } from './components/LandingView';
import { LoadingScreen } from './components/LoadingScreen';
import { CityCanvas } from './components/CityCanvas';
import { MayorConsole } from './components/MayorConsole';
import { CrewModal } from './components/CrewModal';
import { ApiKeyModal } from './components/ApiKeyModal';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';
const WORKING_OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

const DEFAULT_CREW = {
  id: 'worker',
  title: 'Worker',
  subtitle: 'Site foreman · gpt-4o',
  avatar: '👷',
  thinkingLevel: 'HIGH'
};

const ARCHITECT_CREW = {
  id: 'architect',
  title: 'Architect',
  subtitle: 'Master builder · claude-3.5',
  avatar: '🧙',
  thinkingLevel: 'HIGH'
};

export default function App() {
  const [clansData, setClansData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [activeCrew, setActiveCrew] = useState(DEFAULT_CREW);
  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [pendingPermit, setPendingPermit] = useState(null);
  const [isLiveConstructing, setIsLiveConstructing] = useState(false);
  const [constructionProgress, setConstructionProgress] = useState(1.0);

  // Automated Guided Demo states
  const [isAutoDemoActive, setIsAutoDemoActive] = useState(false);
  const [isAutoRevolving, setIsAutoRevolving] = useState(false);
  const [autoDemoBanner, setAutoDemoBanner] = useState(null);
  const [autoTypedPrompt, setAutoTypedPrompt] = useState('');
  const [zoomToBuilding, setZoomToBuilding] = useState(null);

  // Custom API Key & Model config state (default to working OpenRouter key if empty)
  const [apiConfig, setApiConfig] = useState(() => {
    const defaults = {
      apiKey: WORKING_OPENROUTER_KEY,
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'openai/gpt-4o',
      provider: 'openrouter'
    };
    try {
      const saved = localStorage.getItem('gits_of_clans_api_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaults,
          ...parsed,
          apiKey: parsed.apiKey || WORKING_OPENROUTER_KEY,
          baseUrl: parsed.baseUrl?.includes('openrouter.ai') ? parsed.baseUrl : 'https://openrouter.ai/api/v1'
        };
      }
    } catch {}
    return defaults;
  });

  const [transmissions, setTransmissions] = useState([
    { sender: 'SYSTEM', status: 'active', text: 'Gits of Clans Mayor Console initialized. OpenRouter engine online.' }
  ]);

  const handleSaveApiConfig = (newConfig) => {
    const updated = {
      ...newConfig,
      apiKey: newConfig.apiKey || WORKING_OPENROUTER_KEY
    };
    setApiConfig(updated);
    try {
      localStorage.setItem('gits_of_clans_api_config', JSON.stringify(updated));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
    addTransmission('SYSTEM', 'active', `OpenRouter Config updated: Model ${updated.model}`);
  };

  // ── Helpers ──────────────────────────────────────────────
  const addTransmission = (sender, status, text) =>
    setTransmissions(prev => [{ sender, status, text }, ...prev].slice(0, 20));

  const triggerConstruction = () => {
    setIsLiveConstructing(true);
    setConstructionProgress(0.05);
    let p = 0.05;
    const iv = setInterval(() => {
      p = Math.min(1.0, p + 0.07);
      setConstructionProgress(p);
      if (p >= 1.0) { setIsLiveConstructing(false); clearInterval(iv); }
    }, 100);
  };

  // ── Fetch city clans ──────────────────────────────────────
  const handleFetchCity = async (input, isAuto = false) => {
    setIsLoading(true);
    setError(null);
    setSelectedBuilding(null);
    setPendingPermit(null);
    setClansData([]);

    if (isAuto) {
      setIsAutoDemoActive(true);
      setAutoDemoBanner('🎥 STEP 1/5: Spawning 3D Village and initializing camera...');
    }

    try {
      const res = await fetch(`${API_BASE}/city`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: input || 'facebook/react' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch city.');

      const clans = Array.isArray(data.clans) ? data.clans : [data];
      setClansData(clans);
      triggerConstruction();
      addTransmission('MAYOR', 'active', `Village built for ${input || 'facebook/react'} — ${clans[0]?.total_files || 0} structures mapped.`);

      // If Auto Demo is active, run the 3D auto-revolve and auto-edit workflow
      if (isAuto || isAutoDemoActive) {
        run3DAutoDemoWorkflow(clans[0]);
      }
    } catch (err) {
      setError(err.message);
      addTransmission('SYSTEM', 'error', `Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ── 3D Auto Demo Sequence ──
  const run3DAutoDemoWorkflow = (clan) => {
    setIsAutoRevolving(true);
    setAutoDemoBanner('🎥 STEP 1/5: 3D Camera revolving village skyline...');

    setTimeout(() => {
      // Step 2: Auto Select Architect Crew
      setActiveCrew(ARCHITECT_CREW);
      setAutoDemoBanner('🧙 STEP 2/5: Selected Master Architect Crew Specialist');
      addTransmission('MAYOR', 'active', 'AUTO DEMO: Crew set to Architect (Master Builder)');

      setTimeout(() => {
        // Step 3: Select building
        const rawLayout = clan?.layout_json;
        const layout = typeof rawLayout === 'string' ? JSON.parse(rawLayout) : (rawLayout || {});
        const buildings = layout.buildings || [];
        const targetBuilding = buildings[0] || { path: 'README.md', name: 'README.md', file_content_sample: '' };

        setSelectedBuilding(targetBuilding);
        if (targetBuilding.position) {
          setZoomToBuilding(targetBuilding.position);
        }
        setAutoDemoBanner(`📁 STEP 3/5: Selected Structure & Zooming into ${targetBuilding.path || targetBuilding.name}`);

        setTimeout(() => {
          // Step 4: Typewriter prompt into Mayor Console input box live
          setAutoDemoBanner('⌨️ STEP 4/5: Mayor Console Typing AI Order...');
          const demoPrompt = 'Add performance optimization helper routines';
          let charIdx = 0;
          setAutoTypedPrompt('');

          const typeInterval = setInterval(() => {
            if (charIdx < demoPrompt.length) {
              setAutoTypedPrompt(demoPrompt.slice(0, charIdx + 1));
              charIdx++;
            } else {
              clearInterval(typeInterval);
              setTimeout(() => {
                handleDispatch(demoPrompt, true);
              }, 400);
            }
          }, 35);

        }, 1200);

      }, 1400);

    }, 1800);
  };

  // ── Dispatch crew order (via OpenRouter API) ──
  const handleDispatch = async (prompt, isAuto = false) => {
    const target = selectedBuilding || { path: 'README.md', file_content_sample: '' };
    const effectiveKey = apiConfig.apiKey || WORKING_OPENROUTER_KEY;

    addTransmission('MAYOR', 'pending', `Dispatching: "${prompt}" → ${target.path || target.name}`);

    try {
      const res = await fetch(`${API_BASE}/edit-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_path: target.path || target.name,
          file_content: target.file_content_sample || '',
          prompt,
          crew_model: activeCrew.title,
          api_key: effectiveKey,
          base_url: apiConfig.baseUrl || 'https://openrouter.ai/api/v1',
          model: apiConfig.model || 'openai/gpt-4o',
          provider: apiConfig.provider || 'openrouter'
        })
      });
      const result = await res.json();

      if (!res.ok || result.error) {
        const errorMsg = result.message || result.error || 'OpenRouter API Call Failed';
        addTransmission('SYSTEM', 'error', `OpenRouter Error: ${errorMsg}`);
        alert(`⚠️ OpenRouter API Error: ${errorMsg}\n\nPlease check or update your key at openrouter.ai/keys.`);
        setIsKeyModalOpen(true);
        return;
      }

      const permit = {
        filePath: target.path || target.name,
        explanation: result.explanation,
        modifiedCode: result.modified_code,
        additions: result.additions || 0,
        deletions: result.deletions || 0,
        newLines: result.new_lines_of_code || 0,
        building: target
      };

      setPendingPermit(permit);
      addTransmission('CREW', 'active', `Proposal ready for ${target.path || target.name}. Awaiting Mayor stamp.`);

      // If in Auto Demo mode, automatically STAMP after 1.2s so user sees building extrude live!
      if (isAuto || isAutoDemoActive) {
        setAutoDemoBanner('🔨 STEP 5/5: AI proposal ready! Stamping permit to extrude height live...');
        setTimeout(() => {
          handleStamp(permit);
          setAutoDemoBanner('✅ AUTOMATED GUIDED DEMO SUCCESS — CREW DISPATCHED & BUILDING EXTRUDED LIVE!');
          setTimeout(() => {
            setIsAutoDemoActive(false);
            setIsAutoRevolving(false);
            setAutoDemoBanner(null);
            setAutoTypedPrompt('');
          }, 5000);
        }, 1400);
      }

    } catch (err) {
      addTransmission('SYSTEM', 'error', `Dispatch failed: ${err.message}`);
      alert(`Dispatch Error: ${err.message}`);
    }
  };

  // ── Stamp permit → update building height in 3D ─────────
  const handleStamp = (permit) => {
    setClansData(prev => prev.map(clan => {
      const layout = typeof clan.layout_json === 'string'
        ? JSON.parse(clan.layout_json)
        : (clan.layout_json || {});
      const buildings = (layout.buildings || []).map(b => {
        if (b.path !== permit.filePath) return b;
        const newLOC = permit.newLines || b.lines_of_code + (permit.additions || 0);
        const newH = Math.max(2, Math.min(40, Math.log2(newLOC + 1) * 3.5));
        return {
          ...b,
          lines_of_code: newLOC,
          height: newH,
          position: [b.position[0], newH / 2, b.position[2]],
          file_content_sample: permit.modifiedCode
        };
      });
      return { ...clan, layout_json: { ...layout, buildings } };
    }));
    addTransmission('MAYOR', 'active', `STAMPED: ${permit.filePath} (+${permit.additions} lines). Building updated!`);
    setPendingPermit(null);
    triggerConstruction();
  };

  const handleDeny = (permit) => {
    addTransmission('MAYOR', 'active', `DENIED: Changes to ${permit?.filePath} rejected.`);
    setPendingPermit(null);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: clansData.length > 0 ? 'hidden' : 'auto', position: 'relative', background: '#0a141d' }}>

      {/* Landing */}
      {!clansData.length && !isLoading && (
        <LandingView
          onSubmitRepo={(input, isAuto) => handleFetchCity(input, isAuto)}
          error={error}
          isLoading={isLoading}
          apiConfig={apiConfig}
          onSaveApiConfig={handleSaveApiConfig}
        />
      )}

      {/* Loading */}
      {isLoading && <LoadingScreen />}

      {/* City View */}
      {clansData.length > 0 && !isLoading && (
        <>
          {/* Auto Demo Banner Overlay */}
          {autoDemoBanner && (
            <div
              style={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 200,
                padding: '12px 28px',
                background: autoDemoBanner.includes('SUCCESS')
                  ? 'linear-gradient(180deg, #43a047 0%, #1b5e20 100%)'
                  : 'linear-gradient(180deg, #ff9800 0%, #e65100 100%)',
                border: `3px solid ${autoDemoBanner.includes('SUCCESS') ? '#1b5e20' : '#bf360c'}`,
                borderRadius: '30px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                color: '#fff',
                fontFamily: 'monospace',
                fontWeight: '900',
                fontSize: '0.95rem',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span>{autoDemoBanner}</span>
            </div>
          )}

          <CityCanvas
            clansData={clansData}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={setSelectedBuilding}
            selectedModel={activeCrew.title}
            isLiveConstructing={isLiveConstructing}
            constructionProgress={constructionProgress}
            isAutoRevolving={isAutoRevolving}
            zoomToBuilding={zoomToBuilding}
            onZoomDone={() => setZoomToBuilding(null)}
          />

          <MayorConsole
            clansData={clansData}
            activeCrew={activeCrew}
            onOpenCrewModal={() => setIsCrewModalOpen(true)}
            onOpenKeyModal={() => setIsKeyModalOpen(true)}
            selectedBuilding={selectedBuilding}
            onDispatchOrder={handleDispatch}
            onStampPermit={handleStamp}
            onDenyPermit={handleDeny}
            pendingPermit={pendingPermit}
            transmissions={transmissions}
            apiConfig={apiConfig}
            onSaveApiConfig={handleSaveApiConfig}
            autoTypedPrompt={autoTypedPrompt}
          />

          <CrewModal
            isOpen={isCrewModalOpen}
            onClose={() => setIsCrewModalOpen(false)}
            activeCrew={activeCrew}
            onConfirmCrew={(crew) => {
              setActiveCrew(crew);
              addTransmission('MAYOR', 'active', `Crew changed: ${crew.title} (${crew.thinkingLevel} effort)`);
            }}
          />
        </>
      )}

      {/* Global ApiKey Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        config={apiConfig}
        onSaveConfig={handleSaveApiConfig}
      />
    </div>
  );
}
