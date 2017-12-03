import { ActionFactory } from '@ngfk/ts-redux';

import { GridSetup } from '../models/grid';
import { NodeState, NodeType } from '../models/node';

export interface GridActionMap {
    GRID_INIT: { schedulers: number; clusters: number; workers: number };
    GRID_SETUP: GridSetup;
    GRID_STATE: { id: string; type: NodeType; state: NodeState };
    GRID_QUEUE: { id: string; type: NodeType; jobs: number };
    GRID_STOP: void;
    GRID_TOGGLE: { id: string; type: NodeType };
}

const factory = new ActionFactory<GridActionMap>();

export const gridActionCreators = {
    gridInit: factory.creator('GRID_INIT'),
    gridStop: factory.creator('GRID_STOP'),
    gridToggle: factory.creator('GRID_TOGGLE')
};

export type GridActionCreators = typeof gridActionCreators;
