import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { hasStoredSessionApiKeys, setStorageMode } from '../services/storage';

interface SecurityContextValue {
  rememberSession: boolean;
  setRememberSession: (value: boolean) => void;
}

const SecurityContext = createContext<SecurityContextValue | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [rememberSession, setRememberSession] = useState(() => hasStoredSessionApiKeys());

  useEffect(() => {
    setStorageMode(rememberSession ? 'session' : 'memory');
  }, [rememberSession]);

  const value = useMemo(
    () => ({
      rememberSession,
      setRememberSession
    }),
    [rememberSession]
  );

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
};

export const useSecurity = (): SecurityContextValue => {
  const context = useContext(SecurityContext);

  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }

  return context;
};
