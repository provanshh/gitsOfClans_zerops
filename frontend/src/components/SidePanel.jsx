import React from 'react';
import { X, Sparkles, Shield, Cpu, CheckCircle2, BookOpen, GitPullRequest, GitBranch, Plus, Minus, ExternalLink } from 'lucide-react';

export function SidePanel({
  building,
  prShip,
  summary,
  isSummarizing,
  selectedModel,
  onClose,
  onGenerateSummary,
  onGeneratePRSummary
}) {
  if (!building && !prShip) return null;

  // PR Ship Review Mode
  if (prShip) {
    return (
      <aside className="side-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <div
              className="file-badge"
              style={{ backgroundColor: '#ff2a85', color: '#ffffff', margin: '0 0 8px 0' }}
            >
              <GitPullRequest size={12} style={{ marginRight: '4px' }} />
              Open PR #{prShip.number} Ship
            </div>

            <h3 className="file-path">{prShip.title}</h3>
          </div>

          <button className="btn-close-panel" onClick={onClose} title="Close Panel">
            <X size={20} />
          </button>
        </div>

        <div className="panel-body">
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Author</div>
              <div className="stat-value" style={{ fontSize: '0.9rem' }}>@{prShip.user}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Branch Diff</div>
              <div className="stat-value" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GitBranch size={12} /> {prShip.head_branch}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Line Changes</div>
              <div className="stat-value" style={{ fontSize: '0.85rem' }}>
                <span style={{ color: '#10b981' }}>+{prShip.additions}</span> / <span style={{ color: '#ef4444' }}>-{prShip.deletions}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Changed Files</div>
              <div className="stat-value">{prShip.changed_files}</div>
            </div>
          </div>

          {/* GitHub PR Link */}
          {prShip.html_url && (
            <a
              href={prShip.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-summarize"
              style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--bg-card-border)', textDecoration: 'none' }}
            >
              <ExternalLink size={16} />
              <span>Review on GitHub</span>
            </a>
          )}

          {/* AI PR Review Section */}
          <div className="summary-section">
            <div className="summary-header">
              <Sparkles size={16} />
              <span>AI PR Review ({selectedModel || 'Claude 3.5 Sonnet'})</span>
            </div>

            {summary ? (
              <div className="summary-box">
                <p>{summary.text}</p>
                {summary.cached && (
                  <div className="summary-cached-badge">
                    <CheckCircle2 size={12} />
                    <span>Loaded from Postgres Cache</span>
                  </div>
                )}
              </div>
            ) : isSummarizing ? (
              <div className="summary-box" style={{ textAlign: 'center', padding: '24px' }}>
                <div className="spinner-box" style={{ width: '40px', height: '40px', margin: '0 auto 12px' }}>
                  <div className="spinner-ring" />
                  <Cpu className="spinner-icon" size={18} />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Reviewing PR changes with {selectedModel || 'Claude 3.5 Sonnet'}...
                </div>
              </div>
            ) : (
              <button className="btn-summarize" onClick={() => onGeneratePRSummary(prShip)}>
                <Sparkles size={16} />
                <span>Review PR with {selectedModel || 'Crew Model'}</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // Building / README Inspection Mode
  const isReadme = building.isReadmeFountain;
  const fileSizeKb = (building.size_bytes / 1024).toFixed(1);

  return (
    <aside className="side-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title-group">
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
            <div
              className="file-badge"
              style={{ backgroundColor: isReadme ? '#ffd700' : (building.color || '#00f0ff'), color: '#07070e', margin: 0 }}
            >
              {isReadme ? '⛲ Town Hall README' : (building.language || 'Code File')}
            </div>

            {building.clanName && (
              <div
                className="file-badge"
                style={{ backgroundColor: 'rgba(255, 215, 0, 0.2)', border: '1px solid #ffd700', color: '#ffd700', margin: 0 }}
              >
                <Shield size={10} style={{ marginRight: '2px' }} />
                {building.clanName}
              </div>
            )}
          </div>

          <h3 className="file-path">{isReadme ? `${building.clanName || 'Repo'} README.md` : building.path}</h3>
        </div>

        <button className="btn-close-panel" onClick={onClose} title="Close Panel">
          <X size={20} />
        </button>
      </div>

      {/* Body Stats */}
      <div className="panel-body">
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">{isReadme ? 'Overview Lines' : 'Lines of Code'}</div>
            <div className="stat-value">{building.lines_of_code.toLocaleString()}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">File Size</div>
            <div className="stat-value">{fileSizeKb} KB</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">{isReadme ? 'District' : 'Neighborhood'}</div>
            <div className="stat-value" style={{ fontSize: '0.85rem' }}>
              {isReadme ? '⛲ Center Square' : `📁 ${building.folder || 'root'}`}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Language / Type</div>
            <div className="stat-value" style={{ fontSize: '0.85rem' }}>{building.language}</div>
          </div>
        </div>

        {/* AI Summary Section */}
        <div className="summary-section">
          <div className="summary-header">
            {isReadme ? <BookOpen size={16} /> : <Sparkles size={16} />}
            <span>{isReadme ? 'Project Architecture Overview' : 'AI Code Summary'}</span>
            <span style={{ fontSize: '0.7rem', color: '#ffd700', marginLeft: 'auto' }}>({selectedModel || 'Claude 3.5 Sonnet'})</span>
          </div>

          {summary ? (
            <div className="summary-box">
              <p>{summary.text}</p>
              {summary.cached && (
                <div className="summary-cached-badge">
                  <CheckCircle2 size={12} />
                  <span>Loaded from Postgres Cache</span>
                </div>
              )}
            </div>
          ) : isSummarizing ? (
            <div className="summary-box" style={{ textAlign: 'center', padding: '24px' }}>
              <div className="spinner-box" style={{ width: '40px', height: '40px', margin: '0 auto 12px' }}>
                <div className="spinner-ring" />
                <Cpu className="spinner-icon" size={18} />
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Analyzing with {selectedModel || 'Claude 3.5 Sonnet'}...
              </div>
            </div>
          ) : (
            <button className="btn-summarize" onClick={() => onGenerateSummary(building)}>
              <Sparkles size={16} />
              <span>{isReadme ? 'Generate Project Overview Summary' : 'Generate AI Summary'}</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
