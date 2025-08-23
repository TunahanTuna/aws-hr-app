import React from 'react';
import { Search, Bell, User, Settings, Menu } from 'lucide-react';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { useLanguage } from '../../i18n/useLanguage';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { t } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm h-16 flex-shrink-0">
      <div className="px-4 sm:px-6 py-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left side - Logo and hamburger */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">HR</span>
              </div>
              <h1 className="hidden sm:block text-xl font-semibold text-gray-900">{t('appTitle')}</h1>
            </div>
            
            {/* Search - hidden on mobile */}
            <div className="hidden md:block relative w-64 lg:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects, tasks, or people..."
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile search button */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5 text-gray-600" />
            </Button>
            
            {/* Language switcher - hidden on small screens */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>
            
            {/* Settings - hidden on mobile */}
            <Button variant="ghost" size="icon" className="hidden sm:block">
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>
            
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
