import { ActionFactory } from '@ngfk/ts-redux';

import { GridSetupParams } from '../models/grid-setup';

export interface GridActionMap {
    GRID_START: GridSetupParams;
    GRID_STOP: void;
}

const factory = new ActionFactory<GridActionMap>();

export const gridActionCreators = {
    gridStart: factory.creator('GRID_START'),
    gridStop: factory.creator('GRID_STOP')
};

export type GridActionCreators = typeof gridActionCreators;
