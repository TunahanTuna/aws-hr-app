import { gql } from '@apollo/client';

// Start time tracking for a task
export const START_TIME_TRACKING = gql`
  mutation StartTimeTracking($user_id: uuid!, $task_id: uuid!) {
    start_time_tracking(user_id: $user_id, task_id: $task_id) {
      id
      user_id
      task_id
      start_time
      is_active
    }
  }
`;

// Stop time tracking for a task
export const STOP_TIME_TRACKING = gql`
  mutation StopTimeTracking($entry_id: uuid!) {
    stop_time_tracking(entry_id: $entry_id) {
      id
      user_id
      task_id
      start_time
      end_time
      is_active
      duration_minutes
    }
  }
`;

// Get active time tracking entries for a user
export const GET_ACTIVE_TIME_TRACKING = gql`
  query GetActiveTimeTracking($user_id: uuid!) {
    active_time_tracking(where: { user_id: { _eq: $user_id } }) {
      id
      user_id
      task_id
      start_time
      project_name
      task_name
      elapsed_minutes
    }
  }
`;

// Get time entries for a specific task
export const GET_TASK_TIME_ENTRIES = gql`
  query GetTaskTimeEntries($task_id: uuid!) {
    time_entries(
      where: { task_id: { _eq: $task_id } }
      order_by: { created_at: desc }
    ) {
      id
      user_id
      task_id
      start_time
      end_time
      duration_minutes
      is_active
      created_at
      user {
        name
      }
    }
  }
`;

// Get task time summary
export const GET_TASK_TIME_SUMMARY = gql`
  query GetTaskTimeSummary($task_id: uuid!) {
    task_time_summary(where: { task_id: { _eq: $task_id } }) {
      task_id
      title
      estimated_hours
      actual_hours
      calculated_actual_hours
      time_efficiency_percentage
      total_time_entries
      active_timers
    }
  }
`;

// Get user's time entries for a date range
export const GET_USER_TIME_ENTRIES = gql`
  query GetUserTimeEntries($user_id: uuid!, $start_date: timestamptz!, $end_date: timestamptz!) {
    time_entries(
      where: {
        user_id: { _eq: $user_id }
        created_at: { _gte: $start_date, _lte: $end_date }
        is_active: { _eq: false }
      }
      order_by: { created_at: desc }
    ) {
      id
      task_id
      start_time
      end_time
      duration_minutes
      created_at
      project_task {
        name
        project {
          name
        }
      }
    }
  }
`;
