import { combineReducers } from '@ngfk/ts-redux';

import { Grid } from '../models/grid';
import { gridReducer } from './grid.reducer';

export interface State {
    readonly grid: Grid;
}

export const reducer = combineReducers<State>({
    grid: gridReducer
});
