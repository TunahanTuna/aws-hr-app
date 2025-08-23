import React from 'react';
import type { TimeEntry, User, Project, Customer, TaskType, Division } from '../../types';
import { useLanguage } from '../../i18n/useLanguage';
import { useUsers, useProjects, useCustomers, useTaskTypes, useDivisions } from '../../lib/graphql/hooks';
import { findById } from '../../utils/helpers';
import { ActionButtons } from '../ui/ActionButtons';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

interface DisplayRowProps {
  entry: TimeEntry;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (entry: TimeEntry) => void;
}

export const DisplayRow: React.FC<DisplayRowProps> = ({ 
  entry, 
  onEdit, 
  onDelete, 
  onDuplicate 
}) => {
  const { t } = useLanguage();

  // GraphQL hooks
  const { data: usersData, loading: usersLoading, error: usersError } = useUsers();
  const { data: projectsData, loading: projectsLoading, error: projectsError } = useProjects();
  const { data: customersData, loading: customersLoading, error: customersError } = useCustomers();
  const { data: taskTypesData, loading: taskTypesLoading, error: taskTypesError } = useTaskTypes();
  const { data: divisionsData, loading: divisionsLoading, error: divisionsError } = useDivisions();

  const users: User[] = usersData?.users || [];
  const projects: Project[] = projectsData?.projects || [];
  const customers: Customer[] = customersData?.customers || [];
  const taskTypes: TaskType[] = taskTypesData?.task_types || [];
  const divisions: Division[] = divisionsData?.divisions || [];

  const loading = usersLoading || projectsLoading || customersLoading || taskTypesLoading || divisionsLoading;
  const error = usersError || projectsError || customersError || taskTypesError || divisionsError;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  const user = findById(users, entry.user_id);
  const project = findById(projects, entry.project_id);
  const customer = project ? findById(customers, project.customer_id) : undefined;
  const taskType = findById(taskTypes, entry.task_type_id);
  const division = findById(divisions, entry.division_id);

  const handleEdit = (): void => {
    onEdit(entry.id);
  };

  const handleDelete = (): void => {
    onDelete(entry.id);
  };

  const handleDuplicate = (): void => {
    onDuplicate(entry);
  };

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-2 py-2 whitespace-nowrap">
        <ActionButtons
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          showDuplicate={true}
        />
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-sm text-slate-700">
        {entry.date}
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-sm text-slate-700">
        {user?.name || '-'}
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-sm text-slate-700">
        {customer?.name || '-'}
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-sm text-slate-700">
        {project?.name || '-'}
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-sm text-slate-700">
        {division?.name || '-'}
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-sm text-slate-700">
        {taskType?.name || '-'}
      </td>
      <td className="px-2 py-2 text-sm text-slate-700 truncate max-w-xs">
        {entry.description}
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-sm text-slate-700 text-right">
        {entry.effort.toFixed(2)}
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-sm text-slate-700 text-center">
        {entry.is_billable ? t('yes') : t('no')}
      </td>
    </tr>
  );
};
