// === Core Entity Types ===

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Member';
  status: 'Active' | 'Inactive';
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  name: string;
  customer_id: string;
  pm_id: string;
  is_billable: boolean;
  created_at?: string;
  updated_at?: string;
  // Enhanced fields
  description?: string;
  status?: string;
  priority?: string;
  progress?: number;
  budget?: number;
  spent?: number;
  technologies?: string[];
  start_date?: string;
  end_date?: string;
  // GraphQL relationships
  customer?: Customer;
  project_manager?: User;
  project_members?: ProjectMember[];
}

export interface ProjectDashboard {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority?: string;
  progress: number;
  budget: number;
  spent: number;
  remaining_budget: number;
  budget_usage_percentage: number;
  start_date?: string;
  end_date?: string;
  customer_name?: string;
  manager_name?: string;
  manager_email?: string;
  team_size: number;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  total_milestones: number;
  completed_milestones: number;
  total_hours: number;
  billable_hours: number;
  health_status: 'on_track' | 'normal' | 'at_risk' | 'critical' | 'on_hold' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  created_at?: string;
  user?: User;
  project?: Project;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  assigned_user?: User;
  project?: Project;
}

export interface TaskType {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Division {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimeEntry {
  id: string;
  date: string;
  effort: number;
  description: string;
  is_billable: boolean;
  user_id: string;
  project_id: string;
  task_type_id: string;
  division_id: string;
  created_at?: string;
  updated_at?: string;
  // GraphQL relationships
  user?: User;
  project?: Project;
  task_type?: TaskType;
  division?: Division;
}

export interface SpecialDay {
  id: string;
  date: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface DynamicParameter {
  id: string;
  key: string;
  value: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// === UI State Types ===

export interface FilterState {
  startDate: string;
  endDate: string;
  assigneeId: string;
  customerId: string;
  projectId: string;
  divisionId: string;
}

export interface ReportFilters {
  reportType: 'effortByProject' | 'effortByAssignee';
  startDate: string;
  endDate: string;
  projectId?: string;
}

export interface ChartData {
  label: string;
  value: number;
  color: string;
}

// === Form Types ===

export interface NewTimeEntryForm {
  description: string;
  customerId: string;
  projectId: string;
  taskId: string;
  divisionId: string;
  typeId: string;
  userId: string;
  date: string;
  effort: number;
  isBillable: boolean;
}

export interface DynamicParameters {
  maxDailyEffort: number;
  retroactiveEntryLimit: number;
}

// === Navigation Types ===

export type PageId = 'entries' | 'web_list' | 'new_entry' | 'reports' | 'admin';
export type AdminSection = 'test' | 'users' | 'customers' | 'projects' | 'task_types' | 'divisions' | 'special_days' | 'parameters';

// === Language Types ===

export type Language = 'en' | 'tr';

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// === Action Types for State Management ===

export interface AppState {
  users: User[];
  customers: Customer[];
  projects: Project[];
  taskTypes: TaskType[];
  divisions: Division[];
  timeEntries: TimeEntry[];
  specialDays: SpecialDay[];
  filters: FilterState;
  dynamicParameters: DynamicParameters;
}

export type AppAction =
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_TASK_TYPES'; payload: TaskType[] }
  | { type: 'ADD_TASK_TYPE'; payload: TaskType }
  | { type: 'UPDATE_TASK_TYPE'; payload: TaskType }
  | { type: 'DELETE_TASK_TYPE'; payload: string }
  | { type: 'SET_DIVISIONS'; payload: Division[] }
  | { type: 'ADD_DIVISION'; payload: Division }
  | { type: 'UPDATE_DIVISION'; payload: Division }
  | { type: 'DELETE_DIVISION'; payload: string }
  | { type: 'SET_TIME_ENTRIES'; payload: TimeEntry[] }
  | { type: 'ADD_TIME_ENTRY'; payload: TimeEntry }
  | { type: 'UPDATE_TIME_ENTRY'; payload: TimeEntry }
  | { type: 'DELETE_TIME_ENTRY'; payload: string }
  | { type: 'SET_SPECIAL_DAYS'; payload: SpecialDay[] }
  | { type: 'ADD_SPECIAL_DAY'; payload: SpecialDay }
  | { type: 'UPDATE_SPECIAL_DAY'; payload: SpecialDay }
  | { type: 'DELETE_SPECIAL_DAY'; payload: string }
  | { type: 'UPDATE_FILTERS'; payload: Partial<FilterState> }
  | { type: 'UPDATE_DYNAMIC_PARAMETERS'; payload: DynamicParameters };

// === Component Props Types ===

export interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface AdminNavItem {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}
