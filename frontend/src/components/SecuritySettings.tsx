import React from 'react';
import { useSecurity } from '../context/SecurityContext';

export const SecuritySettings: React.FC = () => {
  const { rememberSession, setRememberSession } = useSecurity();

  return (
    <label
      htmlFor="remember-api-key-session"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '12px',
        fontSize: '14px',
        cursor: 'pointer'
      }}
    >
      <input
        id="remember-api-key-session"
        type="checkbox"
        checked={rememberSession}
        onChange={(event) => setRememberSession(event.target.checked)}
      />
      <span>Remember API key for this session</span>
    </label>
  );
};
