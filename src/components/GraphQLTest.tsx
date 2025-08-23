import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import { 
  GET_PROJECTS,
  GET_PROJECTS_DETAILED, 
  GET_PROJECT_STATS,
  GET_CUSTOMERS,
  GET_USERS,
  GET_SPECIAL_DAYS
} from '../lib/graphql/queries';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority?: string;
  progress?: number;
  budget?: number;
  spent?: number;
  technologies?: string[];
}

interface ProjectStats {
  projects_aggregate?: {
    aggregate?: {
      count?: number;
    };
  };
  projects?: Project[];
  time_entries_aggregate?: {
    aggregate?: {
      sum?: {
        effort?: number;
      };
    };
  };
}
import { 
  CREATE_PROJECT_ENHANCED,
  CREATE_PROJECT_TASK,
  DELETE_PROJECT 
} from '../lib/graphql/mutations';

export const GraphQLTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'customers' | 'users' | 'special_days'>('special_days');
  // Projects Query - Sadece detailed query kullanıyoruz
  const { 
    data: projectsData, 
    loading: projectsLoading, 
    error: projectsError,
    refetch: refetchProjects 
  } = useQuery(GET_PROJECTS_DETAILED);

  // Project Stats Query
  const { 
    data: statsData, 
    loading: statsLoading 
  } = useQuery<ProjectStats>(GET_PROJECT_STATS);

  // Customers Query
  const { 
    data: customersData, 
    loading: customersLoading, 
    error: customersError 
  } = useQuery(GET_CUSTOMERS);

  // Users Query
  const { 
    data: usersData, 
    loading: usersLoading 
  } = useQuery(GET_USERS);

  // Special Days Query
  const { 
    data: specialDaysData, 
    loading: specialDaysLoading, 
    error: specialDaysError 
  } = useQuery(GET_SPECIAL_DAYS);

  // Mutations
  const [createProject] = useMutation(CREATE_PROJECT_ENHANCED, {
    onCompleted: () => {
      refetchProjects();
    }
  });

  const [createTask] = useMutation(CREATE_PROJECT_TASK, {
    onCompleted: () => {
      refetchProjects();
    }
  });

  const [deleteProject] = useMutation(DELETE_PROJECT, {
    onCompleted: () => {
      refetchProjects();
    }
  });

  // Hata detaylarını logla
  React.useEffect(() => {
    if (projectsError) {
      console.error('Projects Error Details:', projectsError);
      console.error('Error Message:', projectsError.message);
      console.error('Error GraphQLErrors:', projectsError.graphQLErrors);
      console.error('Error NetworkError:', projectsError.networkError);
    }
  }, [projectsError]);

  const handleCreateProject = async () => {
    try {
      await createProject({
        variables: {
          input: {
            name: 'Test Project',
            description: 'This is a test project created via GraphQL',
            customer_id: customersData?.customers[0]?.id,
            pm_id: usersData?.users[0]?.id,
            is_billable: true,
            priority: 'medium',
            progress: 0,
            budget: 10000.00,
            spent: 0.00,
            technologies: ['React', 'Node.js'],
            status: 'planning',
            start_date: '2024-01-01',
            end_date: '2024-06-30'
          }
        }
      });
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!projectsData?.projects[0]?.id) return;
    
    try {
      await createTask({
        variables: {
          input: {
            project_id: projectsData.projects[0].id,
            title: 'Test Task',
            description: 'This is a test task',
            status: 'pending',
            priority: 'medium',
            estimated_hours: 8.0,
            due_date: '2024-12-31'
          }
        }
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
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

  if (projectsLoading || statsLoading || customersLoading || usersLoading || specialDaysLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">GraphQL Test Panel</h1>
        <div className="flex space-x-2">
          <Button 
            variant={activeTab === 'projects' ? 'jira' : 'outline'}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </Button>
          <Button 
            variant={activeTab === 'customers' ? 'jira' : 'outline'}
            onClick={() => setActiveTab('customers')}
          >
            Customers
          </Button>
          <Button 
            variant={activeTab === 'users' ? 'jira' : 'outline'}
            onClick={() => setActiveTab('users')}
          >
            Users
          </Button>
          <Button 
            variant={activeTab === 'special_days' ? 'jira' : 'outline'}
            onClick={() => setActiveTab('special_days')}
          >
            Special Days
          </Button>
        </div>
      </div>

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button onClick={handleCreateProject}>
              Create Test Project
            </Button>
            <Button onClick={handleCreateTask}>
              Create Test Task
            </Button>
            <Button onClick={() => refetchProjects()}>
              Refresh Projects
            </Button>

          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Query Type:</strong> Detailed</p>
            <p><strong>Projects Count:</strong> {projectsData?.projects?.length || 0}</p>
            <p><strong>Loading:</strong> {projectsLoading ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {projectsError ? 'Yes' : 'No'}</p>
            {projectsError && (
              <div className="bg-red-50 p-3 rounded">
                <p className="text-red-800"><strong>Error Message:</strong> {projectsError.message}</p>
                {projectsError.graphQLErrors && projectsError.graphQLErrors.length > 0 && (
                  <p className="text-red-700"><strong>GraphQL Errors:</strong> {projectsError.graphQLErrors.map(e => e.message).join(', ')}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Project Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Project Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {statsData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {statsData.projects_aggregate?.aggregate?.count || 0}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-green-600">
                      {statsData.projects?.filter((p: Project) => p.status === 'Active' || p.status === 'active').length || 0}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Hours</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(statsData.time_entries_aggregate?.aggregate?.sum?.effort || 0)}h
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">Avg Progress</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {statsData.projects && statsData.projects.length > 0 
                        ? Math.round(statsData.projects.reduce((acc: number, p: Project) => acc + (p.progress || 0), 0) / statsData.projects.length)
                        : 0}%
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects List */}
          <Card>
            <CardHeader>
              <CardTitle>Projects ({projectsData?.projects?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {projectsError ? (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800 font-medium">Error loading projects:</p>
                  <p className="text-red-700">{projectsError.message}</p>
                  {projectsError.graphQLErrors && projectsError.graphQLErrors.length > 0 && (
                    <p className="text-red-700 text-sm">
                      <strong>GraphQL Errors:</strong> {projectsError.graphQLErrors.map(e => e.message).join(', ')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {projectsData?.projects?.map((project: any) => (
                    <div key={project.id} className="border p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{project.name}</h3>
                          <p className="text-sm text-gray-600">{project.description || 'No description'}</p>
                          <div className="flex space-x-2 mt-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {project.status}
                            </span>
                            {project.priority && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                {project.priority}
                              </span>
                            )}
                            {project.progress !== undefined && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                {project.progress}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-600"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      {/* Project Details */}
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Customer ID</p>
                          <p className="font-medium">{project.customer_id?.substring(0, 8)}...</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Manager ID</p>
                          <p className="font-medium">{project.pm_id?.substring(0, 8)}...</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Billable</p>
                          <p className="font-medium">{project.is_billable ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Created</p>
                          <p className="font-medium">{new Date(project.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Raw Data */}
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-gray-600">Show Raw Data</summary>
                        <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto">
                          {JSON.stringify(project, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <Card>
          <CardHeader>
            <CardTitle>Customers ({customersData?.customers?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {customersError ? (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-800 font-medium">Error loading customers:</p>
                <p className="text-red-700">{customersError.message}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {customersData?.customers?.map((customer: any) => (
                  <div key={customer.id} className="border p-3 rounded">
                    <h3 className="font-medium">{customer.name}</h3>
                    <p className="text-sm text-gray-600">Status: {customer.status}</p>
                    <p className="text-sm text-gray-600">ID: {customer.id.substring(0, 8)}...</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>Users ({usersData?.users?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usersData?.users?.map((user: any) => (
                <div key={user.id} className="border p-3 rounded">
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-gray-600">Email: {user.email}</p>
                  <p className="text-sm text-gray-600">Role: {user.role}</p>
                  <p className="text-sm text-gray-600">Status: {user.status}</p>
                  <p className="text-sm text-gray-600">ID: {user.id.substring(0, 8)}...</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Special Days Tab */}
      {activeTab === 'special_days' && (
        <Card>
          <CardHeader>
            <CardTitle>Special Days ({specialDaysData?.special_days?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {specialDaysLoading ? (
              <LoadingSpinner />
            ) : specialDaysError ? (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-800 font-medium">Error loading special days:</p>
                <p className="text-red-700">{specialDaysError.message}</p>
                <pre className="text-xs mt-2 text-red-600 overflow-auto">
                  {JSON.stringify(specialDaysError, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="space-y-2">
                {specialDaysData?.special_days?.length === 0 ? (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-yellow-800">Henüz özel gün eklenmemiş.</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Hasura console'da (localhost:8080/console) GraphQL mutations kullanarak özel günler ekleyebilirsiniz.
                    </p>
                  </div>
                ) : (
                  specialDaysData?.special_days?.map((specialDay: any) => (
                    <div key={specialDay.id} className="border p-3 rounded bg-yellow-50">
                      <h3 className="font-medium text-yellow-800">{specialDay.name}</h3>
                      <p className="text-sm text-yellow-700">
                        Date: {new Date(specialDay.date).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">ID: {specialDay.id.substring(0, 8)}...</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
