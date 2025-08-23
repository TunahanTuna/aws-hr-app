import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../i18n/useLanguage';
import { ManagementSection } from './ManagementSection';
import { StatusBadge } from '../ui/StatusBadge';
import { ActionButtons } from '../ui/ActionButtons';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Portal } from '../ui/Portal';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '../../lib/graphql/hooks';
import type { Customer } from '../../types';

interface CustomerFormData {
  name: string;
  status: 'Active' | 'Inactive';
}

export const ManageCustomers: React.FC = () => {
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    status: 'Active'
  });

  // GraphQL hooks
  const { data: customersData, loading, error } = useCustomers();
  const [createCustomer] = useCreateCustomer();
  const [updateCustomer] = useUpdateCustomer();
  const [deleteCustomer] = useDeleteCustomer();

  const customers = customersData?.customers || [];

  const handleAddNew = (): void => {
    setEditingCustomer(null);
    setFormData({ name: '', status: 'Active' });
    setIsFormOpen(true);
  };

  const handleEdit = (customer: Customer): void => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      status: customer.status
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm(t('deleteCustomerConfirmation'))) {
      try {
        await deleteCustomer({ variables: { id } });
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert(t('errorDeletingCustomer'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateCustomer({
          variables: {
            id: editingCustomer.id,
            input: formData
          }
        });
      } else {
        await createCustomer({
          variables: {
            input: formData
          }
        });
      }
      setIsFormOpen(false);
      setEditingCustomer(null);
      setFormData({ name: '', status: 'Active' });
    } catch (error) {
      console.error('Error saving customer:', error);
      alert(t('errorSavingCustomer'));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <ManagementSection 
        title={t('customerManagement')} 
        buttonText={t('addNewCustomer')} 
        onAdd={handleAddNew}
      >
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('name')}
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
            {customers.map((customer: Customer) => (
              <tr key={customer.id}>
                <td className="px-4 py-2">{customer.name}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={customer.status} />
                </td>
                <td className="px-4 py-2">
                  <ActionButtons 
                    onEdit={() => handleEdit(customer)} 
                    onDelete={() => handleDelete(customer.id)} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ManagementSection>

      {/* Customer Form Modal */}
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
              {editingCustomer ? t('editCustomer') : t('addNewCustomer')}
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
                  {editingCustomer ? t('update') : t('create')}
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
