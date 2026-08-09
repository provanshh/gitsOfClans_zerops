import React from 'react';

export function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999,
      background: 'rgba(10, 20, 29, 0.97)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Fira Code', monospace",
      color: '#f59e0b'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '20px', animation: 'spin 2s linear infinite' }}>🏗️</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '2px' }}>SCANNING REPOSITORY...</div>
      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>Building city structures</div>
      <div style={{
        width: '200px',
        height: '4px',
        background: 'rgba(255,255,255,0.1)',
        marginTop: '24px',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '60%',
          height: '100%',
          background: '#f59e0b',
          animation: 'loading-bar 1.5s ease-in-out infinite'
        }} />
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
