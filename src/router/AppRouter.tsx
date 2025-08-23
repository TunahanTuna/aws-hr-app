import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { GraphQLDebug } from '../components/GraphQLDebug';
import { 
  EntriesPage, 
  NewEntryPage, 
  ReportsPage, 
  AdminPage, 
  WebListPage,
  DashboardPage,
  TeamPage,
  ProjectsPage,
  ProjectDetailPage,
  CalendarPage,
  SettingsPage
} from '../pages';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="entries" element={<EntriesPage />} />
        <Route path="new-entry" element={<NewEntryPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="web-list" element={<WebListPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="debug" element={<GraphQLDebug />} />
      </Route>
    </Routes>
  );
};
