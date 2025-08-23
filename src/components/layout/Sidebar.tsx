import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  List, 
  PlusCircle, 
  BarChart3, 
  Shield,
  Home,
  Users,
  FolderOpen,
  Calendar,
  Settings,
  X
} from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';
import type { NavItem, PageId } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const navItems: NavItem[] = [
    { id: 'entries', label: t('navEntries'), icon: LayoutGrid, color: 'blue' },
    { id: 'web_list', label: t('navWebList'), icon: List, color: 'green' },
    { id: 'new_entry', label: t('navNewEntry'), icon: PlusCircle, color: 'purple' },
    { id: 'reports', label: t('navReports'), icon: BarChart3, color: 'orange' },
    { id: 'admin', label: t('navAdmin'), icon: Shield, color: 'red' },
  ];

  const quickActionItems = [
    { id: 'dashboard', label: t('dashboard'), icon: Home, color: 'blue', path: '/dashboard' },
    { id: 'team', label: t('team'), icon: Users, color: 'green', path: '/team' },
    { id: 'projects', label: t('projectsSection'), icon: FolderOpen, color: 'orange', path: '/projects' },
  ];

  const bottomActionItems = [
    { id: 'calendar', label: t('calendar'), icon: Calendar, color: 'purple', path: '/calendar' },
    { id: 'settings', label: t('settings'), icon: Settings, color: 'gray', path: '/settings' },
  ];

  const getPathFromRoute = (pageId: PageId): string => {
    switch (pageId) {
      case 'entries': return '/entries';
      case 'web_list': return '/web-list';
      case 'new_entry': return '/new-entry';
      case 'reports': return '/reports';
      case 'admin': return '/admin';
      default: return '/entries';
    }
  };

  const handleNavigation = (pageId: PageId) => {
    navigate(getPathFromRoute(pageId));
  };

  const handleQuickActionNavigation = (path: string) => {
    navigate(path);
  };

  const getActivePage = (): string => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/team') return 'team';
    if (path === '/projects') return 'projects';
    if (path === '/calendar') return 'calendar';
    if (path === '/settings') return 'settings';
    if (path === '/entries') return 'entries';
    if (path === '/web-list') return 'web_list';
    if (path === '/new-entry') return 'new_entry';
    if (path === '/reports') return 'reports';
    if (path === '/admin') return 'admin';
    return 'dashboard';
  };

  const activePage = getActivePage();

  const getColorClasses = (color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case 'blue': return 'bg-blue-50 border-blue-200 text-blue-700';
        case 'green': return 'bg-green-50 border-green-200 text-green-700';
        case 'purple': return 'bg-purple-50 border-purple-200 text-purple-700';
        case 'orange': return 'bg-orange-50 border-orange-200 text-orange-700';
        case 'red': return 'bg-red-50 border-red-200 text-red-700';
        case 'gray': return 'bg-gray-50 border-gray-200 text-gray-700';
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
        case 'purple': return 'text-purple-600';
        case 'orange': return 'text-orange-600';
        case 'red': return 'text-red-600';
        case 'gray': return 'text-gray-600';
        default: return 'text-blue-600';
      }
    }
    return 'text-gray-400';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-white/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {t('quickActions')}
              </h3>
              <div className="space-y-2">
                {quickActionItems.map(item => {
                  const isActive = activePage === item.id;
                  return (
                    <button 
                      key={item.id}
                      onClick={() => {
                        handleQuickActionNavigation(item.path);
                        onClose(); // Close mobile sidebar after navigation
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md border transition-all duration-200 ${
                        isActive 
                          ? getColorClasses(item.color, true)
                          : getColorClasses(item.color, false)
                      }`}
                    >
                      <item.icon className={`h-4 w-4 ${getIconColor(item.color, isActive)}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Navigation */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {t('navigation')}
              </h3>
              <nav className="space-y-1">
                {navItems.map(item => {
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleNavigation(item.id);
                        onClose(); // Close mobile sidebar after navigation
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-md border transition-all duration-200 ${
                        isActive 
                          ? getColorClasses(item.color, true)
                          : getColorClasses(item.color, false)
                      }`}
                    >
                      <item.icon className={`h-4 w-4 ${getIconColor(item.color, isActive)}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-gray-200">
              <div className="space-y-2">
                {bottomActionItems.map(item => {
                  const isActive = activePage === item.id;
                  return (
                    <button 
                      key={item.id}
                      onClick={() => {
                        handleQuickActionNavigation(item.path);
                        onClose(); // Close mobile sidebar after navigation
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md border transition-all duration-200 ${
                        isActive 
                          ? getColorClasses(item.color, true)
                          : getColorClasses(item.color, false)
                      }`}
                    >
                      <item.icon className={`h-4 w-4 ${getIconColor(item.color, isActive)}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};


