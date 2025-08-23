import React from 'react';
import { useLanguage } from '../../i18n/useLanguage';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = (): void => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  const LanguageSwitcherIcon: React.FC = () => {
    if (language === 'tr') {
      return (
        <svg 
          width="28" 
          height="20" 
          viewBox="0 0 28 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="rounded-sm"
        >
          <rect width="28" height="20" fill="#EF4444"/>
          <text 
            x="14" 
            y="14" 
            fontFamily="Arial, sans-serif" 
            fontSize="12" 
            fill="white" 
            textAnchor="middle" 
            fontWeight="bold"
          >
            TR
          </text>
        </svg>
      );
    }
    return (
      <svg 
        width="28" 
        height="20" 
        viewBox="0 0 28 20" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="rounded-sm"
      >
        <rect width="28" height="20" fill="#3B82F6"/>
        <text 
          x="14" 
          y="14" 
          fontFamily="Arial, sans-serif" 
          fontSize="12" 
          fill="white" 
          textAnchor="middle" 
          fontWeight="bold"
        >
          EN
        </text>
      </svg>
    );
  };

  return (
    <button 
      onClick={toggleLanguage} 
      className="p-1 text-slate-500 hover:bg-slate-100 rounded-md transition-colors" 
      title={t('changeLanguage')}
    >
      <LanguageSwitcherIcon />
    </button>
  );
};
