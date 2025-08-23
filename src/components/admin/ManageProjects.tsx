import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../i18n/useLanguage';
import { ManagementSection } from './ManagementSection';
import { StatusBadge } from '../ui/StatusBadge';
import { ActionButtons } from '../ui/ActionButtons';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Portal } from '../ui/Portal';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject, useCustomers, useUsers } from '../../lib/graphql/hooks';
import type { Project, Customer, User } from '../../types';

interface ProjectFormData {
  name: string;
  customer_id: string;
  pm_id: string;
  is_billable: boolean;
}

export const ManageProjects: React.FC = () => {
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    customer_id: '',
    pm_id: '',
    is_billable: true
  });

  // GraphQL hooks
  const { data: projectsData, loading: projectsLoading, error: projectsError } = useProjects();
  const { data: customersData, loading: customersLoading } = useCustomers();
  const { data: usersData, loading: usersLoading } = useUsers();
  const [createProject] = useCreateProject();
  const [updateProject] = useUpdateProject();
  const [deleteProject] = useDeleteProject();

  const projects = projectsData?.projects || [];
  const customers = customersData?.customers || [];
  const users = usersData?.users || [];

  const loading = projectsLoading || customersLoading || usersLoading;
  const error = projectsError;

  const handleAddNew = (): void => {
    setEditingProject(null);
    setFormData({ name: '', customer_id: '', pm_id: '', is_billable: true });
    setIsFormOpen(true);
  };

  const handleEdit = (project: Project): void => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      customer_id: project.customer_id,
      pm_id: project.pm_id,
      is_billable: project.is_billable
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm(t('deleteProjectConfirmation'))) {
      try {
        await deleteProject({ variables: { id } });
      } catch (error) {
        console.error('Error deleting project:', error);
        alert(t('errorDeletingProject'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      if (editingProject) {
        await updateProject({
          variables: {
            id: editingProject.id,
            input: formData
          }
        });
      } else {
        await createProject({
          variables: {
            input: formData
          }
        });
      }
      setIsFormOpen(false);
      setEditingProject(null);
      setFormData({ name: '', customer_id: '', pm_id: '', is_billable: true });
    } catch (error) {
      console.error('Error saving project:', error);
      alert(t('errorSavingProject'));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <ManagementSection 
        title={t('projectManagement')} 
        buttonText={t('addNewProject')} 
        onAdd={handleAddNew}
      >
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('name')}
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('customer')}
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('projectManager')}
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('billable')}
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((project: Project) => {
              const customer = customers.find((c: Customer) => c.id === project.customer_id);
              const projectManager = users.find((u: User) => u.id === project.pm_id);
              
              return (
                <tr key={project.id}>
                  <td className="px-4 py-2">{project.name}</td>
                  <td className="px-4 py-2">{customer?.name || '-'}</td>
                  <td className="px-4 py-2">{projectManager?.name || '-'}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={project.is_billable ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-4 py-2">
                    <ActionButtons 
                      onEdit={() => handleEdit(project)} 
                      onDelete={() => handleDelete(project.id)} 
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ManagementSection>

      {/* Project Form Modal */}
      {isFormOpen && (
        <Portal>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-8 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
            >
            <h3 className="text-lg font-semibold mb-4">
              {editingProject ? t('editProject') : t('addNewProject')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('customer')}
                </label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">{t('selectCustomer')}</option>
                  {customers.map((customer: Customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('projectManager')}
                </label>
                <select
                  value={formData.pm_id}
                  onChange={(e) => setFormData({...formData, pm_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">{t('selectProjectManager')}</option>
                  {users.filter((user: User) => user.role === 'Manager' || user.role === 'Admin').map((user: User) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_billable}
                    onChange={(e) => setFormData({...formData, is_billable: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">{t('billable')}</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingProject ? t('update') : t('create')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
        </Portal>
      )}
    </>
  );
};
