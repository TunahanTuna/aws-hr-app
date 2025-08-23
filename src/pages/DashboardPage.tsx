import React from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Users, 
  FolderOpen, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Target,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useLanguage } from '../i18n/useLanguage';
import { 
  GET_DASHBOARD_STATS, 
  GET_DASHBOARD_PROJECTS, 
  GET_TEAM_PERFORMANCE, 
  GET_RECENT_ACTIVITIES,
  GET_WEEKLY_COMPARISON
} from '../lib/graphql/queries';

export const DashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  // Get current date and calculate week boundaries
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  
  // Calculate this week (Monday to Sunday)
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - currentDay + 1); // Go to Monday
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6); // Go to Sunday
  
  // Calculate last week
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 6);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // GraphQL queries
  const { data: statsData, loading: statsLoading, error: statsError } = useQuery(GET_DASHBOARD_STATS);
  const { data: projectsData, loading: projectsLoading, error: projectsError } = useQuery(GET_DASHBOARD_PROJECTS);
  const { data: teamData, loading: teamLoading, error: teamError } = useQuery(GET_TEAM_PERFORMANCE);
  const { data: activitiesData, loading: activitiesLoading, error: activitiesError } = useQuery(GET_RECENT_ACTIVITIES);
  const { data: weeklyData, loading: weeklyLoading, error: weeklyError } = useQuery(GET_WEEKLY_COMPARISON, {
    variables: {
      thisWeekStart: formatDate(thisWeekStart),
      thisWeekEnd: formatDate(thisWeekEnd),
      lastWeekStart: formatDate(lastWeekStart),
      lastWeekEnd: formatDate(lastWeekEnd)
    }
  });

  // Loading state
  if (statsLoading || projectsLoading || teamLoading || activitiesLoading || weeklyLoading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (statsError || projectsError || teamError || activitiesError || weeklyError) {
    return <ErrorMessage message="Dashboard verilerini yüklerken bir hata oluştu." />;
  }

  // Calculate statistics
  const totalHours = statsData?.user_performance_aggregate?.aggregate?.sum?.total_hours || 0;
  const billableHours = statsData?.user_performance_aggregate?.aggregate?.sum?.billable_hours || 0;
  const activeUsers = statsData?.users_aggregate?.aggregate?.count || 0;
  const activeProjects = statsData?.projects_aggregate?.aggregate?.count || 0;
  const thisWeekHours = weeklyData?.thisWeek?.aggregate?.sum?.effort || 0;
  const lastWeekHours = weeklyData?.lastWeek?.aggregate?.sum?.effort || 0;
  
  const completionRate = projectsData?.project_dashboard?.length > 0 
    ? Math.round(projectsData.project_dashboard.reduce((acc: number, project: any) => acc + project.progress, 0) / projectsData.project_dashboard.length)
    : 0;
  
  const weeklyGrowth = lastWeekHours > 0 
    ? Math.round(((thisWeekHours - lastWeekHours) / lastWeekHours) * 100)
    : 0;
  
  const avgEfficiency = teamData?.user_performance?.length > 0
    ? Math.round(teamData.user_performance.reduce((acc: number, member: any) => acc + (member.efficiency_score || 0), 0) / teamData.user_performance.length)
    : 0;

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} saat önce`;
    return `${Math.floor(diffInMinutes / 1440)} gün önce`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center space-x-4"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="p-3 bg-blue-100 rounded-lg"
        >
          <Activity className="h-8 w-8 text-blue-600" />
        </motion.div>
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl font-bold text-gray-900"
          >
            {t('dashboardTitle')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-600 mt-1"
          >
            {t('projectOverview')}
          </motion.p>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.6
            }
          }
        }}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={{
            hidden: { y: 50, opacity: 0 },
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
                  <Clock className="h-6 w-6 text-blue-600" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('totalHours')}</p>
                  <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
                  <p className="text-xs text-green-600">+{weeklyGrowth}% {t('thisWeek')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={{
            hidden: { y: 50, opacity: 0 },
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
                  <DollarSign className="h-6 w-6 text-green-600" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('billableHours')}</p>
                  <p className="text-2xl font-bold text-gray-900">{billableHours.toFixed(1)}h</p>
                  <p className="text-xs text-blue-600">{totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0}% {t('ofTotal')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={{
            hidden: { y: 50, opacity: 0 },
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
                  <Users className="h-6 w-6 text-purple-600" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('activeUsers')}</p>
                  <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
                  <p className="text-xs text-purple-600">{t('allTeamMembersActive')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={{
            hidden: { y: 50, opacity: 0 },
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
                  <Target className="h-6 w-6 text-orange-600" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('completionRate')}</p>
                  <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
                  <p className="text-xs text-orange-600">{t('projectAverage')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Weekly Comparison */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
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
            hidden: { x: -50, opacity: 0 },
            visible: { x: 0, opacity: 1 }
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ duration: 0.2 }}
                >
                  <TrendingUp className="h-5 w-5 text-gray-500" />
                </motion.div>
                <CardTitle>{t('weeklyProgress')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                <motion.div 
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                  whileHover={{ scale: 1.02, backgroundColor: "#dbeafe" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </motion.div>
                    <span className="font-medium text-gray-900">{t('thisWeekStats')}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{thisWeekHours.toFixed(1)}h</p>
                    <p className="text-sm text-gray-600">Target: 40h</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  whileHover={{ scale: 1.02, backgroundColor: "#f3f4f6" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Calendar className="h-5 w-5 text-gray-600" />
                    </motion.div>
                    <span className="font-medium text-gray-900">{t('lastWeekStats')}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-600">{lastWeekHours.toFixed(1)}h</p>
                    <p className="text-sm text-gray-600">Target: 40h</p>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={{
            hidden: { x: 50, opacity: 0 },
            visible: { x: 0, opacity: 1 }
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ duration: 0.2 }}
                >
                  <Users className="h-5 w-5 text-gray-500" />
                </motion.div>
                <CardTitle>{t('teamOverview')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-3">
                <motion.div 
                  className="flex items-center justify-between"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-sm text-gray-600">Total Team Members</span>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge variant="jira">{activeUsers}</Badge>
                  </motion.div>
                </motion.div>
                <motion.div 
                  className="flex items-center justify-between"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-sm text-gray-600">Active Projects</span>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge variant="jiraSuccess">{activeProjects}</Badge>
                  </motion.div>
                </motion.div>
                <motion.div 
                  className="flex items-center justify-between"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-sm text-gray-600">Avg. Efficiency</span>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge variant="jiraWarning">{avgEfficiency}%</Badge>
                  </motion.div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Top Projects */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        whileHover={{ scale: 1.01 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ duration: 0.2 }}
                >
                  <FolderOpen className="h-5 w-5 text-gray-500" />
                </motion.div>
                <CardTitle>{t('topProjects')}</CardTitle>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/projects')}
                >
                  {t('viewAll')}
                </Button>
              </motion.div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectsData?.project_dashboard?.length > 0 ? (
              projectsData.project_dashboard.map((project: any) => (
                <div key={project.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <Badge variant={project.status === 'Active' ? 'jiraSuccess' : 'jiraGray'}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>Team: {project.team_size} members</span>
                      <span>Tasks: {project.completed_tasks}/{project.total_tasks}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No active projects found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Recent Activities & Team Performance */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.2
            }
          }
        }}
      >
        <motion.div
          variants={{
            hidden: { x: -50, opacity: 0 },
            visible: { x: 0, opacity: 1 }
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ duration: 0.2 }}
                >
                  <Activity className="h-5 w-5 text-gray-500" />
                </motion.div>
                <CardTitle>{t('recentActivities')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activitiesData?.time_entries?.length > 0 ? (
                  activitiesData.time_entries.map((activity: any, index: number) => (
                    <motion.div 
                      key={activity.id} 
                      className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5, backgroundColor: "#f9fafb" }}
                    >
                      <motion.div 
                        className="w-2 h-2 bg-blue-500 rounded-full mt-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user.name}</span> worked {activity.effort}h on{' '}
                          <span className="font-medium">{activity.project.name}</span>
                          {activity.task_type && (
                            <span className="text-gray-500"> - {activity.task_type.name}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{getTimeAgo(activity.created_at)}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No recent activities</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={{
            hidden: { x: 50, opacity: 0 },
            visible: { x: 0, opacity: 1 }
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ duration: 0.2 }}
                >
                  <Users className="h-5 w-5 text-gray-500" />
                </motion.div>
                <CardTitle>{t('teamPerformance')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamData?.user_performance?.length > 0 ? (
                  teamData.user_performance.map((member: any, index: number) => (
                    <motion.div 
                      key={member.user_id} 
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
                    >
                      <div className="flex items-center space-x-3">
                        <motion.div 
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-sm font-medium text-gray-600">
                            {member.user.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </motion.div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                          <p className="text-xs text-gray-500">{member.user.role} - {member.user.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{member.total_hours.toFixed(1)}h</p>
                        <p className="text-xs text-gray-500">{member.efficiency_score || 0}% efficiency</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No team performance data</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};
