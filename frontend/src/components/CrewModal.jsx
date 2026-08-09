import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

const CREW_TYPES = [
  {
    id: 'architect',
    title: 'Architect',
    subtitle: 'Master planner · opus',
    desc: 'Deep reasoning for complex refactors, architecture, and long-horizon builds.',
    avatar: '👴',
    badgeColor: '#f59e0b'
  },
  {
    id: 'worker',
    title: 'Worker',
    subtitle: 'Site foreman · sonnet',
    desc: 'Balanced crew for everyday edits, fixes, and steady construction.',
    avatar: '👷',
    badgeColor: '#10b981'
  },
  {
    id: 'runner',
    title: 'Runner',
    subtitle: 'Quick hands · haiku',
    desc: 'Fast passes for small edits, renames, and errands around the city.',
    avatar: '🏃',
    badgeColor: '#00f0ff'
  }
];

const THINKING_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'EXTRA HIGH', 'MAX'];

export function CrewModal({ isOpen, onClose, activeCrew, onConfirmCrew }) {
  const [selectedCrewId, setSelectedCrewId] = useState(activeCrew?.id || 'worker');
  const [thinkingLevel, setThinkingLevel] = useState(activeCrew?.thinkingLevel || 'HIGH');

  if (!isOpen) return null;

  const selectedCrew = CREW_TYPES.find(c => c.id === selectedCrewId) || CREW_TYPES[1];

  const handleConfirm = () => {
    onConfirmCrew({
      ...selectedCrew,
      thinkingLevel
    });
    onClose();
  };

  return (
    <div className="crew-modal-overlay">
      <div className="crew-modal-container">
        {/* Header */}
        <div className="crew-modal-header">
          <div>
            <h2 className="crew-modal-title">Choose your crew</h2>
            <p className="crew-modal-sub">Pick a specialist and how hard they should think before dispatch.</p>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="crew-modal-body">
          {/* Left Cards List */}
          <div className="crew-cards-column">
            {CREW_TYPES.map((crew) => {
              const isSelected = crew.id === selectedCrewId;
              return (
                <div
                  key={crew.id}
                  className={`crew-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedCrewId(crew.id)}
                >
                  <div className="crew-card-avatar">{crew.avatar}</div>
                  <div className="crew-card-info">
                    <div className="crew-card-title">{crew.title}</div>
                    <div className="crew-card-sub">{crew.subtitle}</div>
                    <p className="crew-card-desc">{crew.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Preview Panel */}
          <div className="crew-preview-column">
            <div className="crew-preview-art">
              <div className="preview-avatar-large">{selectedCrew.avatar}</div>
              <div className="preview-title">{selectedCrew.title}</div>
              <div className="preview-sub">{thinkingLevel} effort</div>
            </div>

            <div className="thinking-level-box">
              <label className="thinking-label">Thinking level</label>
              <div className="thinking-btn-group">
                {THINKING_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`btn-thinking ${thinkingLevel === level ? 'active' : ''}`}
                    onClick={() => setThinkingLevel(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="thinking-hint">
                {thinkingLevel === 'HIGH' || thinkingLevel === 'MAX'
                  ? 'Full tool belt - blueprints out, deep reasoning.'
                  : 'Fast response mode - quick iterations.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="crew-modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            CANCEL
          </button>
          <button type="button" className="btn-confirm-crew" onClick={handleConfirm}>
            CONFIRM CREW
          </button>
        </div>
      </div>
    </div>
  );
}
