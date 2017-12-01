import { NodeState, NodeType } from '../models/node';

import { ActionFactory } from '@ngfk/ts-redux';
import { GridSetup } from '../models/grid';

export interface GridActionMap {
    GRID_SETUP: GridSetup;
    GRID_TOGGLE: { id: number; type: NodeType; state: NodeState };
}

const factory = new ActionFactory<GridActionMap>();

export const gridActionCreators = {
    gridInit: factory.creator('GRID_SETUP'),
    gridToggle: factory.creator('GRID_TOGGLE')
};

export type GridActionCreators = typeof gridActionCreators;
