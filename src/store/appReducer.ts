import type { FilterState } from '../types';

export interface AppState {
  filters: FilterState;
}

export type AppAction = 
  | { type: 'UPDATE_FILTERS'; payload: Partial<FilterState> };

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};
