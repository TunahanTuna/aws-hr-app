import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Save, X, User, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useProjectTasks, useCreateProjectTask, useUpdateProjectTask, useDeleteProjectTask, useUsers } from '../../lib/graphql/hooks';
import { useLanguage } from '../../i18n/useLanguage';
import { useToast } from '../../store/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { ManagementSection } from './ManagementSection';

interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

interface ProjectTaskForm {
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assigned_to: string;
  estimated_hours: string;
  actual_hours: string;
  due_date: string;
}

interface ManageProjectTasksProps {
  projectId: string;
  projectName: string;
}

export const ManageProjectTasks: React.FC<ManageProjectTasksProps> = ({ projectId, projectName }) => {
  const { t } = useLanguage();
  const { showError } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  
  const { data: tasksData, loading, error } = useProjectTasks(projectId);
  const { data: usersData } = useUsers();
  const [createProjectTask] = useCreateProjectTask();
  const [updateProjectTask] = useUpdateProjectTask();
  const [deleteProjectTask] = useDeleteProjectTask();

  const tasks = tasksData?.project_tasks || [];
  const users = usersData?.users || [];

  // Helper function to get user by ID
  const getUserById = (userId: string | null | undefined) => {
    if (!userId) return null;
    return users.find((user: any) => user.id === userId) || null;
  };

  const [formData, setFormData] = useState<ProjectTaskForm>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assigned_to: '',
    estimated_hours: '',
    actual_hours: '',
    due_date: ''
  });

  const handleAddNew = (): void => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      assigned_to: '',
      estimated_hours: '',
      actual_hours: '',
      due_date: ''
    });
    setIsFormOpen(true);
  };

  const handleEdit = (task: ProjectTask): void => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assigned_to: task.assigned_to || '',
      estimated_hours: task.estimated_hours?.toString() || '',
      actual_hours: task.actual_hours?.toString() || '',
      due_date: task.due_date || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm(t('deleteTaskConfirmation'))) {
      try {
        await deleteProjectTask({ variables: { id } });
      } catch (error) {
        console.error('Error deleting task:', error);
        showError(t('errorDeletingTask'));
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
        status: formData.status,
        priority: formData.priority,
        assigned_to: formData.assigned_to || null,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        actual_hours: formData.actual_hours ? parseFloat(formData.actual_hours) : null,
        due_date: formData.due_date || null
      };

      if (editingTask) {
        await updateProjectTask({
          variables: {
            id: editingTask.id,
            input
          }
        });
      } else {
        await createProjectTask({
          variables: { input }
        });
      }
      setIsFormOpen(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        assigned_to: '',
        estimated_hours: '',
        actual_hours: '',
        due_date: ''
      });
    } catch (error) {
      console.error('Error saving task:', error);
      showError(t('errorSavingTask'));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return t('priorityHigh');
      case 'medium': return t('priorityMedium');
      case 'low': return t('priorityLow');
      default: return priority;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return t('taskCompleted');
      case 'in_progress': return t('taskInProgress');
      case 'pending': return t('taskPending');
      case 'cancelled': return t('taskCancelled');
      default: return status;
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <ManagementSection
        title={`${t('projectTasks')} - ${projectName}`}
        onAdd={handleAddNew}
        buttonText={t('addNewTask')}
      >
        <div className="grid gap-4">
          {tasks.map((task: ProjectTask) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <Badge className={getPriorityColor(task.priority)}>
                        {getPriorityText(task.priority)}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusText(task.status)}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {getUserById(task.assigned_to) && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{getUserById(task.assigned_to)?.name}</span>
                        </div>
                      )}
                      
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {task.estimated_hours && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{task.estimated_hours}h {t('estimated')}</span>
                        </div>
                      )}
                      
                      {task.actual_hours && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          <span>{task.actual_hours}h {t('actual')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {tasks.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">{t('noTasksFound')}</p>
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
                  {editingTask ? t('editTask') : t('addNewTask')}
                </CardTitle>
              </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      {t('title')} *
                    </label>
                    <Input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder={t('taskTitle')}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      {t('description')}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t('taskDesc')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('status')}
                    </label>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectTaskForm['status'] })}
                    >
                      <option value="pending">{t('taskPending')}</option>
                      <option value="in_progress">{t('taskInProgress')}</option>
                      <option value="completed">{t('taskCompleted')}</option>
                      <option value="cancelled">{t('taskCancelled')}</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('priority')}
                    </label>
                    <Select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProjectTaskForm['priority'] })}
                    >
                      <option value="low">{t('priorityLow')}</option>
                      <option value="medium">{t('priorityMedium')}</option>
                      <option value="high">{t('priorityHigh')}</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('assignedTo')}
                    </label>
                    <Select
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    >
                      <option value="">{t('selectUser')}</option>
                      {users.map((user: any) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('dueDate')}
                    </label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('estimatedHours')}
                    </label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.estimated_hours}
                      onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                      placeholder="0.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('actualHours')}
                    </label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.actual_hours}
                      onChange={(e) => setFormData({ ...formData, actual_hours: e.target.value })}
                      placeholder="0.0"
                    />
                  </div>
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
                    {editingTask ? t('update') : t('create')}
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
