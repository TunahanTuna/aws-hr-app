import React, { useState } from 'react';
import { Check, XCircle } from 'lucide-react';
import type { TimeEntry, User, Project, Customer, TaskType, Division } from '../../types';
import { useUsers, useProjects, useCustomers, useTaskTypes, useDivisions } from '../../lib/graphql/hooks';
import { findById } from '../../utils/helpers';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { useLanguage } from '../../i18n/useLanguage';

interface EditableRowProps {
  entry: TimeEntry;
  onSave: (updatedEntry: TimeEntry) => void;
  onCancel: () => void;
}

export const EditableRow: React.FC<EditableRowProps> = ({ entry, onSave, onCancel }) => {
  const { t } = useLanguage();
  
  // GraphQL hooks
  const { data: usersData, loading: usersLoading, error: usersError } = useUsers();
  const { data: projectsData, loading: projectsLoading, error: projectsError } = useProjects();
  const { data: customersData, loading: customersLoading, error: customersError } = useCustomers();
  const { data: taskTypesData, loading: taskTypesLoading, error: taskTypesError } = useTaskTypes();
  const { data: divisionsData, loading: divisionsLoading, error: divisionsError } = useDivisions();

  const users: User[] = usersData?.users || [];
  const customers: Customer[] = customersData?.customers || [];
  const projects: Project[] = projectsData?.projects || [];
  const divisions: Division[] = divisionsData?.divisions || [];
  const taskTypes: TaskType[] = taskTypesData?.task_types || [];

  const loading = usersLoading || projectsLoading || customersLoading || taskTypesLoading || divisionsLoading;
  const error = usersError || projectsError || customersError || taskTypesError || divisionsError;

  const [editedEntry, setEditedEntry] = useState<TimeEntry>(entry);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  const handleChange = (field: keyof TimeEntry, value: string | number | boolean): void => {
    setEditedEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerChange = (newCustomerId: string): void => {
    const firstProjectOfCustomer = projects.find((p: Project) => p.customer_id === newCustomerId);
    setEditedEntry(prev => ({
      ...prev,
      project_id: firstProjectOfCustomer ? firstProjectOfCustomer.id : '',
    }));
  };

  const currentProject = findById(projects, editedEntry.project_id);
  const availableProjects = projects.filter((p: Project) => p.customer_id === (currentProject?.customer_id || ''));

  return (
    <tr className="bg-red-50">
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => onSave(editedEntry)} 
            className="p-1 text-green-600 hover:bg-green-100 rounded-md"
            title={t('save')}
          >
            <Check className="h-4 w-4" />
          </button>
          <button 
            onClick={onCancel} 
            className="p-1 text-red-600 hover:bg-red-100 rounded-md"
            title={t('cancel')}
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      </td>
      <td className="px-2 py-1">
        <input 
          type="date" 
          value={editedEntry.date} 
          onChange={(e) => handleChange('date', e.target.value)} 
          className="table-input" 
        />
      </td>
      <td className="px-2 py-1">
        <select 
          value={editedEntry.user_id} 
          onChange={(e) => handleChange('user_id', e.target.value)} 
          className="table-input"
        >
          {users.map((u: User) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-1">
        <select 
          value={currentProject?.customer_id || ''} 
          onChange={(e) => handleCustomerChange(e.target.value)} 
          className="table-input"
        >
          {customers.map((c: Customer) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-1">
        <select 
          value={editedEntry.project_id} 
          onChange={(e) => handleChange('project_id', e.target.value)} 
          className="table-input"
        >
          {availableProjects.map((p: Project) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-1">
        <select 
          value={editedEntry.division_id} 
          onChange={(e) => handleChange('division_id', e.target.value)} 
          className="table-input"
        >
          {divisions.map((d: Division) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-1">
        <select 
          value={editedEntry.task_type_id} 
          onChange={(e) => handleChange('task_type_id', e.target.value)} 
          className="table-input"
        >
          {taskTypes.map((t: TaskType) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-1">
        <textarea 
          value={editedEntry.description} 
          onChange={(e) => handleChange('description', e.target.value)} 
          className="table-input resize-none" 
          rows={2}
        />
      </td>
      <td className="px-2 py-1">
        <input 
          type="number" 
          step="0.1" 
          min="0" 
          max="24" 
          value={editedEntry.effort} 
          onChange={(e) => handleChange('effort', parseFloat(e.target.value) || 0)} 
          className="table-input w-20" 
        />
      </td>
      <td className="px-2 py-1 text-center">
        <input 
          type="checkbox" 
          checked={editedEntry.is_billable} 
          onChange={(e) => handleChange('is_billable', e.target.checked)} 
          className="h-4 w-4"
        />
      </td>
    </tr>
  );
};
