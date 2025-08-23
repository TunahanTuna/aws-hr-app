import React from 'react';
import { useLanguage } from '../../i18n/useLanguage';

interface StatusBadgeProps {
  status: 'Active' | 'Inactive' | 'active' | 'inactive';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useLanguage();
  
  const isActive = status === 'Active' || status === 'active';
  
  return (
    <span 
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        isActive
          ? 'bg-green-100 text-green-700' 
          : 'bg-slate-100 text-slate-600'
      }`}
    >
      {isActive ? t('active') : t('inactive')}
    </span>
  );
};
