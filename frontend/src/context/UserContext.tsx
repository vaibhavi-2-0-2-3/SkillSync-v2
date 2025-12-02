import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserContextValue {
  userId: string | null;
  role: string;
  setUserId: (id: string) => void;
  setRole: (role: string) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [role, setRoleState] = useState<string>('Backend Developer');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('userId');
    const stored = window.localStorage.getItem('skillsync_userId');
    const effectiveId = fromQuery || stored;
    if (effectiveId) {
      setUserIdState(effectiveId);
      window.localStorage.setItem('skillsync_userId', effectiveId);
    }
  }, []);

  const setUserId = (id: string) => {
    setUserIdState(id);
    window.localStorage.setItem('skillsync_userId', id);
  };

  const setRole = (nextRole: string) => {
    setRoleState(nextRole);
  };

  return (
    <UserContext.Provider value={{ userId, role, setUserId, setRole }}>{children}</UserContext.Provider>
  );
};

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
}


