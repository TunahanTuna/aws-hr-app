import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../i18n/useLanguage';
import { ManagementSection } from './ManagementSection';
import { ActionButtons } from '../ui/ActionButtons';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { useSpecialDays, useCreateSpecialDay, useUpdateSpecialDay, useDeleteSpecialDay } from '../../lib/graphql/hooks';
import type { SpecialDay } from '../../types';

interface SpecialDayFormData {
  date: string;
  name: string;
}

export const ManageSpecialDays: React.FC = () => {
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSpecialDay, setEditingSpecialDay] = useState<SpecialDay | null>(null);
  const [formData, setFormData] = useState<SpecialDayFormData>({
    date: '',
    name: ''
  });

  // GraphQL hooks
  const { data: specialDaysData, loading, error } = useSpecialDays();
  const [createSpecialDay] = useCreateSpecialDay();
  const [updateSpecialDay] = useUpdateSpecialDay();
  const [deleteSpecialDay] = useDeleteSpecialDay();

  const specialDays = specialDaysData?.special_days || [];

  const handleAddNew = (): void => {
    setEditingSpecialDay(null);
    setFormData({ date: '', name: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (specialDay: SpecialDay): void => {
    setEditingSpecialDay(specialDay);
    setFormData({
      date: specialDay.date,
      name: specialDay.name
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm(t('deleteSpecialDayConfirmation'))) {
      try {
        await deleteSpecialDay({ variables: { id } });
      } catch (error) {
        console.error('Error deleting special day:', error);
        alert(t('errorDeletingSpecialDay'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      if (editingSpecialDay) {
        await updateSpecialDay({
          variables: {
            id: editingSpecialDay.id,
            input: formData
          }
        });
      } else {
        await createSpecialDay({
          variables: {
            input: formData
          }
        });
      }
      setIsFormOpen(false);
      setEditingSpecialDay(null);
      setFormData({ date: '', name: '' });
    } catch (error) {
      console.error('Error saving special day:', error);
      alert(t('errorSavingSpecialDay'));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <ManagementSection 
        title={t('specialDayManagement')} 
        buttonText={t('addNewSpecialDay')} 
        onAdd={handleAddNew}
      >
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('date')}
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('name')}
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {specialDays.map((specialDay: SpecialDay) => (
              <tr key={specialDay.id}>
                <td className="px-4 py-2">{new Date(specialDay.date).toLocaleDateString()}</td>
                <td className="px-4 py-2">{specialDay.name}</td>
                <td className="px-4 py-2">
                  <ActionButtons 
                    onEdit={() => handleEdit(specialDay)} 
                    onDelete={() => handleDelete(specialDay.id)} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ManagementSection>

      {/* Special Day Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white p-8 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingSpecialDay ? t('editSpecialDay') : t('addNewSpecialDay')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('date')}
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
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
                  {editingSpecialDay ? t('update') : t('create')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};
