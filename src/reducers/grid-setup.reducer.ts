import { createReducer, Reducer } from '@ngfk/ts-redux';

import { GridSetupActionMap } from '../actions/grid-setup.actions';
import { GridClusterSetup, GridSetup } from '../models/grid-setup';

const initial: GridSetup = {
    user: '0',
    schedulers: [],
    clusters: []
};

export const gridSetupReducer: Reducer<GridSetup> = createReducer<
    GridSetup,
    GridSetupActionMap
>(initial, {
    GRID_INIT: (state, payload) => {
        const user = '0';

        const schedulers: string[] = [];
        for (let s = 0; s < payload.schedulers; s++) {
            schedulers.push('s' + s);
        }

        const clusters: GridClusterSetup[] = [];
        for (let c = 0; c < payload.clusters; c++) {
            const resourceManager = 'c' + c;
            const workers: string[] = [];
            for (let w = 0; w < payload.workers; w++) {
                workers.push('c' + c + 'w' + w);
            }
            clusters.push({ resourceManager, workers });
        }

        return { user, schedulers, clusters };
    },
    GRID_SETUP: (_, payload) => payload
});
