import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../i18n/useLanguage';
import { ManagementSection } from './ManagementSection';
import { ActionButtons } from '../ui/ActionButtons';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Portal } from '../ui/Portal';
import { useTaskTypes, useCreateTaskType, useUpdateTaskType, useDeleteTaskType } from '../../lib/graphql/hooks';
import type { TaskType } from '../../types';

interface TaskTypeFormData {
  name: string;
}

export const ManageTaskTypes: React.FC = () => {
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTaskType, setEditingTaskType] = useState<TaskType | null>(null);
  const [formData, setFormData] = useState<TaskTypeFormData>({
    name: ''
  });

  // GraphQL hooks
  const { data: taskTypesData, loading, error } = useTaskTypes();
  const [createTaskType] = useCreateTaskType();
  const [updateTaskType] = useUpdateTaskType();
  const [deleteTaskType] = useDeleteTaskType();

  const taskTypes = taskTypesData?.task_types || [];

  const handleAddNew = (): void => {
    setEditingTaskType(null);
    setFormData({ name: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (taskType: TaskType): void => {
    setEditingTaskType(taskType);
    setFormData({
      name: taskType.name
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm(t('deleteTaskTypeConfirmation'))) {
      try {
        await deleteTaskType({ variables: { id } });
      } catch (error) {
        console.error('Error deleting task type:', error);
        alert(t('errorDeletingTaskType'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      if (editingTaskType) {
        await updateTaskType({
          variables: {
            id: editingTaskType.id,
            input: formData
          }
        });
      } else {
        await createTaskType({
          variables: {
            input: formData
          }
        });
      }
      setIsFormOpen(false);
      setEditingTaskType(null);
      setFormData({ name: '' });
    } catch (error) {
      console.error('Error saving task type:', error);
      alert(t('errorSavingTaskType'));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <ManagementSection 
        title={t('taskTypeManagement')} 
        buttonText={t('addNewTaskType')} 
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
            {taskTypes.map((taskType: TaskType) => (
              <tr key={taskType.id}>
                <td className="px-4 py-2">{taskType.name}</td>
                <td className="px-4 py-2">
                  <ActionButtons 
                    onEdit={() => handleEdit(taskType)} 
                    onDelete={() => handleDelete(taskType.id)} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ManagementSection>

      {/* Task Type Form Modal */}
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
                {editingTaskType ? t('editTaskType') : t('addNewTaskType')}
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
                    {editingTaskType ? t('update') : t('create')}
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
