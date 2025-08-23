import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, FileText, Briefcase, Tag, User as UserIcon, Calendar, Clock, LayoutDashboard, Save, CheckCircle } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';
import { useToast } from '../store/ToastContext';
import { useUsers, useCustomers, useProjects, useDivisions, useTaskTypes, useCreateTimeEntry, useProjectTasks } from '../lib/graphql/hooks';

import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { NewTimeEntryForm, User, Customer, Project, Division, TaskType, ProjectTask } from '../types';
import { getCurrentDate, isValidEffort } from '../utils/helpers';

export const NewEntryPage: React.FC = () => {
  const { t } = useLanguage();
  const { showError, showSuccess, showWarning } = useToast();

  // GraphQL hooks
  const { data: usersData, loading: usersLoading, error: usersError } = useUsers();
  const { data: customersData, loading: customersLoading, error: customersError } = useCustomers();
  const { data: projectsData, loading: projectsLoading, error: projectsError } = useProjects();
  const { data: divisionsData, loading: divisionsLoading, error: divisionsError } = useDivisions();
  const { data: taskTypesData, loading: taskTypesLoading, error: taskTypesError } = useTaskTypes();
  const [createTimeEntry, { loading: createTimeEntryLoading }] = useCreateTimeEntry();

  const users = useMemo<User[]>(() => usersData?.users || [], [usersData?.users]);
  const customers = useMemo<Customer[]>(() => customersData?.customers || [], [customersData?.customers]);
  const projects = useMemo<Project[]>(() => projectsData?.projects || [], [projectsData?.projects]);
  const divisions = useMemo<Division[]>(() => divisionsData?.divisions || [], [divisionsData?.divisions]);
  const taskTypes = useMemo<TaskType[]>(() => taskTypesData?.task_types || [], [taskTypesData?.task_types]);

  const loading = usersLoading || customersLoading || projectsLoading || divisionsLoading || taskTypesLoading;
  const error = usersError || customersError || projectsError || divisionsError || taskTypesError;

  const [formData, setFormData] = useState<NewTimeEntryForm>({
    description: '',
    customerId: '',
    projectId: '',
    taskId: '',
    divisionId: '',
    typeId: '',
    userId: '',
    date: getCurrentDate(),
    effort: 0.5, // Set default to 0.5 hours instead of 0
    isBillable: true,
  });

  // Project tasks hook - depends on selected project
  const { data: projectTasksData } = useProjectTasks(formData.projectId);
  const projectTasks = useMemo<ProjectTask[]>(() => projectTasksData?.project_tasks || [], [projectTasksData?.project_tasks]);

  const projectsForCustomer = useMemo<Project[]>(() => {
    if (!formData.customerId) return [] as Project[];
    return projects.filter((p: Project) => p.customer_id === formData.customerId);
  }, [projects, formData.customerId]);

  // Pre-fill defaults so form can be saved quickly
  useEffect(() => {
    if (!users.length || !customers.length || !divisions.length || !taskTypes.length) return;
    
    setFormData(prev => {
      const next = { ...prev };
      
      if (!prev.customerId) {
        next.customerId = customers[0].id;
      }
      const customerId = next.customerId || customers[0].id;
      const projList = projects.filter((p: Project) => p.customer_id === customerId);
      if (!prev.projectId && projList[0]) {
        next.projectId = projList[0].id;
      }
      if (!prev.divisionId) {
        next.divisionId = divisions[0].id;
      }
      if (!prev.typeId) {
        next.typeId = taskTypes[0].id;
      }
      if (!prev.userId) {
        next.userId = users[0].id;
      }
      if (!prev.effort || prev.effort <= 0) {
        next.effort = 0.5;
      }
      
      return next;
    });
  }, [users, customers, projects, divisions, taskTypes]);

  const handleInputChange = (field: keyof NewTimeEntryForm, value: string | number | boolean): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Reset project when customer changes
    if (field === 'customerId') {
      setFormData(prev => ({
        ...prev,
        projectId: '',
        taskId: '',
      }));
    }

    // Reset task when project changes
    if (field === 'projectId') {
      setFormData(prev => ({
        ...prev,
        taskId: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.description.trim()) {
      showWarning(t('requiredField') + ': ' + t('taskDescription'));
      return false;
    }
    if (!formData.customerId) {
      showWarning(t('requiredField') + ': ' + t('customer'));
      return false;
    }
    if (!formData.projectId) {
      showWarning(t('requiredField') + ': ' + t('project'));
      return false;
    }
    if (!formData.divisionId) {
      showWarning(t('requiredField') + ': ' + t('division'));
      return false;
    }
    if (!formData.typeId) {
      showWarning(t('requiredField') + ': ' + t('taskType'));
      return false;
    }
    if (!formData.userId) {
      showWarning(t('requiredField') + ': ' + t('assignee'));
      return false;
    }
    if (!formData.date) {
      showWarning(t('requiredField') + ': ' + t('date'));
      return false;
    }
    if (!isValidEffort(formData.effort)) {
      showWarning(t('invalidEffort'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createTimeEntry({
        variables: {
          input: {
            date: formData.date,
            effort: formData.effort,
            description: formData.description.trim(),
            is_billable: formData.isBillable,
            user_id: formData.userId,
            project_id: formData.projectId,
            task_id: formData.taskId || null,
            task_type_id: formData.typeId,
            division_id: formData.divisionId,
          }
        }
      });

      // ACTUAL HOURS GÜNCELLEMESİ - Eğer task_id varsa actual_hours'ı güncelle
      if (formData.taskId) {
        try {
          // Önce o task için toplam effort'u hesapla
          const timeEntriesResponse = await fetch('http://localhost:8080/v1/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-hasura-admin-secret': 'myadminsecretkey'
            },
            body: JSON.stringify({
              query: `query GetTaskTimeEntries($taskId: uuid!) {
                time_entries(where: {task_id: {_eq: $taskId}}) {
                  effort
                }
              }`,
              variables: { taskId: formData.taskId }
            })
          });
          
          const timeEntriesData = await timeEntriesResponse.json();
          const totalEffort = timeEntriesData.data.time_entries.reduce((sum: number, entry: any) => sum + entry.effort, 0);
          
          // Actual hours'ı güncelle
          await fetch('http://localhost:8080/v1/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-hasura-admin-secret': 'myadminsecretkey'
            },
            body: JSON.stringify({
              query: `mutation UpdateTaskActualHours($taskId: uuid!, $actualHours: numeric!) {
                update_project_tasks_by_pk(pk_columns: {id: $taskId}, _set: {actual_hours: $actualHours}) {
                  id
                  actual_hours
                }
              }`,
              variables: { taskId: formData.taskId, actualHours: totalEffort }
            })
          });
        } catch (updateError) {
          console.error('Error updating actual hours:', updateError);
          // Bu hata önemli değil, entry başarıyla eklendi
        }
      }

      // Reset form
      setFormData({
        description: '',
        customerId: '',
        projectId: '',
        taskId: '',
        divisionId: '',
        typeId: '',
        userId: '',
        date: getCurrentDate(),
        effort: 0.5,
        isBillable: true,
      });

      showSuccess(t('saveSuccess'));
    } catch (error) {
      console.error('Error creating time entry:', error);
      showError(t('errorSavingEntry') + ': ' + (error as any)?.message || 'Unknown error');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

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
          className="p-3 bg-purple-100 rounded-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <PlusCircle className="h-8 w-8 text-purple-600" />
        </motion.div>
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">New Time Entry</h1>
          <p className="text-gray-600 mt-1">Create a new time tracking entry</p>
        </motion.div>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        whileHover={{ scale: 1.01 }}
      >
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <motion.div 
                className="p-2 bg-blue-100 rounded-lg"
                whileHover={{ rotate: 10 }}
                transition={{ duration: 0.2 }}
              >
                <FileText className="h-5 w-5 text-blue-600" />
              </motion.div>
              <div>
                <CardTitle className="text-xl">Time Entry Details</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Fill in the details below to create a new time entry</p>
              </div>
            </div>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span>{t('taskDescription')}</span>
                <Badge variant="jiraError" className="text-xs">Required</Badge>
              </label>
              <textarea 
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                rows={3} 
                placeholder={t('whatDidYouWorkOn')}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>

            {/* Project Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span>{t('customer')}</span>
                  <Badge variant="jiraError" className="text-xs">Required</Badge>
                </label>
                <Select
                  value={formData.customerId} 
                  onChange={(e) => handleInputChange('customerId', e.target.value)}
                  required
                >
                  <option value="">{t('selectCustomer')}</option>
                  {customers.map((c: Customer) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>{t('project')}</span>
                  <Badge variant="jiraError" className="text-xs">Required</Badge>
                </label>
                <Select
                  disabled={!formData.customerId}
                  value={formData.projectId}
                  onChange={(e) => handleInputChange('projectId', e.target.value)}
                  required
                >
                  <option value="">{t('selectProject')}</option>
                  {projectsForCustomer.map((p: Project) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </div>

              {/* Task Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-gray-500" />
                  <span>Task</span>
                  <Badge variant="jiraWarning" className="text-xs">Optional</Badge>
                </label>
                <Select
                  disabled={!formData.projectId}
                  value={formData.taskId}
                  onChange={(e) => handleInputChange('taskId', e.target.value)}
                >
                  <option value="">Select Task (Optional)</option>
                  {projectTasks.map((task: ProjectTask) => (
                    <option key={task.id} value={task.id}>
                      {task.title} ({task.status})
                    </option>
                  ))}
                </Select>
                {formData.projectId && projectTasks.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No tasks available for this project</p>
                )}
              </div>
            </div>

            {/* Task Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <LayoutDashboard className="h-4 w-4 text-gray-500" />
                  <span>{t('division')}</span>
                  <Badge variant="jiraError" className="text-xs">Required</Badge>
                </label>
                <Select
                  value={formData.divisionId}
                  onChange={(e) => handleInputChange('divisionId', e.target.value)}
                  required
                >
                  <option value="">Departman seçin...</option>
                  {divisions.map((d: Division) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span>{t('taskType')}</span>
                  <Badge variant="jiraError" className="text-xs">Required</Badge>
                </label>
                <Select
                  value={formData.typeId}
                  onChange={(e) => handleInputChange('typeId', e.target.value)}
                  required
                >
                  <option value="">{t('selectTaskType')}</option>
                  {taskTypes.map((t: TaskType) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <span>{t('assignee')}</span>
                  <Badge variant="jiraError" className="text-xs">Required</Badge>
                </label>
                <Select
                  value={formData.userId}
                  onChange={(e) => handleInputChange('userId', e.target.value)}
                  required
                >
                  <option value="">{t('selectAssignee')}</option>
                  {users.map((u: User) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Date and Effort */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{t('date')}</span>
                  <Badge variant="jiraError" className="text-xs">Required</Badge>
                </label>
                <Input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{t('effortHours')}</span>
                  <Badge variant="jiraError" className="text-xs">Required</Badge>
                </label>
                <Input 
                  type="number" 
                  step="0.1" 
                  min="0.1"
                  max="24"
                  placeholder={t('effortPlaceholder')}
                  value={formData.effort || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    handleInputChange('effort', isNaN(value) ? 0.1 : value);
                  }}
                  required
                />
              </div>
            </div>

            {/* Billable Checkbox */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <input 
                id="billable" 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={formData.isBillable}
                onChange={(e) => handleInputChange('isBillable', e.target.checked)}
              />
              <label htmlFor="billable" className="text-sm font-medium text-gray-700">
                {t('isBillable')}
              </label>
              <Badge variant="jiraSuccess" className="ml-auto">
                {formData.isBillable ? 'Billable' : 'Non-billable'}
              </Badge>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button 
                type="submit" 
                variant="jira" 
                size="lg"
                disabled={loading || createTimeEntryLoading}
                className="flex items-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>{createTimeEntryLoading ? 'Saving...' : t('saveEntry')}</span>
              </Button>
            </div>
          </form>
        </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
