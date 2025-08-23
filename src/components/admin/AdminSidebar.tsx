import React from 'react';
import { 
  Users, 
  Building, 
  FolderKanban, 
  Tag, 
  CalendarDays, 
  SlidersHorizontal,
  Network,
  TestTube,
  Shield
} from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';
import { Badge } from '../ui/Badge';
import type { AdminSection, AdminNavItem } from '../../types';

interface AdminSidebarProps {
  activeSection: AdminSection;
  setActiveSection: (section: AdminSection) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeSection, 
  setActiveSection 
}) => {
  const { t } = useLanguage();
  
  const sections: AdminNavItem[] = [
    { id: 'test', label: 'GraphQL Test', icon: TestTube, color: 'purple' },
    { id: 'users', label: t('users'), icon: Users, color: 'blue' },
    { id: 'customers', label: t('customers'), icon: Building, color: 'green' },
    { id: 'projects', label: t('projects'), icon: FolderKanban, color: 'orange' },
    { id: 'task_types', label: t('taskTypes'), icon: Tag, color: 'pink' },
    { id: 'divisions', label: t('divisions'), icon: Network, color: 'indigo' },
    { id: 'special_days', label: t('specialDays'), icon: CalendarDays, color: 'yellow' },
    { id: 'parameters', label: t('dynamicParameters'), icon: SlidersHorizontal, color: 'red' },
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case 'blue': return 'bg-blue-50 border-blue-200 text-blue-700';
        case 'green': return 'bg-green-50 border-green-200 text-green-700';
        case 'orange': return 'bg-orange-50 border-orange-200 text-orange-700';
        case 'purple': return 'bg-purple-50 border-purple-200 text-purple-700';
        case 'pink': return 'bg-pink-50 border-pink-200 text-pink-700';
        case 'indigo': return 'bg-indigo-50 border-indigo-200 text-indigo-700';
        case 'yellow': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
        case 'red': return 'bg-red-50 border-red-200 text-red-700';
        default: return 'bg-blue-50 border-blue-200 text-blue-700';
      }
    }
    return 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';
  };

  const getIconColor = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case 'blue': return 'text-blue-600';
        case 'green': return 'text-green-600';
        case 'orange': return 'text-orange-600';
        case 'purple': return 'text-purple-600';
        case 'pink': return 'text-pink-600';
        case 'indigo': return 'text-indigo-600';
        case 'yellow': return 'text-yellow-600';
        case 'red': return 'text-red-600';
        default: return 'text-blue-600';
      }
    }
    return 'text-gray-400';
  };

  return (
    <aside className="w-64 bg-white border border-gray-200 rounded-lg p-4">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('adminPanel')}
          </h3>
        </div>
        <p className="text-sm text-gray-600">System configuration and management</p>
      </div>

      <nav className="space-y-2">
        {sections.map(section => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-md border transition-all duration-200 ${
                isActive 
                  ? getColorClasses(section.color, true)
                  : getColorClasses(section.color, false)
              }`}
            >
              <section.icon className={`h-4 w-4 ${getIconColor(section.color, isActive)}`} />
              <span className="flex-1 text-left">{section.label}</span>
              {isActive && (
                <Badge variant="jira" className="text-xs">
                  Active
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h4>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Total Sections:</span>
            <span className="font-medium">{sections.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Active:</span>
            <span className="font-medium text-blue-600">1</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
