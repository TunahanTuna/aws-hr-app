import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Save, X, Calendar, Flag } from 'lucide-react';
import { useProjectMilestones, useCreateProjectMilestone, useUpdateProjectMilestone, useDeleteProjectMilestone } from '../../lib/graphql/hooks';
import { useLanguage } from '../../i18n/useLanguage';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { ManagementSection } from './ManagementSection';

interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  created_at: string;
  updated_at: string;
}

interface ProjectMilestoneForm {
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

interface ManageProjectMilestonesProps {
  projectId: string;
  projectName: string;
}

export const ManageProjectMilestones: React.FC<ManageProjectMilestonesProps> = ({ projectId, projectName }) => {
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  
  const { data: milestonesData, loading, error } = useProjectMilestones(projectId);
  const [createProjectMilestone] = useCreateProjectMilestone();
  const [updateProjectMilestone] = useUpdateProjectMilestone();
  const [deleteProjectMilestone] = useDeleteProjectMilestone();

  const milestones = milestonesData?.project_milestones || [];

  const [formData, setFormData] = useState<ProjectMilestoneForm>({
    title: '',
    description: '',
    due_date: '',
    status: 'pending'
  });

  const handleAddNew = (): void => {
    setEditingMilestone(null);
    setFormData({
      title: '',
      description: '',
      due_date: '',
      status: 'pending'
    });
    setIsFormOpen(true);
  };

  const handleEdit = (milestone: ProjectMilestone): void => {
    setEditingMilestone(milestone);
    setFormData({
      title: milestone.title,
      description: milestone.description || '',
      due_date: milestone.due_date,
      status: milestone.status
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm(t('deleteMilestoneConfirmation'))) {
      try {
        await deleteProjectMilestone({ variables: { id } });
      } catch (error) {
        console.error('Error deleting milestone:', error);
        alert(t('errorDeletingMilestone'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const input = {
        project_id: projectId,
        title: formData.title,
        description: formData.description || null,
        due_date: formData.due_date,
        status: formData.status
      };

      if (editingMilestone) {
        await updateProjectMilestone({
          variables: {
            id: editingMilestone.id,
            input
          }
        });
      } else {
        await createProjectMilestone({
          variables: { input }
        });
      }
      setIsFormOpen(false);
      setEditingMilestone(null);
      setFormData({
        title: '',
        description: '',
        due_date: '',
        status: 'pending'
      });
    } catch (error) {
      console.error('Error saving milestone:', error);
      alert(t('errorSavingMilestone'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return t('taskCompleted');
      case 'in_progress': return t('taskInProgress');
      case 'pending': return t('taskPending');
      case 'overdue': return t('milestoneOverdue');
      default: return status;
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'completed' && new Date(dueDate) < new Date();
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <ManagementSection
        title={`${t('projectMilestones')} - ${projectName}`}
        onAdd={handleAddNew}
        buttonText={t('addNewMilestone')}
      >
        <div className="grid gap-4">
          {milestones.map((milestone: ProjectMilestone) => (
            <Card 
              key={milestone.id} 
              className={`hover:shadow-md transition-shadow ${isOverdue(milestone.due_date, milestone.status) ? 'border-red-200 bg-red-50' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Flag className="h-4 w-4 text-gray-500" />
                      <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                      <Badge className={getStatusColor(milestone.status)}>
                        {getStatusText(milestone.status)}
                      </Badge>
                      {isOverdue(milestone.due_date, milestone.status) && (
                        <Badge className="bg-red-100 text-red-800">
                          {t('overdue')}
                        </Badge>
                      )}
                    </div>
                    
                    {milestone.description && (
                      <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {t('dueDate')}: {new Date(milestone.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(milestone)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(milestone.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {milestones.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">{t('noMilestonesFound')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </ManagementSection>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-4xl"
          >
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>
                  {editingMilestone ? t('editMilestone') : t('addNewMilestone')}
                </CardTitle>
              </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('title')} *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('milestoneTitle')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('description')}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('milestoneDesc')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('dueDate')} *
                  </label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('status')}
                  </label>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectMilestoneForm['status'] })}
                  >
                    <option value="pending">{t('taskPending')}</option>
                    <option value="in_progress">{t('taskInProgress')}</option>
                    <option value="completed">{t('taskCompleted')}</option>
                    <option value="overdue">{t('milestoneOverdue')}</option>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t('cancel')}
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {editingMilestone ? t('update') : t('create')}
                  </Button>
                </div>
              </form>
            </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </>
  );
};
