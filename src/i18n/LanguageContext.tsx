import React, { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Language, LanguageContextType } from '../types';
import { translations } from './translations';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/helpers';

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => 
    loadFromLocalStorage<Language>('app-language', 'tr')
  );

  const setLanguage = (newLanguage: Language): void => {
    setLanguageState(newLanguage);
    saveToLocalStorage('app-language', newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[Language]] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};


