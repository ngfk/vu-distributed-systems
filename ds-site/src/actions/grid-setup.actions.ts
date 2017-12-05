import { ActionFactory } from '@ngfk/ts-redux';

import { GridSetup, GridSetupParams } from '../models/grid-setup';

export interface GridSetupActionMap {
    GRID_INIT: GridSetupParams;
    GRID_SETUP: GridSetup;
}

const factory = new ActionFactory<GridSetupActionMap>();

export const gridSetupActionCreators = {
    gridInit: factory.creator('GRID_INIT'),
    gridSetup: factory.creator('GRID_SETUP')
};

export type GridSetupActionCreators = typeof gridSetupActionCreators;
