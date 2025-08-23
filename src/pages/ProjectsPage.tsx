import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { 
  FolderOpen, 
  Plus, 
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Pause,
  Edit,
  Trash2,
  Eye,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Portal } from '../components/ui/Portal';
import { GET_PROJECTS_DASHBOARD } from '../lib/graphql/queries';
import { DELETE_PROJECT } from '../lib/graphql/mutations';
import { useLanguage } from '../i18n/useLanguage';
import { useToast } from '../store/ToastContext';
import { useCreateProject, useCustomers, useUsers } from '../lib/graphql/hooks';
import type { ProjectDashboard, Customer, User } from '../types';

interface ProjectStats {
  total: number;
  active: number;
  planning: number;
  onHold: number;
  totalBudget: number;
  totalSpent: number;
  totalHours: number;
  averageProgress: number;
  healthDistribution: Record<string, number>;
}

interface ProjectFormData {
  name: string;
  customer_id: string;
  pm_id: string;
  is_billable: boolean;
}

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showError } = useToast();
  const [selectedProject, setSelectedProject] = useState<ProjectDashboard | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    customer_id: '',
    pm_id: '',
    is_billable: true
  });
  
  // GraphQL Queries - Dashboard query kullanıyoruz
  const { 
    data: projectsData, 
    loading: projectsLoading, 
    error: projectsError,
    refetch: refetchProjects 
  } = useQuery(GET_PROJECTS_DASHBOARD);

  // Additional data needed for project creation
  const { data: customersData } = useCustomers();
  const { data: usersData } = useUsers();

  // GraphQL Mutations
  const [deleteProject] = useMutation(DELETE_PROJECT, {
    onCompleted: () => {
      refetchProjects();
    }
  });

  const [createProject] = useCreateProject();

  // Hata detaylarını logla
  useEffect(() => {
    if (projectsError) {
      console.error('Projects Error Details:', projectsError);
      console.error('Error Message:', projectsError.message);
      console.error('Error GraphQLErrors:', projectsError.graphQLErrors);
      console.error('Error NetworkError:', projectsError.networkError);
    }
  }, [projectsError]);

  // Process projects data from dashboard
  const projects: ProjectDashboard[] = projectsData?.project_dashboard || [];
  
  // Calculate project statistics
  const projectStats: ProjectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'Active' || p.status === 'active').length,
    planning: projects.filter(p => p.status === 'planning').length,
    onHold: projects.filter(p => p.status === 'on_hold').length,
    totalBudget: projects.reduce((acc, p) => acc + (p.budget || 0), 0),
    totalSpent: projects.reduce((acc, p) => acc + (p.spent || 0), 0),
    totalHours: projects.reduce((acc, p) => acc + (p.total_hours || 0), 0),
    averageProgress: projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length) : 0,
    healthDistribution: projects.reduce((acc, p) => {
      acc[p.health_status] = (acc[p.health_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'planning': return <Target className="h-4 w-4 text-yellow-600" />;
      case 'on_hold': return <Pause className="h-4 w-4 text-gray-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'Inactive': return <Pause className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
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

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject({ variables: { id: projectId } });
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleViewProject = (project: ProjectDashboard) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleNewProject = () => {
    setFormData({ name: '', customer_id: '', pm_id: '', is_billable: true });
    setShowCreateModal(true);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject({
        variables: {
          input: formData
        }
      });
      setShowCreateModal(false);
      setFormData({ name: '', customer_id: '', pm_id: '', is_billable: true });
      refetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      showError(t('errorSavingProject'));
    }
  };

  const getHealthStatusColor = (health: string) => {
    switch (health) {
      case 'on_track': return 'jiraSuccess';
      case 'normal': return 'jiraSecondary';
      case 'at_risk': return 'jiraWarning';
      case 'critical': return 'jiraError';
      case 'on_hold': return 'jiraGray';
      case 'completed': return 'jiraSuccess';
      default: return 'jiraGray';
    }
  };

  const getHealthStatusIcon = (health: string) => {
    switch (health) {
      case 'on_track': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'normal': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'at_risk': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'on_hold': return <Pause className="h-4 w-4 text-gray-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };



  if (projectsLoading) {
    return <LoadingSpinner />;
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
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center space-x-4">
          <motion.div 
            className="p-3 bg-orange-100 rounded-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <FolderOpen className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
          </motion.div>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('projectsTitle')}</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">{t('manageTrackProjectProgress')}</p>
          </motion.div>
        </div>
        <motion.div 
          className="flex items-center space-x-2 w-full sm:w-auto"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <Button variant="jira" size="lg" onClick={handleNewProject} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {t('newProject')}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Project Stats */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        <motion.div
          variants={{
            hidden: { y: 30, opacity: 0 },
            visible: { y: 0, opacity: 1 }
          }}
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="p-2 bg-blue-100 rounded-lg"
                  whileHover={{ rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <FolderOpen className="h-6 w-6 text-blue-600" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('totalProjects')}</p>
                  <p className="text-2xl font-bold text-gray-900">{projectStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={{
            hidden: { y: 30, opacity: 0 },
            visible: { y: 0, opacity: 1 }
          }}
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="p-2 bg-green-100 rounded-lg"
                  whileHover={{ rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('activeProjects')}</p>
                  <p className="text-2xl font-bold text-gray-900">{projectStats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={{
            hidden: { y: 30, opacity: 0 },
            visible: { y: 0, opacity: 1 }
          }}
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="p-2 bg-purple-100 rounded-lg"
                  whileHover={{ rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('avgProgress')}</p>
                  <p className="text-2xl font-bold text-gray-900">{projectStats.averageProgress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={{
            hidden: { y: 30, opacity: 0 },
            visible: { y: 0, opacity: 1 }
          }}
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="p-2 bg-orange-100 rounded-lg"
                  whileHover={{ rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Clock className="h-6 w-6 text-orange-600" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('totalHours')}</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(projectStats.totalHours)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-gray-500" />
            <CardTitle>{t('budgetOverview')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">{t('totalBudget')}</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(projectStats.totalBudget)}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">{t('totalSpent')}</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(projectStats.totalSpent)}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">{t('remaining')}</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(projectStats.totalBudget - projectStats.totalSpent)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Status Distribution */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-gray-500" />
            <CardTitle>{t('projectHealthOverview')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {Object.entries(projectStats.healthDistribution).map(([status, count]) => (
              <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {getHealthStatusIcon(status)}
                </div>
                <p className="text-sm font-medium text-gray-600 capitalize">{status.replace('_', ' ')}</p>
                <p className="text-xl font-bold text-gray-900">{count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5 text-gray-500" />
              <CardTitle>{t('allProjects')}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">{t('filter')}</Button>
              <Button variant="outline" size="sm">{t('sort')}</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('noProjectsFound')}</p>
              {projectsError && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <p className="text-red-800 font-medium">{t('errorLoadingProjects')}</p>
                  <p className="text-red-700 text-sm">{projectsError.message}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {projects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(project.status)}
                          <Badge variant={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{project.description || t('noDescriptionAvailable')}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {project.priority && (
                          <Badge variant={getPriorityColor(project.priority)}>
                            {project.priority} {t('priority')}
                          </Badge>
                        )}
                        <Badge variant="jiraSecondary">
                          {t('projectIdLabel')}: {project.id.substring(0, 8)}...
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t('projectManager')}:</span>
                      <span className="font-medium">
                        {project.manager_name || t('notAssigned')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t('projectCustomer')}:</span>
                      <span className="font-medium">
                        {project.customer_name || t('notSpecified')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t('healthStatus')}:</span>
                      <div className="flex items-center space-x-1">
                        {getHealthStatusIcon(project.health_status)}
                        <Badge variant={getHealthStatusColor(project.health_status)}>
                          {project.health_status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t('teamSize')}:</span>
                      <span className="font-medium">{project.team_size} members</span>
                    </div>
                  </div>

                  {project.progress !== undefined && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {project.budget !== undefined && project.spent !== undefined && (
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">Budget</p>
                        <p className="font-medium text-gray-900">{formatCurrency(project.budget)}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">Spent</p>
                        <p className="font-medium text-gray-900">{formatCurrency(project.spent)}</p>
                      </div>
                    </div>
                  )}

                  {/* Project Statistics */}
                  <div className="mb-4 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div className="flex items-center justify-between py-1">
                        <span className="text-gray-600">Tasks:</span>
                        <span className="font-medium">{project.completed_tasks}/{project.total_tasks}</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-gray-600">Milestones:</span>
                        <span className="font-medium">{project.completed_milestones}/{project.total_milestones}</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-gray-600">Hours:</span>
                        <span className="font-medium">{Math.round(project.total_hours)}h</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-gray-600">Team:</span>
                        <span className="font-medium">{project.team_size} members</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="w-full sm:w-auto flex items-center justify-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="text-xs">View Details</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProject(project)}
                        className="w-full sm:w-auto flex items-center justify-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="text-xs">Quick View</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full sm:w-auto flex items-center justify-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        <span className="text-xs">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                        className="w-full sm:w-auto flex items-center justify-center text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span className="text-xs">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Detail Modal */}
      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
              <Button
                variant="outline"
                onClick={() => setShowProjectModal(false)}
              >
                Close
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Project Details</h3>
                <div className="space-y-2">
                  <p><strong>ID:</strong> {selectedProject.id}</p>
                  <p><strong>Description:</strong> {selectedProject.description || 'No description'}</p>
                  <p><strong>Customer:</strong> {selectedProject.customer_name || 'Not specified'}</p>
                  <p><strong>Manager:</strong> {selectedProject.manager_name || 'Not assigned'}</p>
                  <p><strong>Status:</strong> {selectedProject.status}</p>
                  <p><strong>Priority:</strong> {selectedProject.priority || 'Not set'}</p>
                  <p><strong>Progress:</strong> {selectedProject.progress || 0}%</p>
                  <p><strong>Health Status:</strong> {selectedProject.health_status.replace('_', ' ')}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Financial & Team</h3>
                <div className="space-y-2">
                  <p><strong>Budget:</strong> {formatCurrency(selectedProject.budget || 0)}</p>
                  <p><strong>Spent:</strong> {formatCurrency(selectedProject.spent || 0)}</p>
                  <p><strong>Remaining:</strong> {formatCurrency(selectedProject.remaining_budget || 0)}</p>
                  <p><strong>Budget Usage:</strong> {selectedProject.budget_usage_percentage?.toFixed(1)}%</p>
                  <p><strong>Team Size:</strong> {selectedProject.team_size} members</p>
                  <p><strong>Total Hours:</strong> {Math.round(selectedProject.total_hours)}h</p>
                  <p><strong>Billable Hours:</strong> {Math.round(selectedProject.billable_hours)}h</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Project Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tasks</p>
                  <p className="text-lg font-bold text-blue-600">{selectedProject.completed_tasks}/{selectedProject.total_tasks}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Milestones</p>
                  <p className="text-lg font-bold text-green-600">{selectedProject.completed_milestones}/{selectedProject.total_milestones}</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Overdue Tasks</p>
                  <p className="text-lg font-bold text-yellow-600">{selectedProject.overdue_tasks}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Efficiency</p>
                  <p className="text-lg font-bold text-purple-600">
                    {selectedProject.total_hours > 0 ? Math.round((selectedProject.billable_hours / selectedProject.total_hours) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Creation Modal */}
      {showCreateModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[9999]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-4 sm:p-6 md:p-8 rounded-lg w-full max-w-md sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
            >
              <h3 className="text-lg md:text-xl font-semibold mb-4">
                {t('addNewProject')}
              </h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('name')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('customer')}
                    </label>
                    <select
                      value={formData.customer_id}
                      onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
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
                      value={formData.pm_id}
                      onChange={(e) => setFormData({...formData, pm_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
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
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_billable}
                      onChange={(e) => setFormData({...formData, is_billable: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">{t('billable')}</span>
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm md:text-base"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm md:text-base"
                  >
                    {t('create')}
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
