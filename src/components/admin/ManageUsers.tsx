import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../i18n/useLanguage';
import { ManagementSection } from './ManagementSection';
import { StatusBadge } from '../ui/StatusBadge';
import { ActionButtons } from '../ui/ActionButtons';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Portal } from '../ui/Portal';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../lib/graphql/hooks';
import type { User } from '../../types';

interface UserFormData {
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Member';
  status: 'Active' | 'Inactive';
}

export const ManageUsers: React.FC = () => {
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'Member',
    status: 'Active'
  });

  // GraphQL hooks
  const { data: usersData, loading, error } = useUsers();
  const [createUser] = useCreateUser();
  const [updateUser] = useUpdateUser();
  const [deleteUser] = useDeleteUser();

  const users = usersData?.users || [];

  const handleAddNew = (): void => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'Member', status: 'Active' });
    setIsFormOpen(true);
  };

  const handleEdit = (user: User): void => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm(t('deleteUserConfirmation'))) {
      try {
        await deleteUser({ variables: { id } });
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(t('errorDeletingUser'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser({
          variables: {
            id: editingUser.id,
            input: formData
          }
        });
      } else {
        await createUser({
          variables: {
            input: formData
          }
        });
      }
      setIsFormOpen(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'Member', status: 'Active' });
    } catch (error) {
      console.error('Error saving user:', error);
      alert(t('errorSavingUser'));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <ManagementSection 
        title={t('userManagement')} 
        buttonText={t('addNewUser')} 
        onAdd={handleAddNew}
      >
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('name')}
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('email')}
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('role')}
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('status')}
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user: User) => (
              <tr key={user.id}>
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.role}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-4 py-2">
                  <ActionButtons 
                    onEdit={() => handleEdit(user)} 
                    onDelete={() => handleDelete(user.id)} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ManagementSection>

      {/* User Form Modal */}
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
              {editingUser ? t('editUser') : t('addNewUser')}
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
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('role')}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as 'Admin' | 'Manager' | 'Member'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Member">Member</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('status')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                  {editingUser ? t('update') : t('create')}
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
