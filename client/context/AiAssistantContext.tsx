'use client';

import { createContext, useContext, useState } from 'react';

type AiAssistantContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  properties: any[];
  setProperties: (p: any[]) => void;
};

const AiAssistantContext = createContext<AiAssistantContextType | null>(null);

export const AiAssistantProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);

  return (
    <AiAssistantContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen(v => !v),
        properties,
        setProperties,
      }}
    >
      {children}
    </AiAssistantContext.Provider>
  );
};

export const useAiAssistant = () => {
  const ctx = useContext(AiAssistantContext);
  if (!ctx) {
    throw new Error('useAiAssistant must be used inside AiAssistantProvider');
  }
  return ctx;
};
