import { gql } from '@apollo/client';

// Users
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
      status
      created_at
      updated_at
    }
  }
`;

// Customers
export const GET_CUSTOMERS = gql`
  query GetCustomers {
    customers {
      id
      name
      status
      created_at
      updated_at
    }
  }
`;

// Projects
export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      description
      customer_id
      pm_id
      is_billable
      priority
      status
      budget
      spent
      created_at
      updated_at
      customer {
        id
        name
        status
      }
    }
  }
`;

// Basic Projects Query (fallback)
export const GET_PROJECTS_BASIC = gql`
  query GetProjectsBasic {
    projects {
      id
      name
      description
      customer_id
      pm_id
      is_billable
      priority
      progress
      budget
      spent
      technologies
      status
      start_date
      end_date
      created_at
      updated_at
    }
  }
`;

// Enhanced Projects Query with Dashboard Data
export const GET_PROJECTS_DASHBOARD = gql`
  query GetProjectsDashboard {
    project_dashboard {
      id
      name
      description
      status
      priority
      progress
      budget
      spent
      remaining_budget
      budget_usage_percentage
      start_date
      end_date
      customer_name
      manager_name
      manager_email
      team_size
      total_tasks
      completed_tasks
      overdue_tasks
      total_milestones
      completed_milestones
      total_hours
      billable_hours
      health_status
      created_at
      updated_at
    }
  }
`;

// Enhanced Projects Query with all related data
export const GET_PROJECTS_DETAILED = gql`
  query GetProjectsDetailed {
    projects {
      id
      name
      description
      customer_id
      pm_id
      is_billable
      priority
      progress
      budget
      spent
      technologies
      status
      start_date
      end_date
      created_at
      updated_at
      customer {
        id
        name
        status
      }
    }
  }
`;

// Project Statistics Query
export const GET_PROJECT_STATS = gql`
  query GetProjectStats {
    projects_aggregate {
      aggregate {
        count
      }
    }
    projects(where: { status: { _eq: "active" } }) {
      id
      status
      priority
      progress
      budget
      spent
    }
    time_entries_aggregate {
      aggregate {
        sum {
          effort
        }
      }
    }
  }
`;

// Single Project with Full Details
export const GET_PROJECT_BY_ID = gql`
  query GetProjectById($id: uuid!) {
    projects_by_pk(id: $id) {
      id
      name
      description
      customer_id
      pm_id
      is_billable
      priority
      progress
      budget
      spent
      technologies
      status
      start_date
      end_date
      created_at
      updated_at
      customer {
        id
        name
        status
      }
      project_manager {
        id
        name
        email
        role
        department
      }
      project_members {
        id
        user {
          id
          name
          email
          role
          department
          avatar
        }
        role
        start_date
        end_date
      }
      project_tasks {
        id
        title
        description
        status
        priority
        assigned_to
        estimated_hours
        actual_hours
        due_date
        assigned_user {
          id
          name
          email
        }
      }
      project_milestones {
        id
        title
        description
        due_date
        status
      }
      time_entries(order_by: { date: desc }) {
        id
        date
        effort
        description
        is_billable
        task_id
        user {
          id
          name
        }
        project_task {
          id
          title
          status
        }
        task_type {
          id
          name
        }
        division {
          id
          name
        }
      }
    }
  }
`;

// Projects by Customer
export const GET_PROJECTS_BY_CUSTOMER = gql`
  query GetProjectsByCustomer($customerId: uuid!) {
    projects(where: { customer_id: { _eq: $customerId } }) {
      id
      name
      description
      status
      priority
      progress
      budget
      spent
      start_date
      end_date
      project_manager {
        id
        name
      }
    }
  }
`;

// Projects by Status
export const GET_PROJECTS_BY_STATUS = gql`
  query GetProjectsByStatus($status: String!) {
    projects(where: { status: { _eq: $status } }) {
      id
      name
      description
      customer {
        name
      }
      priority
      progress
      budget
      spent
      start_date
      end_date
    }
  }
`;

// Project Tasks
export const GET_PROJECT_TASKS = gql`
  query GetProjectTasks($projectId: uuid!) {
    project_tasks(where: { project_id: { _eq: $projectId } }) {
      id
      title
      description
      status
      priority
      assigned_to
      estimated_hours
      actual_hours
      due_date
      created_at
      updated_at
      project {
        id
        name
      }
      assigned_user {
        id
        name
        email
      }
    }
  }
`;

// All Project Tasks for Calendar
export const GET_ALL_PROJECT_TASKS = gql`
  query GetAllProjectTasks {
    project_tasks(order_by: { due_date: asc }) {
      id
      title
      description
      status
      priority
      assigned_to
      estimated_hours
      actual_hours
      due_date
      created_at
      updated_at
      project {
        id
        name
        customer {
          name
        }
      }
      assigned_user {
        id
        name
        email
      }
    }
  }
`;

// Get Project Tasks by User
export const GET_USER_PROJECT_TASKS = gql`
  query GetUserProjectTasks($userId: uuid!) {
    project_tasks(where: { assigned_to: { _eq: $userId } }, order_by: { due_date: asc }) {
      id
      title
      description
      status
      priority
      assigned_to
      estimated_hours
      actual_hours
      due_date
      created_at
      updated_at
      project {
        id
        name
        customer {
          name
        }
      }
    }
  }
`;

// Project Milestones
export const GET_PROJECT_MILESTONES = gql`
  query GetProjectMilestones($projectId: uuid!) {
    project_milestones(where: { project_id: { _eq: $projectId } }) {
      id
      title
      description
      due_date
      status
    }
  }
`;

// Task Types
export const GET_TASK_TYPES = gql`
  query GetTaskTypes {
    task_types {
      id
      name
      created_at
      updated_at
    }
  }
`;

// Divisions
export const GET_DIVISIONS = gql`
  query GetDivisions {
    divisions {
      id
      name
      created_at
      updated_at
    }
  }
`;

// Time Entries
export const GET_TIME_ENTRIES = gql`
  query GetTimeEntries {
    time_entries(order_by: { date: desc }) {
      id
      date
      effort
      description
      is_billable
      user_id
      project_id
      task_id
      task_type_id
      division_id
      created_at
      updated_at
      user {
        id
        name
        email
      }
      project {
        id
        name
      }
      project_task {
        id
        title
        status
      }
      task_type {
        id
        name
      }
      division {
        id
        name
      }
    }
  }
`;

// Special Days
export const GET_SPECIAL_DAYS = gql`
  query GetSpecialDays {
    special_days(order_by: { date: asc }) {
      id
      date
      name
      created_at
      updated_at
    }
  }
`;

// Dynamic Parameters
export const GET_DYNAMIC_PARAMETERS = gql`
  query GetDynamicParameters {
    dynamic_parameters {
      id
      key
      value
      description
      created_at
      updated_at
    }
  }
`;

// Filtered Time Entries
export const GET_FILTERED_TIME_ENTRIES = gql`
  query GetFilteredTimeEntries(
    $startDate: date!
    $endDate: date!
  ) {
    time_entries(
      where: {
        date: { _gte: $startDate, _lte: $endDate }
      }
      order_by: { date: desc }
    ) {
      id
      date
      effort
      description
      is_billable
      user_id
      project_id
      task_id
      task_type_id
      division_id
      created_at
      updated_at
      user {
        id
        name
        email
      }
      project {
        id
        name
      }
      project_task {
        id
        title
        status
      }
      task_type {
        id
        name
      }
      division {
        id
        name
      }
    }
  }
`;

// Team Management Queries
export const GET_TEAM_MEMBERS = gql`
  query GetTeamMembers {
    users {
      id
      name
      email
      role
      phone
      location
      avatar
      level
      department
      join_date
      skills
      bio
      status
      created_at
      updated_at
    }
  }
`;

export const GET_TEAM_STATS = gql`
  query GetTeamStats {
    users_aggregate {
      aggregate {
        count
      }
    }
    users(where: { status: { _eq: "Active" } }) {
      id
      level
      department
    }
    user_performance {
      id
      user_id
      total_hours
      billable_hours
      efficiency_score
      project_count
    }
  }
`;

export const GET_DEPARTMENTS_OVERVIEW = gql`
  query GetDepartmentsOverview {
    users {
      id
      department
      status
    }
  }
`;

export const GET_USER_PERFORMANCE = gql`
  query GetUserPerformance($userId: uuid!, $startDate: date!, $endDate: date!) {
    user_performance(
      where: {
        user_id: { _eq: $userId }
        period_start: { _gte: $startDate }
        period_end: { _lte: $endDate }
      }
    ) {
      id
      period_start
      period_end
      total_hours
      billable_hours
      efficiency_score
      project_count
    }
  }
`;

export const GET_USER_PROJECTS = gql`
  query GetUserProjects($userId: uuid!) {
    project_members(
      where: {
        user_id: { _eq: $userId }
        project: { status: { _eq: "Active" } }
        _or: [
          { end_date: { _is_null: true } }
          { end_date: { _gte: "now()" } }
        ]
      }
    ) {
      id
      project {
        id
        name
        status
        start_date
        end_date
        customer {
          name
        }
      }
      role
      start_date
      end_date
    }
  }
`;

export const GET_TEAM_MEMBER_BY_ID = gql`
  query GetTeamMemberById($id: uuid!) {
    users_by_pk(id: $id) {
      id
      name
      email
      phone
      location
      avatar
      role
      status
      level
      department
      join_date
      skills
      bio
      created_at
      updated_at
      performance_metrics {
        id
        period_start
        period_end
        total_hours
        billable_hours
        efficiency_score
        project_count
      }
      project_memberships {
        id
        project {
          id
          name
          status
          start_date
          end_date
          customer {
            name
          }
        }
        role
        start_date
        end_date
      }
      time_entries {
        id
        date
        effort
        description
        is_billable
        project {
          name
        }
        task_type {
          name
        }
      }
    }
  }
`;

// Dashboard Queries
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    user_performance_aggregate {
      aggregate {
        sum {
          total_hours
          billable_hours
        }
        count
      }
    }
    projects_aggregate(where: { status: { _eq: "Active" } }) {
      aggregate {
        count
      }
    }
    users_aggregate(where: { status: { _eq: "Active" } }) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_DASHBOARD_PROJECTS = gql`
  query GetDashboardProjects {
    project_dashboard(
      where: { status: { _eq: "Active" } }
      order_by: { progress: desc }
      limit: 4
    ) {
      id
      name
      progress
      team_size
      total_tasks
      completed_tasks
      status
      budget_usage_percentage
    }
  }
`;

export const GET_TEAM_PERFORMANCE = gql`
  query GetTeamPerformance {
    user_performance(
      order_by: { total_hours: desc }
      limit: 4
    ) {
      user_id
      total_hours
      billable_hours
      efficiency_score
      project_count
      user {
        id
        name
        role
        department
      }
    }
  }
`;

export const GET_RECENT_ACTIVITIES = gql`
  query GetRecentActivities {
    time_entries(
      order_by: { created_at: desc }
      limit: 4
    ) {
      id
      date
      effort
      description
      created_at
      user {
        id
        name
      }
      project {
        id
        name
      }
      task_type {
        name
      }
    }
  }
`;

export const GET_WEEKLY_COMPARISON = gql`
  query GetWeeklyComparison($thisWeekStart: date!, $thisWeekEnd: date!, $lastWeekStart: date!, $lastWeekEnd: date!) {
    thisWeek: time_entries_aggregate(
      where: {
        date: { _gte: $thisWeekStart, _lte: $thisWeekEnd }
      }
    ) {
      aggregate {
        sum {
          effort
        }
      }
    }
    lastWeek: time_entries_aggregate(
      where: {
        date: { _gte: $lastWeekStart, _lte: $lastWeekEnd }
      }
    ) {
      aggregate {
        sum {
          effort
        }
      }
    }
  }
`;
