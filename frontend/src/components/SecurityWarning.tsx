import React from 'react';

export const SecurityWarning: React.FC = () => (
  <div
    role="note"
    style={{
      marginTop: '12px',
      padding: '12px',
      borderRadius: '4px',
      backgroundColor: '#fff8e1',
      color: '#7a4f01',
      fontSize: '13px',
      lineHeight: 1.5
    }}
  >
    ⚠️ Your API key is stored only in memory by default and will be lost on refresh. You can enable
    &apos;Remember for this session&apos; to persist it until the tab is closed. Do not use this on
    shared or untrusted devices.
  </div>
);
