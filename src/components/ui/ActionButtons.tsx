import React from 'react';
import { Edit, Trash2, Copy } from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  showDuplicate?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onEdit, 
  onDelete, 
  onDuplicate,
  showDuplicate = false 
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center space-x-1">
      {showDuplicate && onDuplicate && (
        <button 
          onClick={onDuplicate} 
          className="p-1 text-slate-500 hover:bg-slate-200 hover:text-red-600 rounded-md transition-colors" 
          title={t('duplicate')}
        >
          <Copy className="h-4 w-4" />
        </button>
      )}
      {onEdit && (
        <button 
          onClick={onEdit} 
          className="p-1 text-slate-500 hover:bg-slate-200 hover:text-indigo-600 rounded-md transition-colors" 
          title={t('edit')}
        >
          <Edit className="h-4 w-4" />
        </button>
      )}
      {onDelete && (
        <button 
          onClick={onDelete} 
          className="p-1 text-slate-500 hover:bg-slate-200 hover:text-red-600 rounded-md transition-colors" 
          title={t('delete')}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
