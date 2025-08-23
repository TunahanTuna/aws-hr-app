import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { ManageUsers } from '../components/admin/ManageUsers';
import { ManageCustomers } from '../components/admin/ManageCustomers';
import { ManageProjects } from '../components/admin/ManageProjects';
import { ManageTaskTypes } from '../components/admin/ManageTaskTypes';
import { ManageDivisions } from '../components/admin/ManageDivisions';
import { ManageSpecialDays } from '../components/admin/ManageSpecialDays';
import { ManageParameters } from '../components/admin/ManageParameters';
import { GraphQLTest } from '../components/GraphQLTest';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Shield, Settings } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';
import type { AdminSection } from '../types';

export const AdminPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<AdminSection>('test');

  const renderAdminSection = (): React.ReactNode => {
    switch (activeSection) {
      case 'test':
        return <GraphQLTest />;
      case 'users': 
        return <ManageUsers />;
      case 'customers': 
        return <ManageCustomers />;
      case 'projects': 
        return <ManageProjects />;
      case 'task_types': 
        return <ManageTaskTypes />;
      case 'divisions': 
        return <ManageDivisions />;
      case 'parameters': 
        return <ManageParameters />;
      case 'special_days': 
        return <ManageSpecialDays />;
      default: 
        return <GraphQLTest />;
    }
  };

  const getSectionTitle = (section: AdminSection): string => {
    switch (section) {
      case 'test': return 'GraphQL Test';
      case 'users': return 'User Management';
      case 'customers': return 'Customer Management';
      case 'projects': return 'Project Management';
      case 'task_types': return 'Task Type Management';
      case 'divisions': return 'Division Management';
      case 'parameters': return 'System Parameters';
      case 'special_days': return 'Special Days Management';
      default: return 'Admin Panel';
    }
  };

  const getSectionDescription = (section: AdminSection): string => {
    switch (section) {
      case 'test': return 'Test GraphQL queries and mutations';
      case 'users': return 'Manage system users and permissions';
      case 'customers': return 'Manage customer information and relationships';
      case 'projects': return 'Manage projects and project assignments';
      case 'task_types': return 'Configure task type categories';
      case 'divisions': return 'Manage organizational divisions';
      case 'parameters': return 'Configure system-wide parameters';
      case 'special_days': return 'Manage holidays and special working days';
      default: return 'Administrative functions and system configuration';
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
          className="p-3 bg-blue-100 rounded-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Shield className="h-8 w-8 text-blue-600" />
        </motion.div>
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">{t('adminPanel')}</h1>
          <p className="text-gray-600 mt-1">System administration and configuration</p>
        </motion.div>
      </motion.div>

      {/* Admin Layout */}
      <motion.div 
        className="flex gap-6"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AdminSidebar 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
          />
        </motion.div>
        
        <motion.main 
          className="flex-1"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="p-2 bg-gray-100 rounded-lg"
                    whileHover={{ rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Settings className="h-5 w-5 text-gray-600" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">{getSectionTitle(activeSection)}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{getSectionDescription(activeSection)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderAdminSection()}
              </CardContent>
            </Card>
          </motion.div>
        </motion.main>
      </motion.div>
    </motion.div>
  );
};
