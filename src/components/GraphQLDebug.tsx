import React from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

// Simple projects query to test basic connection
const TEST_PROJECTS_SIMPLE = gql`
  query TestProjectsSimple {
    projects {
      id
      name
      customer_id
      pm_id
    }
  }
`;

// Test project manager relationship
const TEST_PROJECTS_WITH_MANAGER = gql`
  query TestProjectsWithManager {
    projects {
      id
      name
      project_manager {
        id
        name
      }
    }
  }
`;

// Test users query
const TEST_USERS = gql`
  query TestUsers {
    users {
      id
      name
      role
    }
  }
`;

export const GraphQLDebug: React.FC = () => {
  const { data: projectsData, loading: projectsLoading, error: projectsError } = useQuery(TEST_PROJECTS_SIMPLE);
  const { data: projectsWithManagerData, loading: projectsWithManagerLoading, error: projectsWithManagerError } = useQuery(TEST_PROJECTS_WITH_MANAGER);
  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(TEST_USERS);

  return (
    <div className="p-6 bg-gray-100 space-y-6">
      <h2 className="text-2xl font-bold">GraphQL Debug</h2>
      
      {/* Simple Projects Query */}
      <div className="bg-white p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Simple Projects Query</h3>
        <p><strong>Loading:</strong> {projectsLoading ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {projectsError ? 'Yes' : 'No'}</p>
        {projectsError && (
          <div className="bg-red-50 p-3 rounded mt-2">
            <p className="text-red-800"><strong>Error:</strong> {projectsError.message}</p>
          </div>
        )}
        {projectsData && (
          <div className="bg-green-50 p-3 rounded mt-2">
            <p className="text-green-800"><strong>Projects found:</strong> {projectsData.projects.length}</p>
            <pre className="text-sm mt-2">{JSON.stringify(projectsData, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Projects with Manager Query */}
      <div className="bg-white p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Projects with Manager Query</h3>
        <p><strong>Loading:</strong> {projectsWithManagerLoading ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {projectsWithManagerError ? 'Yes' : 'No'}</p>
        {projectsWithManagerError && (
          <div className="bg-red-50 p-3 rounded mt-2">
            <p className="text-red-800"><strong>Error:</strong> {projectsWithManagerError.message}</p>
          </div>
        )}
        {projectsWithManagerData && (
          <div className="bg-green-50 p-3 rounded mt-2">
            <p className="text-green-800"><strong>Projects found:</strong> {projectsWithManagerData.projects.length}</p>
            <pre className="text-sm mt-2">{JSON.stringify(projectsWithManagerData, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Users Query */}
      <div className="bg-white p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Users Query</h3>
        <p><strong>Loading:</strong> {usersLoading ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {usersError ? 'Yes' : 'No'}</p>
        {usersError && (
          <div className="bg-red-50 p-3 rounded mt-2">
            <p className="text-red-800"><strong>Error:</strong> {usersError.message}</p>
          </div>
        )}
        {usersData && (
          <div className="bg-green-50 p-3 rounded mt-2">
            <p className="text-green-800"><strong>Users found:</strong> {usersData.users.length}</p>
            <pre className="text-sm mt-2">{JSON.stringify(usersData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
