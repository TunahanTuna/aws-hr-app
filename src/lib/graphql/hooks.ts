import { useQuery, useMutation, useLazyQuery, useApolloClient } from '@apollo/client';
import {
  GET_USERS,
  GET_CUSTOMERS,
  GET_PROJECTS,
  GET_PROJECT_STATS,
  GET_TASK_TYPES,
  GET_DIVISIONS,
  GET_TIME_ENTRIES,
  GET_SPECIAL_DAYS,
  GET_DYNAMIC_PARAMETERS,
  GET_FILTERED_TIME_ENTRIES,
  GET_TEAM_MEMBERS,
  GET_TEAM_STATS,
  GET_DEPARTMENTS_OVERVIEW,
  GET_USER_PERFORMANCE,
  GET_USER_PROJECTS,
  GET_TEAM_MEMBER_BY_ID,
  GET_PROJECT_TASKS,
  GET_PROJECT_MILESTONES,
  GET_ALL_PROJECT_TASKS,
  GET_USER_PROJECT_TASKS,
} from './queries';
import {
  CREATE_USER,
  UPDATE_USER,
  DELETE_USER,
  CREATE_CUSTOMER,
  UPDATE_CUSTOMER,
  DELETE_CUSTOMER,
  CREATE_PROJECT,
  UPDATE_PROJECT,
  DELETE_PROJECT,
  ADD_PROJECT_MEMBER,
  REMOVE_PROJECT_MEMBER,
  CREATE_TASK_TYPE,
  UPDATE_TASK_TYPE,
  DELETE_TASK_TYPE,
  CREATE_DIVISION,
  UPDATE_DIVISION,
  DELETE_DIVISION,
  CREATE_TIME_ENTRY,
  UPDATE_TIME_ENTRY,
  DELETE_TIME_ENTRY,
  CREATE_SPECIAL_DAY,
  UPDATE_SPECIAL_DAY,
  DELETE_SPECIAL_DAY,
  UPDATE_DYNAMIC_PARAMETER,
  CREATE_DYNAMIC_PARAMETER,
  CREATE_TEAM_MEMBER,
  UPDATE_TEAM_MEMBER,
  DELETE_TEAM_MEMBER,
  CREATE_USER_PERFORMANCE,
  UPDATE_USER_PERFORMANCE,
  ADD_USER_TO_PROJECT,
  REMOVE_USER_FROM_PROJECT,
  UPDATE_PROJECT_MEMBER_ROLE,
  CREATE_PROJECT_TASK,
  UPDATE_PROJECT_TASK,
  DELETE_PROJECT_TASK,
  CREATE_PROJECT_MILESTONE,
  UPDATE_PROJECT_MILESTONE,
  DELETE_PROJECT_MILESTONE
} from './mutations';

// Users
export const useUsers = () => {
  return useQuery(GET_USERS);
};

export const useCreateUser = () => {
  const client = useApolloClient();
  return useMutation(CREATE_USER, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_USERS] });
    },
  });
};

export const useUpdateUser = () => {
  const client = useApolloClient();
  return useMutation(UPDATE_USER, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_USERS] });
    },
  });
};

export const useDeleteUser = () => {
  const client = useApolloClient();
  return useMutation(DELETE_USER, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_USERS, GET_PROJECTS] });
    },
  });
};

// Customers
export const useCustomers = () => {
  return useQuery(GET_CUSTOMERS);
};

export const useCreateCustomer = () => {
  const client = useApolloClient();
  return useMutation(CREATE_CUSTOMER, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_CUSTOMERS] });
    },
  });
};

export const useUpdateCustomer = () => {
  const client = useApolloClient();
  return useMutation(UPDATE_CUSTOMER, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_CUSTOMERS] });
    },
  });
};

export const useDeleteCustomer = () => {
  const client = useApolloClient();
  return useMutation(DELETE_CUSTOMER, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_CUSTOMERS, GET_PROJECTS] });
    },
  });
};

// Projects
export const useProjects = () => {
  return useQuery(GET_PROJECTS);
};

export const useCreateProject = () => {
  const client = useApolloClient();
  return useMutation(CREATE_PROJECT, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_PROJECTS] });
    },
  });
};

export const useUpdateProject = () => {
  const client = useApolloClient();
  return useMutation(UPDATE_PROJECT, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_PROJECTS] });
    },
  });
};

export const useDeleteProject = () => {
  const client = useApolloClient();
  return useMutation(DELETE_PROJECT, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_PROJECTS, GET_TIME_ENTRIES] });
    },
  });
};

// Project Members
export const useAddProjectMember = () => {
  const client = useApolloClient();
  return useMutation(ADD_PROJECT_MEMBER, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_PROJECTS] });
    },
  });
};

export const useRemoveProjectMember = () => {
  const client = useApolloClient();
  return useMutation(REMOVE_PROJECT_MEMBER, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_PROJECTS] });
    },
  });
};

// Task Types
export const useTaskTypes = () => {
  return useQuery(GET_TASK_TYPES);
};

export const useCreateTaskType = () => {
  const client = useApolloClient();
  return useMutation(CREATE_TASK_TYPE, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_TASK_TYPES] });
    },
  });
};

export const useUpdateTaskType = () => {
  const client = useApolloClient();
  return useMutation(UPDATE_TASK_TYPE, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_TASK_TYPES] });
    },
  });
};

export const useDeleteTaskType = () => {
  const client = useApolloClient();
  return useMutation(DELETE_TASK_TYPE, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_TASK_TYPES, GET_TIME_ENTRIES] });
    },
  });
};

// Divisions
export const useDivisions = () => {
  return useQuery(GET_DIVISIONS);
};

export const useCreateDivision = () => {
  const client = useApolloClient();
  return useMutation(CREATE_DIVISION, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_DIVISIONS] });
    },
  });
};

export const useUpdateDivision = () => {
  const client = useApolloClient();
  return useMutation(UPDATE_DIVISION, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_DIVISIONS] });
    },
  });
};

export const useDeleteDivision = () => {
  const client = useApolloClient();
  return useMutation(DELETE_DIVISION, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_DIVISIONS, GET_TIME_ENTRIES] });
    },
  });
};

// Time Entries
export const useTimeEntries = (where?: Record<string, unknown>) => {
  return useQuery(GET_TIME_ENTRIES, {
    variables: { where: where || {} },
  });
};

export const useFilteredTimeEntries = (filters: {
  startDate?: string;
  endDate?: string;
  userId?: string;
  projectId?: string;
  divisionId?: string;
}) => {
  return useQuery(GET_FILTERED_TIME_ENTRIES, {
    variables: {
      startDate: filters.startDate,
      endDate: filters.endDate,
    },
    skip: !filters.startDate || !filters.endDate,
  });
};

export const useCreateTimeEntry = () => {
  const client = useApolloClient();
  return useMutation(CREATE_TIME_ENTRY, {
    onCompleted: () => {
      client.refetchQueries({ 
        include: [
          GET_TIME_ENTRIES, 
          GET_FILTERED_TIME_ENTRIES, 
          GET_TEAM_STATS, 
          GET_USER_PERFORMANCE,
          GET_PROJECT_STATS
        ] 
      });
    },
  });
};

export const useUpdateTimeEntry = () => {
  const client = useApolloClient();
  return useMutation(UPDATE_TIME_ENTRY, {
    onCompleted: () => {
      client.refetchQueries({ 
        include: [
          GET_TIME_ENTRIES, 
          GET_FILTERED_TIME_ENTRIES, 
          GET_TEAM_STATS, 
          GET_USER_PERFORMANCE,
          GET_PROJECT_STATS
        ] 
      });
    },
  });
};

export const useDeleteTimeEntry = () => {
  const client = useApolloClient();
  return useMutation(DELETE_TIME_ENTRY, {
    onCompleted: () => {
      client.refetchQueries({ 
        include: [
          GET_TIME_ENTRIES, 
          GET_FILTERED_TIME_ENTRIES, 
          GET_TEAM_STATS, 
          GET_USER_PERFORMANCE,
          GET_PROJECT_STATS
        ] 
      });
    },
  });
};

// Special Days
export const useSpecialDays = () => {
  return useQuery(GET_SPECIAL_DAYS);
};

export const useCreateSpecialDay = () => {
  const client = useApolloClient();
  return useMutation(CREATE_SPECIAL_DAY, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_SPECIAL_DAYS] });
    },
  });
};

export const useUpdateSpecialDay = () => {
  const client = useApolloClient();
  return useMutation(UPDATE_SPECIAL_DAY, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_SPECIAL_DAYS] });
    },
  });
};

export const useDeleteSpecialDay = () => {
  const client = useApolloClient();
  return useMutation(DELETE_SPECIAL_DAY, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_SPECIAL_DAYS] });
    },
  });
};

// Dynamic Parameters
export const useDynamicParameters = () => {
  return useQuery(GET_DYNAMIC_PARAMETERS);
};

export const useUpdateDynamicParameter = () => {
  const client = useApolloClient();
  return useMutation(UPDATE_DYNAMIC_PARAMETER, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_DYNAMIC_PARAMETERS] });
    },
  });
};

export const useCreateDynamicParameter = () => {
  const client = useApolloClient();
  return useMutation(CREATE_DYNAMIC_PARAMETER, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_DYNAMIC_PARAMETERS] });
    },
  });
};

// Team Management Hooks
export const useTeamMembers = () => {
  return useQuery(GET_TEAM_MEMBERS);
};

export const useTeamStats = () => {
  return useQuery(GET_TEAM_STATS);
};

export const useDepartmentsOverview = () => {
  return useQuery(GET_DEPARTMENTS_OVERVIEW);
};

export const useUserPerformance = (userId: string, startDate: string, endDate: string) => {
  return useQuery(GET_USER_PERFORMANCE, {
    variables: { userId, startDate, endDate },
    skip: !userId || !startDate || !endDate
  });
};

export const useUserProjects = (userId: string) => {
  return useQuery(GET_USER_PROJECTS, {
    variables: { userId },
    skip: !userId
  });
};

export const useTeamMemberById = (id: string) => {
  return useQuery(GET_TEAM_MEMBER_BY_ID, {
    variables: { id },
    skip: !id
  });
};

export const useLazyTeamMemberById = () => {
  return useLazyQuery(GET_TEAM_MEMBER_BY_ID);
};

// Team Management Mutations
export const useCreateTeamMember = () => {
  return useMutation(CREATE_TEAM_MEMBER, {
    refetchQueries: [{ query: GET_TEAM_MEMBERS }]
  });
};

export const useUpdateTeamMember = () => {
  return useMutation(UPDATE_TEAM_MEMBER, {
    refetchQueries: [{ query: GET_TEAM_MEMBERS }]
  });
};

export const useDeleteTeamMember = () => {
  return useMutation(DELETE_TEAM_MEMBER, {
    refetchQueries: [{ query: GET_TEAM_MEMBERS }]
  });
};

export const useCreateUserPerformance = () => {
  return useMutation(CREATE_USER_PERFORMANCE, {
    refetchQueries: [{ query: GET_TEAM_STATS }]
  });
};

export const useUpdateUserPerformance = () => {
  return useMutation(UPDATE_USER_PERFORMANCE, {
    refetchQueries: [{ query: GET_TEAM_STATS }]
  });
};

export const useAddUserToProject = () => {
  return useMutation(ADD_USER_TO_PROJECT, {
    refetchQueries: [{ query: GET_TEAM_MEMBERS }]
  });
};

export const useRemoveUserFromProject = () => {
  return useMutation(REMOVE_USER_FROM_PROJECT, {
    refetchQueries: [{ query: GET_TEAM_MEMBERS }]
  });
};

export const useUpdateProjectMemberRole = () => {
  return useMutation(UPDATE_PROJECT_MEMBER_ROLE, {
    refetchQueries: [{ query: GET_TEAM_MEMBERS }]
  });
};

// Project Tasks
export const useProjectTasks = (projectId: string) => {
  return useQuery(GET_PROJECT_TASKS, {
    variables: { projectId }
  });
};

export const useCreateProjectTask = () => {
  const client = useApolloClient();
  return useMutation(CREATE_PROJECT_TASK, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_PROJECT_TASKS, GET_PROJECTS] });
    },
  });
};

export const useUpdateProjectTask = () => {
  const client = useApolloClient();
  return useMutation(UPDATE_PROJECT_TASK, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_PROJECT_TASKS, GET_PROJECTS] });
    },
  });
};

export const useDeleteProjectTask = () => {
  const client = useApolloClient();
  return useMutation(DELETE_PROJECT_TASK, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_PROJECT_TASKS, GET_PROJECTS] });
    },
  });
};

// Project Milestones
export const useProjectMilestones = (projectId: string) => {
  return useQuery(GET_PROJECT_MILESTONES, {
    variables: { projectId }
  });
};

export const useCreateProjectMilestone = () => {
  const client = useApolloClient();
  return useMutation(CREATE_PROJECT_MILESTONE, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_PROJECT_MILESTONES, GET_PROJECTS] });
    },
  });
};

export const useUpdateProjectMilestone = () => {
  const client = useApolloClient();
  return useMutation(UPDATE_PROJECT_MILESTONE, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_PROJECT_MILESTONES, GET_PROJECTS] });
    },
  });
};

export const useDeleteProjectMilestone = () => {
  const client = useApolloClient();
  return useMutation(DELETE_PROJECT_MILESTONE, {
    onCompleted: () => {
      client.refetchQueries({ include: [GET_PROJECT_MILESTONES, GET_PROJECTS] });
    },
  });
};

// Project Tasks - All Tasks
export const useAllProjectTasks = () => {
  return useQuery(GET_ALL_PROJECT_TASKS);
};

// Project Tasks - User Tasks
export const useUserProjectTasks = (userId?: string) => {
  return useQuery(GET_USER_PROJECT_TASKS, {
    variables: { userId },
    skip: !userId,
  });
};
