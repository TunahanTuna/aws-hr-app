import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { 
  ArrowLeft,
  Users,
  Target,
  Clock,
  DollarSign,
  CheckCircle,
  TrendingUp,
  FileText,
  Edit,
  UserPlus,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Portal } from '../components/ui/Portal';
import { useLanguage } from '../i18n/useLanguage';
import { useToast } from '../store/ToastContext';
import { GET_PROJECT_BY_ID } from '../lib/graphql/queries';
import { useUpdateProject, useAddProjectMember, useRemoveProjectMember, useCustomers, useUsers } from '../lib/graphql/hooks';
import { ManageProjectTasks } from '../components/admin/ManageProjectTasks';
import { ManageProjectMilestones } from '../components/admin/ManageProjectMilestones';
import type { Customer, User } from '../types';

interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string;
  assigned_user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ProjectMilestone {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

interface TimeEntry {
  id: string;
  date: string;
  effort: number;
  description: string;
  is_billable: boolean;
  task_id?: string;
  user: {
    id: string;
    name: string;
  };
  project_task?: {
    id: string;
    title: string;
    status: string;
  };
  task_type: {
    id: string;
    name: string;
  };
  division: {
    id: string;
    name: string;
  };
}

interface ProjectMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    avatar?: string;
  };
  role: string;
  start_date?: string;
  end_date?: string;
}

interface ProjectDetail {
  id: string;
  name: string;
  description?: string;
  customer_id: string;
  pm_id: string;
  is_billable: boolean;
  priority?: string;
  progress?: number;
  budget?: number;
  spent?: number;
  technologies?: string[];
  status: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    name: string;
    status: string;
  };
  project_manager?: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  };
  project_members?: ProjectMember[];
  project_tasks?: ProjectTask[];
  project_milestones?: ProjectMilestone[];
  time_entries?: TimeEntry[];
}

interface ProjectEditFormData {
  name: string;
  description: string;
  customer_id: string;
  pm_id: string;
  is_billable: boolean;
  priority: string;
  status: string;
  budget: number;
  start_date: string;
  end_date: string;
}

export const ProjectDetailPage: React.FC = () => {
  const { t } = useLanguage();
  const { showError } = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State for modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editFormData, setEditFormData] = useState<ProjectEditFormData>({
    name: '',
    description: '',
    customer_id: '',
    pm_id: '',
    is_billable: true,
    priority: '',
    status: '',
    budget: 0,
    start_date: '',
    end_date: ''
  });
  const [selectedUserId, setSelectedUserId] = useState('');

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_PROJECT_BY_ID, {
    variables: { id },
    skip: !id
  });

  const { data: customersData } = useCustomers();
  const { data: usersData } = useUsers();
  const [updateProject] = useUpdateProject();
  const [addProjectMember] = useAddProjectMember();
  const [removeProjectMember] = useRemoveProjectMember();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!data?.projects_by_pk) return <ErrorMessage message="Project not found" />;

  const project: ProjectDetail = data.projects_by_pk;

  // Handler functions
  const handleEditProject = () => {
    setEditFormData({
      name: project.name || '',
      description: project.description || '',
      customer_id: project.customer_id || '',
      pm_id: project.pm_id || '',
      is_billable: project.is_billable || false,
      priority: project.priority || '',
      status: project.status || '',
      budget: project.budget || 0,
      start_date: project.start_date || '',
      end_date: project.end_date || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProject({
        variables: {
          id: project.id,
          input: {
            name: editFormData.name,
            description: editFormData.description,
            customer_id: editFormData.customer_id,
            pm_id: editFormData.pm_id,
            is_billable: editFormData.is_billable,
            priority: editFormData.priority,
            status: editFormData.status,
            budget: editFormData.budget,
            start_date: editFormData.start_date || null,
            end_date: editFormData.end_date || null
          }
        }
      });
      setShowEditModal(false);
      refetch();
    } catch (error) {
      console.error('Error updating project:', error);
      showError(t('errorSavingProject'));
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    try {
      await addProjectMember({
        variables: {
          projectId: project.id,
          userId: selectedUserId
        }
      });
      setShowMemberModal(false);
      setSelectedUserId('');
      refetch();
    } catch (error) {
      console.error('Error adding project member:', error);
      showError(t('errorAddingMember'));
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (window.confirm(t('confirmRemoveMember'))) {
      try {
        await removeProjectMember({
          variables: { id: memberId }
        });
        refetch();
      } catch (error) {
        console.error('Error removing project member:', error);
        showError(t('errorRemovingMember'));
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'active': return 'jiraSuccess';
      case 'planning': return 'jiraWarning';
      case 'on_hold': return 'jiraGray';
      case 'completed': return 'jiraSuccess';
      case 'cancelled': return 'jiraError';
      case 'Inactive': return 'jiraGray';
      default: return 'jiraGray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'jiraError';
      case 'medium': return 'jiraWarning';
      case 'low': return 'jiraSuccess';
      default: return 'jiraGray';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'jiraSuccess';
      case 'in_progress': return 'jiraWarning';
      case 'pending': return 'jiraSecondary';
      case 'cancelled': return 'jiraError';
      default: return 'jiraGray';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate project statistics
  const totalTasks = project.project_tasks?.length || 0;
  const completedTasks = project.project_tasks?.filter(t => t.status === 'completed').length || 0;
  const totalMilestones = project.project_milestones?.length || 0;
  const completedMilestones = project.project_milestones?.filter(m => m.status === 'completed').length || 0;
  const totalHours = project.time_entries?.reduce((acc, entry) => acc + entry.effort, 0) || 0;
  const remainingBudget = (project.budget || 0) - (project.spent || 0);
  const budgetUsage = project.budget ? (project.spent || 0) / project.budget * 100 : 0;

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="outline"
              onClick={() => navigate('/projects')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">{project.description || 'No description available'}</p>
          </motion.div>
        </div>
        <motion.div 
          className="flex flex-wrap items-center gap-2 w-full sm:w-auto"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <Badge variant={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </motion.div>
          {project.priority && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Badge variant={getPriorityColor(project.priority)}>
                {project.priority} priority
              </Badge>
            </motion.div>
          )}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <Button variant="jira" onClick={handleEditProject} className="w-full sm:w-auto">
              <Edit className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Edit Project</span>
              <span className="sm:hidden">Edit</span>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">{project.progress || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{completedTasks}/{totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Hours</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(totalHours)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Used</p>
                <p className="text-2xl font-bold text-gray-900">{budgetUsage.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Details & Team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Project Information */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Project Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pt-0 pb-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer</label>
                  <p className="text-gray-900">{project.customer?.name || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Project Manager</label>
                  <p className="text-gray-900">{project.project_manager?.name || 'Not assigned'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Start Date</label>
                  <p className="text-gray-900">{project.start_date ? formatDate(project.start_date) : 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">End Date</label>
                  <p className="text-gray-900">{project.end_date ? formatDate(project.end_date) : 'Not set'}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-600">Budget Information</label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Budget</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(project.budget || 0)}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Spent</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(project.spent || 0)}</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="text-lg font-bold text-orange-600">{formatCurrency(remainingBudget)}</p>
                  </div>
                </div>
              </div>

              {project.technologies && project.technologies.length > 0 && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-gray-600">Technologies</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.technologies.map((tech, index) => (
                      <Badge key={index} variant="jiraSecondary">{tech}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Team Members */}
        <div>
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Team Members</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMemberModal(true)}
                  className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add Member
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-0 pb-4">
              <div className="h-full">
                {project.project_members && project.project_members.length > 0 ? (
                  <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1" style={{ maxHeight: '320px' }}>
                    {project.project_members.map((member, index) => (
                      <motion.div 
                        key={member.id} 
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, y: -1 }}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                              <span className="text-white font-semibold text-sm">
                                {member.user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{member.user.name}</p>
                            <p className="text-sm text-blue-600 font-medium">{member.role}</p>
                            {member.user.department && (
                              <p className="text-xs text-gray-500 truncate">{member.user.department}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-1">No team members assigned</p>
                    <p className="text-gray-400 text-sm">Click "Add Member" to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tasks and Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Tasks ({completedTasks}/{totalTasks})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.project_tasks && project.project_tasks.length > 0 ? (
                project.project_tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getTaskStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        {task.priority && (
                          <Badge variant={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {task.assigned_user && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{task.assigned_user.name}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No tasks found</p>
              )}
              {project.project_tasks && project.project_tasks.length > 5 && (
                <Button variant="outline" className="w-full">
                  View All Tasks ({project.project_tasks.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Milestones ({completedMilestones}/{totalMilestones})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.project_milestones && project.project_milestones.length > 0 ? (
                project.project_milestones.map(milestone => (
                  <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{milestone.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getTaskStatusColor(milestone.status)}>
                          {milestone.status}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Due: {formatDate(milestone.due_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No milestones found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Time Entries</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">User</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Task</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Description</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Hours</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Billable</th>
                </tr>
              </thead>
              <tbody>
                {project.time_entries && project.time_entries.length > 0 ? (
                  project.time_entries.slice(0, 10).map(entry => (
                    <tr key={entry.id} className="border-b border-gray-100">
                      <td className="py-2 text-sm text-gray-900">{formatDate(entry.date)}</td>
                      <td className="py-2 text-sm text-gray-900">{entry.user.name}</td>
                      <td className="py-2 text-sm text-gray-900">
                        {entry.project_task ? (
                          <div className="flex items-center space-x-2">
                            <span className="truncate">{entry.project_task.title}</span>
                            <Badge variant={getTaskStatusColor(entry.project_task.status)} className="text-xs">
                              {entry.project_task.status}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No task assigned</span>
                        )}
                      </td>
                      <td className="py-2 text-sm text-gray-900">{entry.description}</td>
                      <td className="py-2 text-sm text-gray-900">{entry.effort}h</td>
                      <td className="py-2">
                        <Badge variant={entry.is_billable ? 'jiraSuccess' : 'jiraGray'}>
                          {entry.is_billable ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No time entries found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Project Tasks Management */}
      <Card>
        <CardContent className="p-6">
          <ManageProjectTasks 
            projectId={id!} 
            projectName={project.name} 
          />
        </CardContent>
      </Card>

      {/* Project Milestones Management */}
      <Card>
        <CardContent className="p-6">
          <ManageProjectMilestones 
            projectId={id!} 
            projectName={project.name} 
          />
        </CardContent>
      </Card>

      {/* Edit Project Modal */}
      {showEditModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-8 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
            >
              <h3 className="text-lg font-semibold mb-4">
                {t('editProject')}
              </h3>
              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('name')}
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('status')}
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">{t('active')}</option>
                      <option value="planning">{t('planning')}</option>
                      <option value="on_hold">{t('onHold')}</option>
                      <option value="completed">{t('completed')}</option>
                      <option value="cancelled">{t('cancelled')}</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('description')}
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('customer')}
                    </label>
                    <select
                      value={editFormData.customer_id}
                      onChange={(e) => setEditFormData({...editFormData, customer_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">{t('selectCustomer')}</option>
                      {(customersData?.customers || []).map((customer: Customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('projectManager')}
                    </label>
                    <select
                      value={editFormData.pm_id}
                      onChange={(e) => setEditFormData({...editFormData, pm_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">{t('selectProjectManager')}</option>
                      {(usersData?.users || []).filter((user: User) => user.role === 'Manager' || user.role === 'Admin').map((user: User) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('priority')}
                    </label>
                    <select
                      value={editFormData.priority}
                      onChange={(e) => setEditFormData({...editFormData, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t('selectPriority')}</option>
                      <option value="low">{t('low')}</option>
                      <option value="medium">{t('medium')}</option>
                      <option value="high">{t('high')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('budget')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editFormData.budget}
                      onChange={(e) => setEditFormData({...editFormData, budget: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center mt-6">
                      <input
                        type="checkbox"
                        checked={editFormData.is_billable}
                        onChange={(e) => setEditFormData({...editFormData, is_billable: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">{t('billable')}</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('startDate')}
                    </label>
                    <input
                      type="date"
                      value={editFormData.start_date}
                      onChange={(e) => setEditFormData({...editFormData, start_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('endDate')}
                    </label>
                    <input
                      type="date"
                      value={editFormData.end_date}
                      onChange={(e) => setEditFormData({...editFormData, end_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {t('update')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </Portal>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-8 rounded-lg w-full max-w-md shadow-xl"
            >
              <h3 className="text-lg font-semibold mb-4">
                {t('addTeamMember')}
              </h3>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('selectUser')}
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">{t('selectUser')}</option>
                    {(usersData?.users || [])
                      .filter((user: User) => 
                        !project.project_members?.some(member => member.user.id === user.id)
                      )
                      .map((user: User) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowMemberModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {t('addMember')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </Portal>
      )}
    </motion.div>
  );
};
