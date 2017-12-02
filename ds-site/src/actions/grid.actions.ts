import { ActionFactory } from '@ngfk/ts-redux';

import { GridSetup } from '../models/grid';
import { NodeState, NodeType } from '../models/node';

export interface GridActionMap {
    GRID_INIT: { schedulers: number; clusters: number; workers: number };
    GRID_SETUP: GridSetup;
    GRID_STATE: { id: number; type: NodeType; state: NodeState };
    GRID_STOP: void;
    GRID_TOGGLE: { id: number; type: NodeType };
}

const factory = new ActionFactory<GridActionMap>();

export const gridActionCreators = {
    gridInit: factory.creator('GRID_INIT'),
    gridSetup: factory.creator('GRID_SETUP'),
    gridState: factory.creator('GRID_STATE'),
    gridStop: factory.creator('GRID_STOP'),
    gridToggle: factory.creator('GRID_TOGGLE')
};

export type GridActionCreators = typeof gridActionCreators;
