import React from 'react';
import { 
  Calendar, 
  Briefcase, 
  FileText, 
  Tag, 
  LayoutDashboard,
  Clock,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';
import type { TimeEntry } from '../../types';
import { useLanguage } from '../../i18n/useLanguage';
import { formatDate } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

interface TimeEntryCardProps {
  entry: TimeEntry;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (entry: TimeEntry) => void;
}

export const TimeEntryCard: React.FC<TimeEntryCardProps> = ({ 
  entry, 
  onEdit, 
  onDelete, 
  onDuplicate 
}) => {
  const { t } = useLanguage();
  
  // Use GraphQL relationships if available, otherwise use IDs
  const userName = entry.user?.name || `User ID: ${entry.user_id?.substring(0, 8)}...`;
  const projectName = entry.project?.name || `Project ID: ${entry.project_id?.substring(0, 8)}...`;
  const customerName = entry.project?.customer?.name || 'Unknown Customer';
  const taskTypeName = entry.task_type?.name || `Task Type ID: ${entry.task_type_id?.substring(0, 8)}...`;
  const divisionName = entry.division?.name || `Division ID: ${entry.division_id?.substring(0, 8)}...`;

  const handleEdit = (): void => {
    onEdit?.(entry.id);
  };

  const handleDelete = (): void => {
    onDelete?.(entry.id);
  };

  const handleDuplicate = (): void => {
    onDuplicate?.(entry);
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{formatDate(entry.date)}</p>
              <p className="text-sm text-gray-500">{userName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={entry.is_billable ? "jiraSuccess" : "jiraGray"}>
              {entry.is_billable ? t('billable') : t('nonBillable')}
            </Badge>
            <div className="flex items-center space-x-1 text-lg font-bold text-blue-600">
              <Clock className="h-4 w-4" />
              <span>{entry.effort.toFixed(2)}h</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {entry.description && (
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed">{entry.description}</p>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="jira" className="flex items-center space-x-1">
            <Briefcase className="h-3 w-3" />
            <span>{customerName}</span>
          </Badge>
          <Badge variant="jiraSecondary" className="flex items-center space-x-1">
            <FileText className="h-3 w-3" />
            <span>{projectName}</span>
          </Badge>
          <Badge variant="jiraWarning" className="flex items-center space-x-1">
            <Tag className="h-3 w-3" />
            <span>{taskTypeName}</span>
          </Badge>
          <Badge variant="jiraError" className="flex items-center space-x-1">
            <LayoutDashboard className="h-3 w-3" />
            <span>{divisionName}</span>
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            ID: {entry.id.slice(0, 8)}...
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 px-3 text-gray-600 hover:text-gray-900"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
            {onDuplicate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDuplicate}
                className="h-8 px-3 text-gray-600 hover:text-gray-900"
              >
                <Copy className="h-3 w-3 mr-1" />
                Duplicate
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
