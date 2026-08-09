import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, Sparkles } from 'lucide-react';

export function ApiKeyModal({ isOpen, onClose, config, onSaveConfig }) {
  const [apiKey, setApiKey] = useState(config?.apiKey || '');
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl || 'https://openrouter.ai/api/v1');
  const [model, setModel] = useState(config?.model || 'openai/gpt-4o');
  const [provider, setProvider] = useState(config?.provider || 'openrouter');

  // Sync state when modal opens or config changes
  useEffect(() => {
    if (isOpen) {
      setApiKey(config?.apiKey || '');
      setBaseUrl(config?.baseUrl?.includes('openrouter.ai') ? config.baseUrl : 'https://openrouter.ai/api/v1');
      setModel(config?.model || 'openai/gpt-4o');
      setProvider(config?.provider || 'openrouter');
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveConfig({
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
      model: model.trim(),
      provider: provider
    });
    onClose();
  };

  return (
    <div className="crew-modal-overlay">
      <div className="crew-modal-container" style={{ maxWidth: '640px' }}>
        <div className="crew-modal-header">
          <div>
            <h2 className="crew-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={20} className="text-amber-400" />
              <span>CONFIGURE YOUR OPENROUTER API KEY</span>
            </h2>
            <p className="crew-modal-sub">
              Enter a valid OpenRouter API key (sk-or-v1-...) to power real-time 3D building edits and repository summaries.
            </p>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="crew-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="thinking-label" style={{ margin: 0 }}>OpenRouter API Key (sk-or-v1-...)</label>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.72rem', color: '#48b02c', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 800 }}
              >
                <span>GET FREE KEY AT OPENROUTER.AI</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <input
              type="password"
              className="order-input"
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--accent-gold)' }}
              placeholder="sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div>
            <label className="thinking-label">API Base Endpoint</label>
            <input
              type="text"
              className="order-input"
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--text-dim)' }}
              placeholder="https://openrouter.ai/api/v1"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="thinking-label">Target Model</label>
            <input
              type="text"
              className="order-input"
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--text-dim)' }}
              placeholder="openai/gpt-4o"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              {['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro-1.5', 'meta-llama/llama-3.3-70b-instruct'].map((m) => (
                <button
                  key={m}
                  type="button"
                  className="preset-pill"
                  style={{ fontSize: '0.7rem', padding: '3px 8px', background: model === m ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)', color: model === m ? '#000' : '#fff' }}
                  onClick={() => setModel(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.12)', border: '1px dashed #ef4444', borderRadius: '4px', fontSize: '0.75rem', color: '#fca5a5' }}>
            💡 <strong>API Key Tip:</strong> If you receive <code>401 Invalid API Key</code> or <code>402 Insufficient Credits</code>, visit <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>openrouter.ai/keys</a> to create a new key or add credits, then paste it above!
          </div>

          <div className="crew-modal-footer" style={{ padding: '12px 0 0 0', borderTop: 'none' }}>
            <button type="button" className="btn-cancel" onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className="btn-confirm-crew">
              SAVE & APPLY KEY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
