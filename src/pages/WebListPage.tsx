import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { useLanguage } from '../i18n/useLanguage';
import { useToast } from '../store/ToastContext';
import { useUsers, useProjects, useDivisions, useTaskTypes, useTimeEntries, useCreateTimeEntry, useUpdateTimeEntry, useDeleteTimeEntry } from '../lib/graphql/hooks';
import { FilterSection } from '../components/filters/FilterSection';
import { EditableRow } from '../components/webList/EditableRow';
import { DisplayRow } from '../components/webList/DisplayRow';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import type { FilterState, TimeEntry, User, Project, Division, TaskType } from '../types';
import { getCurrentDate, getDateNDaysAgo, isDateInRange } from '../utils/helpers';

export const WebListPage: React.FC = () => {
  const { t } = useLanguage();
  const { showError, showWarning } = useToast();

  // GraphQL hooks
  const { data: usersData, loading: usersLoading, error: usersError } = useUsers();
  const { data: projectsData, loading: projectsLoading, error: projectsError } = useProjects();
  const { data: divisionsData, loading: divisionsLoading, error: divisionsError } = useDivisions();
  const { data: taskTypesData, loading: taskTypesLoading, error: taskTypesError } = useTaskTypes();
  const { data: timeEntriesData, loading: timeEntriesLoading, error: timeEntriesError } = useTimeEntries();
  
  const [createTimeEntry] = useCreateTimeEntry();
  const [updateTimeEntry] = useUpdateTimeEntry();
  const [deleteTimeEntry] = useDeleteTimeEntry();

  const users = useMemo<User[]>(() => usersData?.users || [], [usersData?.users]);
  const projects = useMemo<Project[]>(() => projectsData?.projects || [], [projectsData?.projects]);
  const divisions = useMemo<Division[]>(() => divisionsData?.divisions || [], [divisionsData?.divisions]);
  const taskTypes = useMemo<TaskType[]>(() => taskTypesData?.task_types || [], [taskTypesData?.task_types]);
  const timeEntries = useMemo<TimeEntry[]>(() => timeEntriesData?.time_entries || [], [timeEntriesData?.time_entries]);

  const loading = usersLoading || projectsLoading || divisionsLoading || taskTypesLoading || timeEntriesLoading;
  const error = usersError || projectsError || divisionsError || taskTypesError || timeEntriesError;

  const [filters, setFilters] = useState<FilterState>({
    startDate: getDateNDaysAgo(365),
    endDate: getCurrentDate(),
    assigneeId: '',
    customerId: '',
    projectId: '',
    divisionId: '',
  });

  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    return timeEntries.filter((entry: TimeEntry) => {
      // Date filter
      if (filters.startDate && filters.endDate) {
        if (!isDateInRange(entry.date, filters.startDate, filters.endDate)) {
          return false;
        }
      }

      // Assignee filter
      if (filters.assigneeId && entry.user_id !== filters.assigneeId) {
        return false;
      }

      // Customer filter (through project)
      if (filters.customerId) {
        const project = projects.find((p: Project) => p.id === entry.project_id);
        if (!project || project.customer_id !== filters.customerId) {
          return false;
        }
      }

      // Project filter
      if (filters.projectId && entry.project_id !== filters.projectId) {
        return false;
      }

      // Division filter
      if (filters.divisionId && entry.division_id !== filters.divisionId) {
        return false;
      }

      return true;
    });
  }, [timeEntries, filters, projects]);

  const handleFilterChange = (field: keyof FilterState, value: string): void => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearFilters = (): void => {
    setFilters({
      startDate: getDateNDaysAgo(365),
      endDate: getCurrentDate(),
      assigneeId: '',
      customerId: '',
      projectId: '',
      divisionId: '',
    });
  };

  const handleApplyFilters = (): void => {
    // Filters are applied automatically through state updates
    console.log('Filters applied:', filters);
  };

  const handleAddNew = async (): Promise<void> => {
    try {
      // Ensure reference data exists
      if (!users.length || !projects.length || !taskTypes.length || !divisions.length) {
        showWarning('Please ensure there is at least 1 User, Project, Task Type and Division defined.');
        return;
      }

      const result = await createTimeEntry({
        variables: {
          input: {
            date: getCurrentDate(),
            user_id: users[0].id,
            project_id: projects[0].id,
            task_type_id: taskTypes[0].id,
            division_id: divisions[0].id,
            description: '',
            effort: 0.5,
            is_billable: true,
          }
        }
      });

      if (result.data?.insert_time_entries_one) {
        setEditingRowId(result.data.insert_time_entries_one.id);
      }
    } catch (error) {
      console.error('Error creating new time entry:', error);
      showError(t('errorCreatingEntry'));
    }
  };

  const handleSave = async (updatedEntry: TimeEntry): Promise<void> => {
    try {
      await updateTimeEntry({
        variables: {
          id: updatedEntry.id,
          input: {
            date: updatedEntry.date,
            user_id: updatedEntry.user_id,
            project_id: updatedEntry.project_id,
            task_type_id: updatedEntry.task_type_id,
            division_id: updatedEntry.division_id,
            description: updatedEntry.description,
            effort: updatedEntry.effort,
            is_billable: updatedEntry.is_billable,
          }
        }
      });
      setEditingRowId(null);
    } catch (error) {
      console.error('Error updating time entry:', error);
      showError(t('errorUpdatingEntry'));
    }
  };

  const handleCancelEdit = async (id: string): Promise<void> => {
    if (id.toString().startsWith('new-')) {
      try {
        await deleteTimeEntry({ variables: { id } });
      } catch (error) {
        console.error('Error deleting time entry:', error);
      }
    }
    setEditingRowId(null);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm(t('deleteConfirm'))) {
      try {
        await deleteTimeEntry({ variables: { id } });
      } catch (error) {
        console.error('Error deleting time entry:', error);
        showError(t('errorDeletingEntry'));
      }
    }
  };
  
  const handleDuplicate = async (entryToDuplicate: TimeEntry): Promise<void> => {
    try {
      const result = await createTimeEntry({
        variables: {
          input: {
            ...entryToDuplicate,
            id: undefined, // Remove id for new entry
            date: getCurrentDate(),
          }
        }
      });

      if (result.data?.insert_time_entries_one) {
        setEditingRowId(result.data.insert_time_entries_one.id);
      }
    } catch (error) {
      console.error('Error duplicating time entry:', error);
      showError(t('errorDuplicatingEntry'));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2 
        className="text-2xl font-bold text-slate-800 mb-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {t('webListTitle')}
      </motion.h2>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <FilterSection 
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onApplyFilters={handleApplyFilters}
        />
      </motion.div>
      <motion.div 
        className="mb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.button 
          onClick={handleAddNew} 
          className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusCircle className="h-4 w-4" />
          <span>{t('addNewLine')}</span>
        </motion.button>
      </motion.div>
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-x-auto"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        whileHover={{ scale: 1.01 }}
      >
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-2 py-2 text-left font-semibold text-slate-600">
                {t('actions')}
              </th>
              <th className="px-2 py-2 text-left font-semibold text-slate-600">
                {t('date')}
              </th>
              <th className="px-2 py-2 text-left font-semibold text-slate-600">
                {t('assignee')}
              </th>
              <th className="px-2 py-2 text-left font-semibold text-slate-600">
                {t('customer')}
              </th>
              <th className="px-2 py-2 text-left font-semibold text-slate-600">
                {t('project')}
              </th>
              <th className="px-2 py-2 text-left font-semibold text-slate-600">
                {t('division')}
              </th>
              <th className="px-2 py-2 text-left font-semibold text-slate-600">
                {t('taskType')}
              </th>
              <th className="px-2 py-2 text-left font-semibold text-slate-600">
                {t('taskDescription')}
              </th>
              <th className="px-2 py-2 text-left font-semibold text-slate-600">
                {t('effortHours')}
              </th>
              <th className="px-2 py-2 text-left font-semibold text-slate-600">
                {t('billable')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEntries.map((entry: TimeEntry) => (
              editingRowId === entry.id ? (
                <EditableRow 
                  key={entry.id} 
                  entry={entry} 
                  onSave={handleSave} 
                  onCancel={() => handleCancelEdit(entry.id)} 
                />
              ) : (
                <DisplayRow 
                  key={entry.id} 
                  entry={entry} 
                  onEdit={setEditingRowId} 
                  onDelete={handleDelete} 
                  onDuplicate={handleDuplicate} 
                />
              )
            ))}
          </tbody>
        </table>
        {filteredEntries.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No time entries found with current filters.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
