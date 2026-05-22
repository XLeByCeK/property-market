'use client';

import { createContext, useContext, useState } from 'react';

export type AiProperty = {
  id: number;
  title: string;
  price: number;
  city_id: number;
  has_renovation?: boolean;
  effective_price?: number;
  renovation_surcharge?: number;
  image?: string;
  // Любые дополнительные поля, которые сервер прикладывает к объекту
  // недвижимости (city, district, metro_station и т.п.).
  [key: string]: unknown;
};

type AiAssistantContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  properties: AiProperty[];
  setProperties: (p: AiProperty[]) => void;
  recommended: AiProperty | null;
  setRecommended: (p: AiProperty | null) => void;
  reasoning: string;
  setReasoning: (text: string) => void;
};

const AiAssistantContext = createContext<AiAssistantContextType | null>(null);

export const AiAssistantProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [properties, setProperties] = useState<AiProperty[]>([]);
  const [recommended, setRecommended] = useState<AiProperty | null>(null);
  const [reasoning, setReasoning] = useState<string>('');

  return (
    <AiAssistantContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen(v => !v),
        properties,
        setProperties,
        recommended,
        setRecommended,
        reasoning,
        setReasoning,
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
