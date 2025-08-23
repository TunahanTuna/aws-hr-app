import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../i18n/useLanguage';
import { ManagementSection } from './ManagementSection';
import { ActionButtons } from '../ui/ActionButtons';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { useDynamicParameters, useCreateDynamicParameter, useUpdateDynamicParameter } from '../../lib/graphql/hooks';
import type { DynamicParameter } from '../../types';

interface ParameterFormData {
  key: string;
  value: string;
  description: string;
}

export const ManageParameters: React.FC = () => {
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<DynamicParameter | null>(null);
  const [formData, setFormData] = useState<ParameterFormData>({
    key: '',
    value: '',
    description: ''
  });

  // GraphQL hooks
  const { data: parametersData, loading, error } = useDynamicParameters();
  const [createParameter] = useCreateDynamicParameter();
  const [updateParameter] = useUpdateDynamicParameter();

  const parameters = parametersData?.dynamic_parameters || [];

  const handleAddNew = (): void => {
    setEditingParameter(null);
    setFormData({ key: '', value: '', description: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (parameter: DynamicParameter): void => {
    setEditingParameter(parameter);
    setFormData({
      key: parameter.key,
      value: parameter.value,
      description: parameter.description || ''
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      if (editingParameter) {
        await updateParameter({
          variables: {
            id: editingParameter.id,
            input: formData
          }
        });
      } else {
        await createParameter({
          variables: {
            input: formData
          }
        });
      }
      setIsFormOpen(false);
      setEditingParameter(null);
      setFormData({ key: '', value: '', description: '' });
    } catch (error) {
      console.error('Error saving parameter:', error);
      alert(t('errorSavingParameter'));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <ManagementSection 
        title={t('dynamicParametersManagement')} 
        buttonText={t('addNewParameter')} 
        onAdd={handleAddNew}
      >
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('key')}
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('value')}
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('description')}
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {parameters.map((parameter: DynamicParameter) => (
              <tr key={parameter.id}>
                <td className="px-4 py-2 font-mono text-sm">{parameter.key}</td>
                <td className="px-4 py-2">{parameter.value}</td>
                <td className="px-4 py-2 text-slate-600">{parameter.description || '-'}</td>
                <td className="px-4 py-2">
                  <ActionButtons 
                    onEdit={() => handleEdit(parameter)} 
                    onDelete={undefined}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ManagementSection>

      {/* Parameter Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white p-8 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingParameter ? t('editParameter') : t('addNewParameter')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('key')}
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!!editingParameter} // Key can't be changed after creation
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('value')}
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
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
                  {editingParameter ? t('update') : t('create')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};
