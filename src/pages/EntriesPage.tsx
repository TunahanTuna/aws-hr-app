import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/useLanguage';
import { FilterSection } from '../components/filters/FilterSection';
import { TimeEntryCard } from '../components/timeEntry/TimeEntryCard';
import { PlusCircle, Filter, Calendar, Users, FolderOpen } from 'lucide-react';
import { useUsers, useProjects, useDivisions, useTaskTypes, useCreateTimeEntry } from '../lib/graphql/hooks';
import { useFilteredTimeEntries, useDeleteTimeEntry } from '../lib/graphql/hooks';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { FilterState, TimeEntry } from '../types';
import { getCurrentDate, getDateNDaysAgo } from '../utils/helpers';

export const EntriesPage: React.FC = () => {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<FilterState>({
    startDate: getDateNDaysAgo(365),
    endDate: getCurrentDate(),
    assigneeId: '',
    customerId: '',
    projectId: '',
    divisionId: '',
  });

  // Use GraphQL hook for filtered time entries
  const { data, loading, error } = useFilteredTimeEntries({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  // For quick add
  const { data: usersData } = useUsers();
  const { data: projectsData } = useProjects();
  const { data: divisionsData } = useDivisions();
  const { data: taskTypesData } = useTaskTypes();
  const [createTimeEntry] = useCreateTimeEntry();

  const [deleteTimeEntry] = useDeleteTimeEntry();
  const allEntries = data?.time_entries || [];

  // Debug info
  console.log('EntriesPage Debug:', {
    loading,
    error: error?.message,
    allEntriesCount: allEntries.length,
    filters,
    dataKeys: data ? Object.keys(data) : 'no data'
  });

  // Client-side filtering
  const filteredEntries: TimeEntry[] = allEntries.filter((entry: TimeEntry) => {
    // User filter
    if (filters.assigneeId && entry.user_id !== filters.assigneeId) {
      return false;
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

  const handleEdit = (id: string): void => {
    // Navigate to edit mode or show edit modal
    console.log('Edit entry:', id);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm(t('deleteConfirm'))) {
      try {
        await deleteTimeEntry({ variables: { id } });
      } catch (error) {
        console.error('Error deleting time entry:', error);
        alert(t('errorDeletingEntry'));
      }
    }
  };

  const handleDuplicate = (entry: TimeEntry): void => {
    // Navigate to new entry page with pre-filled data
    console.log('Duplicate entry:', entry);
    // You can implement navigation logic here
  };

  const handleAddNew = async (): Promise<void> => {
    try {
      const users = usersData?.users || [];
      const projects = projectsData?.projects || [];
      const divisions = divisionsData?.divisions || [];
      const taskTypes = taskTypesData?.task_types || [];
      if (!users.length || !projects.length || !divisions.length || !taskTypes.length) {
        alert('Please ensure there is at least 1 User, Project, Task Type and Division defined.');
        return;
      }
      await createTimeEntry({
        variables: {
          input: {
            date: filters.endDate,
            effort: 0.5,
            description: '',
            is_billable: true,
            user_id: users[0].id,
            project_id: projects[0].id,
            task_type_id: taskTypes[0].id,
            division_id: divisions[0].id,
          },
        },
      });
    } catch (error) {
      console.error('Error creating time entry:', error);
      alert('Error creating entry');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Time Entries</h1>
            <p className="text-gray-600 mt-1">Manage and track time entries across projects</p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <CardTitle>Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center min-h-[200px]">
              <LoadingSpinner size="lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Time Entries</h1>
            <p className="text-gray-600 mt-1">Manage and track time entries across projects</p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <CardTitle>Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ErrorMessage message={error.message || 'An error occurred'} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Time Entries</h1>
          <p className="text-gray-600 mt-1">Manage and track time entries across projects</p>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button onClick={handleAddNew} variant="jira" size="lg">
            <PlusCircle className="h-5 w-5 mr-2" />
            Add New Entry
          </Button>
        </motion.div>
      </motion.div>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {error ? 'Yes' : 'No'}</p>
            <p><strong>All Entries Count:</strong> {allEntries.length}</p>
            <p><strong>Filtered Entries Count:</strong> {filteredEntries.length}</p>
            <p><strong>Start Date:</strong> {filters.startDate}</p>
            <p><strong>End Date:</strong> {filters.endDate}</p>
            {error && (
              <div className="bg-red-50 p-3 rounded">
                <p className="text-red-800"><strong>Error Message:</strong> {String(error)}</p>
              </div>
            )}
            {allEntries.length > 0 && (
              <div className="bg-green-50 p-3 rounded">
                <p className="text-green-800"><strong>Sample Entry:</strong></p>
                <pre className="text-xs mt-2">{JSON.stringify(allEntries[0], null, 2)}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900">{filteredEntries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(filteredEntries.map(e => e.user_id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FolderOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(filteredEntries.map(e => e.project_id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date Range</p>
                <p className="text-sm font-semibold text-gray-900">
                  {filters.startDate} - {filters.endDate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <CardTitle>Filters</CardTitle>
            <Badge variant="jiraGray" className="ml-2">
              {Object.values(filters).filter(v => v !== '').length} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <FilterSection 
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onApplyFilters={handleApplyFilters}
          />
        </CardContent>
      </Card>

      {/* Entries Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Time Entries ({filteredEntries.length})
          </h2>
          <div className="flex items-center space-x-2">
            <Badge variant="jiraGray">
              {filteredEntries.filter(e => e.is_billable).length} billable
            </Badge>
            <Badge variant="jiraGray">
              {filteredEntries.filter(e => !e.is_billable).length} non-billable
            </Badge>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto max-w-md">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <Calendar className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No time entries</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new time entry.
                </p>
                <div className="mt-6">
                  <Button onClick={handleAddNew} variant="jira">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add New Entry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEntries.map((entry: TimeEntry) => (
              <TimeEntryCard 
                key={entry.id} 
                entry={entry}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
