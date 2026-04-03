import React from 'react';

function PendingApproval({ logout }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '80vh',
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      margin: '2rem auto',
      maxWidth: '500px'
    }}>
      <div style={{
        fontSize: '4rem',
        marginBottom: '1rem',
        animation: 'pulse 2s infinite'
      }}>
        ⏳
      </div>
      <h1 style={{ color: '#111827', fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem' }}>
        Account Under Review
      </h1>
      <p style={{ color: '#4b5563', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
        Thanks for joining <strong>活力站 (BLK Project)</strong>! 
        <br /><br />
        To keep our community safe, every registration is manually reviewed. 
        Your account is currently <strong>pending approval</strong>. 
        Please check back soon!
      </p>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
        >
          Check Again
        </button>
        <button 
          onClick={logout}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default PendingApproval;
