import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../i18n/useLanguage';
import { ManagementSection } from './ManagementSection';
import { ActionButtons } from '../ui/ActionButtons';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { useDivisions, useCreateDivision, useUpdateDivision, useDeleteDivision } from '../../lib/graphql/hooks';
import type { Division } from '../../types';

interface DivisionFormData {
  name: string;
}

export const ManageDivisions: React.FC = () => {
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [formData, setFormData] = useState<DivisionFormData>({
    name: ''
  });

  // GraphQL hooks
  const { data: divisionsData, loading, error } = useDivisions();
  const [createDivision] = useCreateDivision();
  const [updateDivision] = useUpdateDivision();
  const [deleteDivision] = useDeleteDivision();

  const divisions = divisionsData?.divisions || [];

  const handleAddNew = (): void => {
    setEditingDivision(null);
    setFormData({ name: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (division: Division): void => {
    setEditingDivision(division);
    setFormData({
      name: division.name
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm(t('deleteDivisionConfirmation'))) {
      try {
        await deleteDivision({ variables: { id } });
      } catch (error) {
        console.error('Error deleting division:', error);
        alert(t('errorDeletingDivision'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      if (editingDivision) {
        await updateDivision({
          variables: {
            id: editingDivision.id,
            input: formData
          }
        });
      } else {
        await createDivision({
          variables: {
            input: formData
          }
        });
      }
      setIsFormOpen(false);
      setEditingDivision(null);
      setFormData({ name: '' });
    } catch (error) {
      console.error('Error saving division:', error);
      alert(t('errorSavingDivision'));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <ManagementSection 
        title={t('divisionManagement')} 
        buttonText={t('addNewDivision')} 
        onAdd={handleAddNew}
      >
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('name')}
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {divisions.map((division: Division) => (
              <tr key={division.id}>
                <td className="px-4 py-2">{division.name}</td>
                <td className="px-4 py-2">
                  <ActionButtons 
                    onEdit={() => handleEdit(division)} 
                    onDelete={() => handleDelete(division.id)} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ManagementSection>

      {/* Division Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white p-8 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingDivision ? t('editDivision') : t('addNewDivision')}
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
                  {editingDivision ? t('update') : t('create')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};
