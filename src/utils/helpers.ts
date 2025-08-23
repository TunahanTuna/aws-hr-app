import type { 
  User, 
  Customer, 
  Project, 
  TimeEntry,
  ChartData 
} from '../types';

// === Generic helper functions ===

export const findById = <T extends { id: string }>(arr: T[] | undefined, id: string): T | undefined => {
  if (!arr || !Array.isArray(arr)) return undefined;
  return arr.find(item => item.id === id);
};

export const findByIdOrEmpty = <T extends { id: string }>(arr: T[] | undefined, id: string): Partial<T> => {
  return findById(arr, id) || {} as Partial<T>;
};

// === Date helpers ===

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-CA');
};

export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getDateNDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

export const isDateInRange = (date: string, startDate: string, endDate: string): boolean => {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return checkDate >= start && checkDate <= end;
};

// === Validation helpers ===

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isPositiveNumber = (value: number): boolean => {
  return value > 0;
};

export const isValidEffort = (effort: number): boolean => {
  return effort > 0 && effort <= 24; // Max 24 hours per day
};

// === Data transformation helpers ===

export const getProjectsForCustomer = (projects: Project[], customerId: string): Project[] => {
  return projects.filter(project => project.customer_id === customerId);
};

export const getTimeEntriesForUser = (entries: TimeEntry[], userId: string): TimeEntry[] => {
  return entries.filter(entry => entry.user_id === userId);
};

export const getTimeEntriesForProject = (entries: TimeEntry[], projectId: string): TimeEntry[] => {
  return entries.filter(entry => entry.project_id === projectId);
};

export const getTimeEntriesForDateRange = (
  entries: TimeEntry[], 
  startDate: string, 
  endDate: string
): TimeEntry[] => {
  return entries.filter(entry => isDateInRange(entry.date, startDate, endDate));
};

// === Calculation helpers ===

export const calculateTotalEffort = (entries: TimeEntry[]): number => {
  return entries.reduce((total, entry) => total + entry.effort, 0);
};

export const calculateBillableEffort = (entries: TimeEntry[]): number => {
  return entries
    .filter(entry => entry.is_billable)
    .reduce((total, entry) => total + entry.effort, 0);
};

export const calculateNonBillableEffort = (entries: TimeEntry[]): number => {
  return entries
    .filter(entry => !entry.is_billable)
    .reduce((total, entry) => total + entry.effort, 0);
};

// === Chart data helpers ===

export const generateProjectEffortData = (
  entries: TimeEntry[],
  projects: Project[],
  customers: Customer[]
): ChartData[] => {
  const projectEffortMap = new Map<string, number>();
  
  entries.forEach(entry => {
    const currentEffort = projectEffortMap.get(entry.project_id) || 0;
    projectEffortMap.set(entry.project_id, currentEffort + entry.effort);
  });

  const colors = ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f87171', '#fb923c'];
  let colorIndex = 0;

  return Array.from(projectEffortMap.entries()).map(([projectId, effort]) => {
    const project = findById(projects, projectId);
    const customer = project ? findById(customers, project.customer_id) : undefined;
    const label = project ? `${customer?.name || 'Unknown'} - ${project.name}` : 'Unknown Project';
    
    return {
      label,
      value: effort,
      color: colors[colorIndex++ % colors.length],
    };
  });
};

export const generateAssigneeEffortData = (
  entries: TimeEntry[],
  users: User[]
): ChartData[] => {
  const userEffortMap = new Map<string, number>();
  
  entries.forEach(entry => {
    const currentEffort = userEffortMap.get(entry.user_id) || 0;
    userEffortMap.set(entry.user_id, currentEffort + entry.effort);
  });

  const colors = ['#f87171', '#4ade80', '#fb923c', '#60a5fa', '#a78bfa', '#fbbf24'];
  let colorIndex = 0;

  return Array.from(userEffortMap.entries()).map(([userId, effort]) => {
    const user = findById(users, userId);
    const label = user ? user.name : 'Unknown User';
    
    return {
      label,
      value: effort,
      color: colors[colorIndex++ % colors.length],
    };
  });
};

// === ID generation ===

export const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// === Form helpers ===

export const resetForm = (formElement: HTMLFormElement): void => {
  formElement.reset();
};

export const getFormData = (formElement: HTMLFormElement): FormData => {
  return new FormData(formElement);
};

// === Local storage helpers ===

export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// === Array helpers ===

export const sortByDate = <T extends { date: string }>(arr: T[], ascending: boolean = true): T[] => {
  return [...arr].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const sortByName = <T extends { name: string }>(arr: T[], ascending: boolean = true): T[] => {
  return [...arr].sort((a, b) => {
    return ascending 
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  });
};

export const groupBy = <T, K extends keyof T>(arr: T[], key: K): Map<T[K], T[]> => {
  return arr.reduce((groups, item) => {
    const value = item[key];
    const group = groups.get(value) || [];
    group.push(item);
    groups.set(value, group);
    return groups;
  }, new Map<T[K], T[]>());
};
