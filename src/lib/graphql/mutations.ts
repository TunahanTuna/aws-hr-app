import { gql } from '@apollo/client';

// User Mutations
export const CREATE_USER = gql`
  mutation CreateUser($input: users_insert_input!) {
    insert_users_one(object: $input) {
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

export const UPDATE_USER = gql`
  mutation UpdateUser($id: uuid!, $input: users_set_input!) {
    update_users_by_pk(pk_columns: { id: $id }, _set: $input) {
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

export const DELETE_USER = gql`
  mutation DeleteUser($id: uuid!) {
    delete_users_by_pk(id: $id) {
      id
      name
    }
  }
`;

// Customer Mutations
export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($input: customers_insert_input!) {
    insert_customers_one(object: $input) {
      id
      name
      status
      created_at
      updated_at
    }
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($id: uuid!, $input: customers_set_input!) {
    update_customers_by_pk(pk_columns: { id: $id }, _set: $input) {
      id
      name
      status
      created_at
      updated_at
    }
  }
`;

export const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: uuid!) {
    delete_customers_by_pk(id: $id) {
      id
      name
    }
  }
`;

// Project Mutations
export const CREATE_PROJECT = gql`
  mutation CreateProject($input: projects_insert_input!) {
    insert_projects_one(object: $input) {
      id
      name
      customer_id
      pm_id
      is_billable
      created_at
      updated_at
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: uuid!, $input: projects_set_input!) {
    update_projects_by_pk(pk_columns: { id: $id }, _set: $input) {
      id
      name
      customer_id
      pm_id
      is_billable
      created_at
      updated_at
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: uuid!) {
    delete_projects_by_pk(id: $id) {
      id
      name
    }
  }
`;

// Project Member Mutations
export const ADD_PROJECT_MEMBER = gql`
  mutation AddProjectMember($projectId: uuid!, $userId: uuid!) {
    insert_project_members_one(object: { project_id: $projectId, user_id: $userId }) {
      id
      project_id
      user_id
      created_at
    }
  }
`;

export const REMOVE_PROJECT_MEMBER = gql`
  mutation RemoveProjectMember($id: uuid!) {
    delete_project_members_by_pk(id: $id) {
      id
      project_id
      user_id
    }
  }
`;

// Task Type Mutations
export const CREATE_TASK_TYPE = gql`
  mutation CreateTaskType($input: task_types_insert_input!) {
    insert_task_types_one(object: $input) {
      id
      name
      created_at
      updated_at
    }
  }
`;

export const UPDATE_TASK_TYPE = gql`
  mutation UpdateTaskType($id: uuid!, $input: task_types_set_input!) {
    update_task_types_by_pk(pk_columns: { id: $id }, _set: $input) {
      id
      name
      created_at
      updated_at
    }
  }
`;

export const DELETE_TASK_TYPE = gql`
  mutation DeleteTaskType($id: uuid!) {
    delete_task_types_by_pk(id: $id) {
      id
      name
    }
  }
`;

// Division Mutations
export const CREATE_DIVISION = gql`
  mutation CreateDivision($input: divisions_insert_input!) {
    insert_divisions_one(object: $input) {
      id
      name
      created_at
      updated_at
    }
  }
`;

export const UPDATE_DIVISION = gql`
  mutation UpdateDivision($id: uuid!, $input: divisions_set_input!) {
    update_divisions_by_pk(pk_columns: { id: $id }, _set: $input) {
      id
      name
      created_at
      updated_at
    }
  }
`;

export const DELETE_DIVISION = gql`
  mutation DeleteDivision($id: uuid!) {
    delete_divisions_by_pk(id: $id) {
      id
      name
    }
  }
`;

// Time Entry Mutations
export const CREATE_TIME_ENTRY = gql`
  mutation CreateTimeEntry($input: time_entries_insert_input!) {
    insert_time_entries_one(object: $input) {
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
    }
  }
`;

export const UPDATE_TIME_ENTRY = gql`
  mutation UpdateTimeEntry($id: uuid!, $input: time_entries_set_input!) {
    update_time_entries_by_pk(pk_columns: { id: $id }, _set: $input) {
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
    }
  }
`;

export const DELETE_TIME_ENTRY = gql`
  mutation DeleteTimeEntry($id: uuid!) {
    delete_time_entries_by_pk(id: $id) {
      id
      date
      description
    }
  }
`;

// Special Day Mutations
export const CREATE_SPECIAL_DAY = gql`
  mutation CreateSpecialDay($input: special_days_insert_input!) {
    insert_special_days_one(object: $input) {
      id
      date
      name
      created_at
      updated_at
    }
  }
`;

export const UPDATE_SPECIAL_DAY = gql`
  mutation UpdateSpecialDay($id: uuid!, $input: special_days_set_input!) {
    update_special_days_by_pk(pk_columns: { id: $id }, _set: $input) {
      id
      date
      name
      created_at
      updated_at
    }
  }
`;

export const DELETE_SPECIAL_DAY = gql`
  mutation DeleteSpecialDay($id: uuid!) {
    delete_special_days_by_pk(id: $id) {
      id
      date
      name
    }
  }
`;

// Dynamic Parameter Mutations
export const UPDATE_DYNAMIC_PARAMETER = gql`
  mutation UpdateDynamicParameter($id: uuid!, $input: dynamic_parameters_set_input!) {
    update_dynamic_parameters_by_pk(pk_columns: { id: $id }, _set: $input) {
      id
      key
      value
      description
      created_at
      updated_at
    }
  }
`;

export const CREATE_DYNAMIC_PARAMETER = gql`
  mutation CreateDynamicParameter($input: dynamic_parameters_insert_input!) {
    insert_dynamic_parameters_one(object: $input) {
      id
      key
      value
      description
      created_at
      updated_at
    }
  }
`;

// Team Management Mutations
export const CREATE_TEAM_MEMBER = gql`
  mutation CreateTeamMember($input: users_insert_input!) {
    insert_users_one(object: $input) {
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
    }
  }
`;

export const UPDATE_TEAM_MEMBER = gql`
  mutation UpdateTeamMember($id: uuid!, $input: users_set_input!) {
    update_users_by_pk(pk_columns: { id: $id }, _set: $input) {
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
      updated_at
    }
  }
`;

export const DELETE_TEAM_MEMBER = gql`
  mutation DeleteTeamMember($id: uuid!) {
    delete_users_by_pk(id: $id) {
      id
      name
    }
  }
`;

export const CREATE_USER_PERFORMANCE = gql`
  mutation CreateUserPerformance($input: user_performance_insert_input!) {
    insert_user_performance_one(object: $input) {
      id
      user_id
      period_start
      period_end
      total_hours
      billable_hours
      efficiency_score
      project_count
      created_at
      updated_at
    }
  }
`;

export const UPDATE_USER_PERFORMANCE = gql`
  mutation UpdateUserPerformance($id: uuid!, $input: user_performance_set_input!) {
    update_user_performance_by_pk(pk_columns: { id: $id }, _set: $input) {
      id
      user_id
      period_start
      period_end
      total_hours
      billable_hours
      efficiency_score
      project_count
      updated_at
    }
  }
`;

export const ADD_USER_TO_PROJECT = gql`
  mutation AddUserToProject($input: project_members_insert_input!) {
    insert_project_members_one(object: $input) {
      id
      project_id
      user_id
      role
      start_date
      end_date
      created_at
    }
  }
`;

export const REMOVE_USER_FROM_PROJECT = gql`
  mutation RemoveUserFromProject($id: uuid!) {
    delete_project_members_by_pk(id: $id) {
      id
      project_id
      user_id
    }
  }
`;

export const UPDATE_PROJECT_MEMBER_ROLE = gql`
  mutation UpdateProjectMemberRole($id: uuid!, $role: String!, $endDate: date) {
    update_project_members_by_pk(
      pk_columns: { id: $id }
      _set: { role: $role, end_date: $endDate }
    ) {
      id
      role
      end_date
      updated_at
    }
  }
`;

// Enhanced Project Mutations
export const CREATE_PROJECT_ENHANCED = gql`
  mutation CreateProjectEnhanced($input: projects_insert_input!) {
    insert_projects_one(object: $input) {
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

export const UPDATE_PROJECT_ENHANCED = gql`
  mutation UpdateProjectEnhanced($id: uuid!, $input: projects_set_input!) {
    update_projects_by_pk(pk_columns: { id: $id }, _set: $input) {
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

// Project Task Mutations
export const CREATE_PROJECT_TASK = gql`
  mutation CreateProjectTask($input: project_tasks_insert_input!) {
    insert_project_tasks_one(object: $input) {
      id
      project_id
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
    }
  }
`;

export const UPDATE_PROJECT_TASK = gql`
  mutation UpdateProjectTask($id: uuid!, $input: project_tasks_set_input!) {
    update_project_tasks_by_pk(pk_columns: { id: $id }, _set: $input) {
      id
      project_id
      title
      description
      status
      priority
      assigned_to
      estimated_hours
      actual_hours
      due_date
      updated_at
    }
  }
`;

export const DELETE_PROJECT_TASK = gql`
  mutation DeleteProjectTask($id: uuid!) {
    delete_project_tasks_by_pk(id: $id) {
      id
      title
    }
  }
`;

// Project Milestone Mutations
export const CREATE_PROJECT_MILESTONE = gql`
  mutation CreateProjectMilestone($input: project_milestones_insert_input!) {
    insert_project_milestones_one(object: $input) {
      id
      project_id
      title
      description
      due_date
      status
      created_at
      updated_at
    }
  }
`;

export const UPDATE_PROJECT_MILESTONE = gql`
  mutation UpdateProjectMilestone($id: uuid!, $input: project_milestones_set_input!) {
    update_project_milestones_by_pk(pk_columns: { id: $id }, _set: $input) {
      id
      project_id
      title
      description
      due_date
      status
      updated_at
    }
  }
`;

export const DELETE_PROJECT_MILESTONE = gql`
  mutation DeleteProjectMilestone($id: uuid!) {
    delete_project_milestones_by_pk(id: $id) {
      id
      title
    }
  }
`;

// Project Budget Mutations
export const CREATE_PROJECT_BUDGET = gql`
  mutation CreateProjectBudget($input: project_budgets_insert_input!) {
    insert_project_budgets_one(object: $input) {
      id
      project_id
      period_start
      period_end
      budget_amount
      spent_amount
      created_at
      updated_at
    }
  }
`;

export const UPDATE_PROJECT_BUDGET = gql`
  mutation UpdateProjectBudget($id: uuid!, $input: project_budgets_set_input!) {
    update_project_budgets_by_pk(pk_columns: { id: $id }, _set: $input) {
      id
      project_id
      period_start
      period_end
      budget_amount
      spent_amount
      updated_at
    }
  }
`;

export const DELETE_PROJECT_BUDGET = gql`
  mutation DeleteProjectBudget($id: uuid!) {
    delete_project_budgets_by_pk(id: $id) {
      id
      project_id
    }
  }
`;
