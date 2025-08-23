import React, { createContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import { appReducer, type AppAction, type AppState } from './appReducer';
import { getCurrentDate, getDateNDaysAgo } from '../utils/helpers';

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {
    filters: {
      startDate: getDateNDaysAgo(30),
      endDate: getCurrentDate(),
      assigneeId: '',
      customerId: '',
      projectId: '',
      divisionId: '',
    }
  });

  const value: AppContextType = {
    state,
    dispatch,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};


