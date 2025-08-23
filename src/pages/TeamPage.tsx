import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Clock,
  Target,
  Award,
  TrendingUp,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useLanguage } from '../i18n/useLanguage';
import { useToast } from '../store/ToastContext';
import { 
  useTeamMembers, 
  useTeamStats, 
  useDepartmentsOverview,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember
} from '../lib/graphql/hooks';

export const TeamPage: React.FC = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Member',
    department: 'Engineering', // Valid enum value
    phone: '',
    skills: '',
    status: 'Active',
    level: 'Mid'
  });
  
  // GraphQL queries and mutations
  const { data: teamData, loading: teamLoading, error: teamError } = useTeamMembers();
  const { data: statsData, loading: statsLoading, error: statsError } = useTeamStats();
  const { data: deptData, loading: deptLoading, error: deptError } = useDepartmentsOverview();
  
  // Mutations
  const [createTeamMember, { loading: creatingMember }] = useCreateTeamMember();
  const [updateTeamMember, { loading: updatingMember }] = useUpdateTeamMember();
  const [deleteTeamMember, { loading: deletingMember }] = useDeleteTeamMember();

  // Debug information
  console.log('Team Data:', teamData);
  console.log('Stats Data:', statsData);
  console.log('Dept Data:', deptData);
  console.log('Team Loading:', teamLoading);
  console.log('Team Error:', teamError);

  // Process team data
  const teamMembers = useMemo(() => {
    if (!teamData?.users) return [];
    return teamData.users.map((user: any) => {
      // Find performance data for this user from statsData
      const userPerformance = statsData?.user_performance?.find((perf: any) => perf.user_id === user.id);
      
      return {
        ...user,
        currentProjects: userPerformance?.project_count || 0,
        totalHours: userPerformance?.total_hours || 0,
        efficiency: userPerformance?.efficiency_score || 0
      };
    });
  }, [teamData, statsData]);

  // Process team stats
  const teamStats = useMemo(() => {
    if (!statsData) return {
      totalMembers: 0,
      activeMembers: 0,
      averageEfficiency: 0,
      totalHours: 0,
      averageExperience: 0
    };

    const totalMembers = statsData.users_aggregate?.aggregate?.count || 0;
    const activeMembers = statsData.users?.length || 0;
    
    const totalHours = statsData.user_performance?.reduce((acc: number, perf: any) => 
      acc + (perf.total_hours || 0), 0) || 0;
    
    // Calculate real average efficiency from user_performance data (only users with efficiency > 0)
    const validPerformanceData = statsData.user_performance?.filter((perf: any) => perf.efficiency_score > 0) || [];
    const avgEfficiency = validPerformanceData.length > 0 
      ? validPerformanceData.reduce((acc: number, perf: any) => acc + perf.efficiency_score, 0) / validPerformanceData.length 
      : 0;

    const avgExperience = teamMembers.reduce((acc: number, member: any) => {
      if (!member.join_date) return acc;
      const joinDate = new Date(member.join_date);
      const now = new Date();
      const months = (now.getFullYear() - joinDate.getFullYear()) * 12 + 
                    (now.getMonth() - joinDate.getMonth());
      return acc + months;
    }, 0) / Math.max(teamMembers.length, 1);

    return {
      totalMembers,
      activeMembers,
      averageEfficiency: avgEfficiency,
      totalHours: Math.round(totalHours),
      averageExperience: Math.round(avgExperience)
    };
  }, [statsData, teamMembers]);

  // Process departments data
  const departments = useMemo(() => {
    if (!deptData?.users) return [];
    
    const deptCounts: { [key: string]: number } = {};
    deptData.users.forEach((user: any) => {
      if (user.department && user.status === 'Active') {
        deptCounts[user.department] = (deptCounts[user.department] || 0) + 1;
      }
    });

    const colors = ['blue', 'green', 'purple', 'orange', 'indigo', 'pink', 'red', 'yellow'];
    return Object.entries(deptCounts).map(([name, count], index) => ({
      name,
      count,
      color: colors[index % colors.length]
    }));
  }, [deptData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'jiraSuccess';
      case 'Inactive': return 'jiraGray';
      case 'On Leave': return 'jiraWarning';
      default: return 'jiraGray';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Senior': return 'jiraSuccess';
      case 'Mid': return 'jiraWarning';
      case 'Junior': return 'jira';
      case 'Lead': return 'jiraSuccess';
      default: return 'jiraGray';
    }
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      role: 'Member',
      department: 'Engineering',
      phone: '',
      skills: '',
      status: 'Active',
      level: 'Mid'
    });
    setShowAddMember(true);
  };

  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      role: member.role || 'Member',
      department: member.department || 'Engineering',
      phone: member.phone || '',
      skills: Array.isArray(member.skills) ? member.skills.join(', ') : (member.skills || ''),
      status: member.status || 'Active',
      level: member.level || 'Mid'
    });
    setShowAddMember(true);
  };

  const handleSubmitMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const input = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department, // Valid enum value
      phone: formData.phone || null,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [], // Convert to array
      status: formData.status,
      level: formData.level,
      join_date: new Date().toISOString().split('T')[0], // Date format YYYY-MM-DD
      location: null, // Optional
      avatar: null, // Optional
      bio: null // Optional
    };

    console.log('Attempting to create/update team member with input:', input);

    try {
      if (editingMember) {
        console.log('Updating existing member with ID:', editingMember.id);
        await updateTeamMember({
          variables: {
            id: editingMember.id,
            input
          }
        });
      } else {
        console.log('Creating new team member');
        await createTeamMember({
          variables: { input }
        });
      }
      
      setShowAddMember(false);
      setEditingMember(null);
      setFormData({
        name: '',
        email: '',
        role: 'Member',
        department: 'Engineering',
        phone: '',
        skills: '',
        status: 'Active',
        level: 'Mid'
      });
    } catch (error) {
      console.error('Error saving team member:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Input data was:', input);
      
      // More detailed error message
      if (error instanceof Error) {
        showError(`${editingMember ? 'Error updating' : 'Error creating'} team member: ${error.message}`);
      } else {
        showError(editingMember ? 'Error updating team member' : 'Error creating team member');
      }
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (window.confirm('Bu takım üyesini silmek istediğinizden emin misiniz?')) {
      try {
        await deleteTeamMember({
          variables: { id: memberId }
        });
      } catch (error) {
        console.error('Error deleting team member:', error);
      }
    }
  };

  // Show loading state
  if (teamLoading || statsLoading || deptLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <div className="ml-4">
          <p className="text-lg font-medium">Takım verileri yükleniyor...</p>
          <p className="text-sm text-gray-500">Lütfen bekleyin</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (teamError || statsError || deptError) {
    return (
      <div className="space-y-4 p-6">
        <ErrorMessage message="Takım verileri yüklenirken hata oluştu." />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Hata Detayları:</h3>
          {teamError && (
            <div className="mb-2">
              <p className="text-sm font-medium text-red-700">Team Members Error:</p>
              <pre className="text-xs text-red-600 bg-red-100 p-2 rounded mt-1 overflow-auto">
                {JSON.stringify(teamError, null, 2)}
              </pre>
            </div>
          )}
          {statsError && (
            <div className="mb-2">
              <p className="text-sm font-medium text-red-700">Team Stats Error:</p>
              <pre className="text-xs text-red-600 bg-red-100 p-2 rounded mt-1 overflow-auto">
                {JSON.stringify(statsError, null, 2)}
              </pre>
            </div>
          )}
          {deptError && (
            <div className="mb-2">
              <p className="text-sm font-medium text-red-700">Departments Error:</p>
              <pre className="text-xs text-red-600 bg-red-100 p-2 rounded mt-1 overflow-auto">
                {JSON.stringify(deptError, null, 2)}
              </pre>
            </div>
          )}
        </div>
        <Button 
          variant="jira" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Sayfayı Yenile
        </Button>
      </div>
    );
  }

  // Show debug info in development
  const isDevelopment = import.meta.env.DEV;
  if (isDevelopment && (!teamData || !statsData || !deptData)) {
    return (
      <div className="space-y-4 p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Debug Bilgileri:</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Team Data:</strong> {teamData ? '✅ Yüklendi' : '❌ Boş'}</p>
            <p><strong>Stats Data:</strong> {statsData ? '✅ Yüklendi' : '❌ Boş'}</p>
            <p><strong>Dept Data:</strong> {deptData ? '✅ Yüklendi' : '❌ Boş'}</p>
            <p><strong>Team Members Count:</strong> {teamMembers.length}</p>
            <p><strong>Departments Count:</strong> {departments.length}</p>
          </div>
        </div>
        <Button 
          variant="jira" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Sayfayı Yenile
        </Button>
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
        <div className="flex items-center space-x-4">
          <motion.div 
            className="p-3 bg-purple-100 rounded-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Users className="h-8 w-8 text-purple-600" />
          </motion.div>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">{t('teamTitle')}</h1>
            <p className="text-gray-600 mt-1">{t('manageViewTeamMembers')}</p>
          </motion.div>
        </div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="jira" size="lg" onClick={handleAddMember}>
            <UserPlus className="h-5 w-5 mr-2" />
            Add Member
          </Button>
        </motion.div>
      </motion.div>

      {/* Team Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
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
                  <Users className="h-6 w-6 text-blue-600" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('totalMembers')}</p>
                  <p className="text-2xl font-bold text-gray-900">{teamStats.totalMembers}</p>
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
                  <Target className="h-6 w-6 text-green-600" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900">{teamStats.activeMembers}</p>
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
                  <p className="text-sm font-medium text-gray-600">Avg. Efficiency</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teamStats.averageEfficiency > 0 ? `${teamStats.averageEfficiency.toFixed(2)}%` : 'N/A'}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{teamStats.totalHours}h</p>
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
                  className="p-2 bg-indigo-100 rounded-lg"
                  whileHover={{ rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Award className="h-6 w-6 text-indigo-600" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Experience</p>
                  <p className="text-2xl font-bold text-gray-900">{teamStats.averageExperience}m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Departments Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-500" />
            <CardTitle>{t('departmentsOverview')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {departments.map((dept, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{dept.name}</h4>
                  <Badge variant="jira">{dept.count}</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      dept.color === 'blue' ? 'bg-blue-600' :
                      dept.color === 'green' ? 'bg-green-600' :
                      dept.color === 'purple' ? 'bg-purple-600' :
                      dept.color === 'orange' ? 'bg-orange-600' :
                      dept.color === 'indigo' ? 'bg-indigo-600' :
                      dept.color === 'pink' ? 'bg-pink-600' :
                      dept.color === 'red' ? 'bg-red-600' :
                      'bg-yellow-600'
                    }`}
                    style={{ width: `${(dept.count / teamStats.totalMembers) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-500" />
              <CardTitle>{t('teamMembersList')} ({teamMembers.length})</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">{t('filter')}</Button>
              <Button variant="outline" size="sm">{t('sort')}</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz takım üyesi bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {teamMembers.map((member: any) => (
                <div key={member.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-600">{member.avatar || member.name.substring(0, 2)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.role}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                          <Badge variant={getLevelColor(member.level)}>
                            {member.level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditMember(member)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteMember(member.id)}
                        disabled={deletingMember}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.location && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{member.location}</span>
                      </div>
                    )}
                    {member.join_date && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {new Date(member.join_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Current Projects:</span>
                      <span className="font-medium">{member.currentProjects}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Total Hours:</span>
                      <span className="font-medium">{member.totalHours}h</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Efficiency:</span>
                      <Badge variant="jiraSuccess">
                        {member.efficiency > 0 ? `${member.efficiency}%` : 'N/A'}
                      </Badge>
                    </div>
                  </div>

                  {member.skills && member.skills.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Skills</h5>
                      <div className="flex flex-wrap gap-2">
                        {member.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="jiraSecondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingMember ? t('editTeamMember') : t('addTeamMember')}
            </h2>
            
            <form className="space-y-4" onSubmit={handleSubmitMember}>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('enterName')}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('email')} *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('enterEmail')}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('role')}
                </label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Member">{t('member')}</option>
                  <option value="Team Lead">{t('teamLead')}</option>
                  <option value="Manager">{t('manager')}</option>
                  <option value="Admin">{t('admin')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('department')}
                </label>
                <select 
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Management">Management</option>
                  <option value="Design">Design</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('enterPhone')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('skills')}
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="React, TypeScript, Node.js..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('status')}
                </label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Level
                </label>
                <select 
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>
            </form>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddMember(false)}>
                {t('cancel')}
              </Button>
              <Button 
                variant="jira" 
                onClick={handleSubmitMember}
                disabled={creatingMember || updatingMember}
              >
                {(creatingMember || updatingMember) ? t('saving') : (editingMember ? t('update') : t('add'))}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
