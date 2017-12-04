import { ActionFactory } from '@ngfk/ts-redux';

import { GridSetup } from '../models/grid';
import { NodeType } from '../models/node';

export interface GridActionMap {
    GRID_INIT: { schedulers: number; clusters: number; workers: number };
    GRID_SETUP: GridSetup;
    GRID_QUEUE: { id: string; type: NodeType; jobs: number };
    GRID_START: void;
    GRID_STOP: void;
    GRID_TOGGLE: { id: string; type: NodeType };
}

const factory = new ActionFactory<GridActionMap>();

export const gridActionCreators = {
    gridInit: factory.creator('GRID_INIT'),
    gridStart: factory.creator('GRID_START'),
    gridStop: factory.creator('GRID_STOP'),
    gridToggle: factory.creator('GRID_TOGGLE')
};

export type GridActionCreators = typeof gridActionCreators;
