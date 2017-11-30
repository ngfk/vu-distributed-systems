import { GridActionMap, gridActionCreators } from './grid.actions';

// Combine action maps by extending them
export interface ActionMap extends GridActionMap {}

// Combine action creators using spread operator
export const actionCreators = {
    ...gridActionCreators
};

export type ActionCreators = typeof actionCreators;
