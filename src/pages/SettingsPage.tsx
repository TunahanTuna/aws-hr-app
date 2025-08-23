import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Key,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useLanguage } from '../i18n/useLanguage';

export const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);

  // Mock settings data
  const mockUserProfile = {
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@company.com',
    role: 'Senior Developer',
    department: 'Engineering',
    phone: '+90 532 123 4567',
    location: 'Istanbul, Turkey',
    timezone: 'Europe/Istanbul',
    language: 'tr',
    avatar: 'AY'
  };

  const mockNotificationSettings = {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    dailyDigest: true,
    weeklyReport: true,
    projectUpdates: true,
    teamMessages: true,
    deadlineReminders: true
  };

  const mockSecuritySettings = {
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    lastPasswordChange: '2024-01-01',
    lastLogin: '2024-01-15 09:30:00'
  };

  const mockAppearanceSettings = {
    theme: 'light',
    colorScheme: 'blue',
    fontSize: 'medium',
    compactMode: false,
    sidebarCollapsed: false
  };

  const mockSystemSettings = {
    autoSave: true,
    autoBackup: true,
    backupFrequency: 'daily',
    maxFileSize: 10,
    dataRetention: 365,
    apiRateLimit: 1000
  };

  const tabs = [
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'security', label: t('security'), icon: Shield },
    { id: 'appearance', label: t('appearance'), icon: Palette },
    { id: 'system', label: t('system'), icon: Database }
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <CardTitle>{t('personalInformation')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('fullName')}</label>
              <Input defaultValue={mockUserProfile.name} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('email')}</label>
              <Input type="email" defaultValue={mockUserProfile.email} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('phone')}</label>
              <Input defaultValue={mockUserProfile.phone} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('location')}</label>
              <Input defaultValue={mockUserProfile.location} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('timezone')}</label>
              <Select defaultValue={mockUserProfile.timezone}>
                <option value="Europe/Istanbul">Europe/Istanbul (UTC+3)</option>
                <option value="Europe/London">Europe/London (UTC+0)</option>
                <option value="America/New_York">America/New_York (UTC-5)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('language')}</label>
              <Select 
                defaultValue={mockUserProfile.language} 
                onChange={(e) => setLanguage(e.target.value as 'tr' | 'en')}
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-gray-500" />
            <CardTitle>{t('changePassword')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('currentPassword')}</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={t('enterCurrentPassword')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('newPassword')}</label>
              <Input type="password" placeholder={t('enterNewPassword')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('confirmNewPassword')}</label>
              <Input type="password" placeholder={t('confirmNewPasswordText')} />
            </div>
            <Button variant="jira">
              <Save className="h-4 w-4 mr-2" />
              {t('updatePassword')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-gray-500" />
          <CardTitle>{t('notificationPreferences')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <div className="space-y-3">
                {Object.entries(mockNotificationSettings)
                  .filter(([key]) => key.includes('email') || key.includes('daily') || key.includes('weekly'))
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <input
                        type="checkbox"
                        defaultChecked={value}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Push Notifications</h4>
              <div className="space-y-3">
                {Object.entries(mockNotificationSettings)
                  .filter(([key]) => key.includes('push') || key.includes('project') || key.includes('team') || key.includes('deadline'))
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <input
                        type="checkbox"
                        defaultChecked={value}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <Button variant="jira">
              <Save className="h-4 w-4 mr-2" />
              Save Notification Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-500" />
            <CardTitle>{t('securitySettings')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={mockSecuritySettings.twoFactorAuth ? "jiraSuccess" : "jiraGray"}>
                  {mockSecuritySettings.twoFactorAuth ? t('enabled') : t('disabled')}
                </Badge>
                <Button variant="outline" size="sm">
                  {mockSecuritySettings.twoFactorAuth ? t('disable') : t('enable')}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
                <Select defaultValue={mockSecuritySettings.sessionTimeout.toString()}>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password Expiry (days)</label>
                <Select defaultValue={mockSecuritySettings.passwordExpiry.toString()}>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                </Select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button variant="jira">
                <Save className="h-4 w-4 mr-2" />
                Update Security Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-500" />
            <CardTitle>{t('securityHistory')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Password Changed</p>
                <p className="text-xs text-gray-500">{mockSecuritySettings.lastPasswordChange}</p>
              </div>
              <Badge variant="jiraSuccess">{t('completed')}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Last Login</p>
                <p className="text-xs text-gray-500">{mockSecuritySettings.lastLogin}</p>
              </div>
              <Badge variant="jira">{t('active')}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearanceTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Palette className="h-5 w-5 text-gray-500" />
          <CardTitle>{t('appearanceSettings')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Theme</label>
              <Select defaultValue={mockAppearanceSettings.theme}>
                <option value="light">{t('light')}</option>
                <option value="dark">{t('dark')}</option>
                <option value="auto">{t('auto')}</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Color Scheme</label>
              <Select defaultValue={mockAppearanceSettings.colorScheme}>
                <option value="blue">{t('blue')}</option>
                <option value="green">{t('green')}</option>
                <option value="purple">{t('purple')}</option>
                <option value="orange">{t('orange')}</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Font Size</label>
              <Select defaultValue={mockAppearanceSettings.fontSize}>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Layout</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={mockAppearanceSettings.compactMode}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  <span className="text-sm text-gray-700">Compact Mode</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={mockAppearanceSettings.sidebarCollapsed}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  <span className="text-sm text-gray-700">Collapsed Sidebar</span>
                </label>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <Button variant="jira">
              <Save className="h-4 w-4 mr-2" />
              Save Appearance Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSystemTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-gray-500" />
          <CardTitle>{t('systemSettings')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Auto Save</label>
              <Select defaultValue={mockSystemSettings.autoSave ? "true" : "false"}>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Backup Frequency</label>
              <Select defaultValue={mockSystemSettings.backupFrequency}>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Max File Size (MB)</label>
              <Input type="number" defaultValue={mockSystemSettings.maxFileSize} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Data Retention (days)</label>
              <Input type="number" defaultValue={mockSystemSettings.dataRetention} />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Button variant="jira">
              <Save className="h-4 w-4 mr-2" />
              Save System Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'notifications': return renderNotificationsTab();
      case 'security': return renderSecurityTab();
      case 'appearance': return renderAppearanceTab();
      case 'system': return renderSystemTab();
      default: return renderProfileTab();
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header */}
      <motion.div 
        className="flex items-center space-x-4"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.div 
          className="p-3 bg-gray-100 rounded-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Settings className="h-8 w-8 text-gray-600" />
        </motion.div>
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">{t('settingsTitle')}</h1>
          <p className="text-gray-600 mt-1">{t('settingsDescription')}</p>
        </motion.div>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div 
        className="flex space-x-1 bg-gray-100 p-1 rounded-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + (index * 0.1) }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>
    </motion.div>
  );
};
