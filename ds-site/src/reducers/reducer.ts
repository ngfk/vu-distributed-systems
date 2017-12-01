import { Grid } from '../models/grid';
import { combineReducers } from '@ngfk/ts-redux';
import { gridReducer } from './grid.reducer';

export interface State {
    readonly grid: Grid;
}

export const reducer = combineReducers<State>({
    grid: gridReducer
});
