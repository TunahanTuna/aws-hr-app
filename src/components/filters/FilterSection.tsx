import React from 'react';
import { 
  Calendar, 
  User as UserIcon, 
  Briefcase, 
  FileText, 
  LayoutDashboard, 
  X, 
  Search,
  Filter
} from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';
import { useUsers, useCustomers, useProjects, useDivisions } from '../../lib/graphql/hooks';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import type { FilterState, User, Customer, Project, Division } from '../../types';

interface FilterSectionProps {
  filters: FilterState;
  onFilterChange: (field: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  onApplyFilters 
}) => {
  const { t } = useLanguage();

  // GraphQL hooks
  const { data: usersData, loading: usersLoading, error: usersError } = useUsers();
  const { data: customersData, loading: customersLoading, error: customersError } = useCustomers();
  const { data: projectsData, loading: projectsLoading, error: projectsError } = useProjects();
  const { data: divisionsData, loading: divisionsLoading, error: divisionsError } = useDivisions();

  const users = usersData?.users || [];
  const customers = customersData?.customers || [];
  const projects = projectsData?.projects || [];
  const divisions = divisionsData?.divisions || [];

  const loading = usersLoading || customersLoading || projectsLoading || divisionsLoading;
  const error = usersError || customersError || projectsError || divisionsError;

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="space-y-4">
      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Start Date</span>
          </label>
          <Input 
            type="date" 
            value={filters.startDate}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>End Date</span>
          </label>
          <Input 
            type="date" 
            value={filters.endDate}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Assignee */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <UserIcon className="h-4 w-4 text-gray-500" />
            <span>Assignee</span>
          </label>
          <Select
            value={filters.assigneeId}
            onChange={(e) => onFilterChange('assigneeId', e.target.value)}
            className="w-full"
          >
            <option value="">{t('allAssignees')}</option>
            {users.map((user: User) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Customer */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <Briefcase className="h-4 w-4 text-gray-500" />
            <span>Customer</span>
          </label>
          <Select
            value={filters.customerId}
            onChange={(e) => onFilterChange('customerId', e.target.value)}
            className="w-full"
          >
            <option value="">{t('allCustomers')}</option>
            {customers.map((customer: Customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Project */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span>Project</span>
          </label>
          <Select
            value={filters.projectId}
            onChange={(e) => onFilterChange('projectId', e.target.value)}
            className="w-full"
          >
            <option value="">{t('allProjects')}</option>
            {projects.map((project: Project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Division */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <LayoutDashboard className="h-4 w-4 text-gray-500" />
            <span>Division</span>
          </label>
          <Select
            value={filters.divisionId}
            onChange={(e) => onFilterChange('divisionId', e.target.value)}
            className="w-full"
          >
            <option value="">{t('allDivisions')}</option>
            {divisions.map((division: Division) => (
              <option key={division.id} value={division.id}>
                {division.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>{activeFiltersCount} active filters</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={onClearFilters}
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>{t('clear')}</span>
          </Button>
          <Button 
            variant="jira" 
            onClick={onApplyFilters}
            className="flex items-center space-x-2"
          >
            <Search className="h-4 w-4" />
            <span>{t('applyFilters')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
