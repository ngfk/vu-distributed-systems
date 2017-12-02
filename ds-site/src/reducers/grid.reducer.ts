import { createReducer } from '@ngfk/ts-redux';

import { GridActionMap } from '../actions/grid.actions';
import { Cluster, Grid, Scheduler } from '../models/grid';
import { NodeState } from '../models/node';
import { adjustNode } from '../utils/grid-adjuster';

const initial: Grid = {
    user: 2,
    schedulerJobs: 0,
    schedulers: [{ id: 6, state: NodeState.Online }],
    clusters: [
        {
            resourceManager: { id: 5, state: NodeState.Online, jobs: 4 },
            workers: [{ id: 2, state: NodeState.Online }]
        }
    ]
};

export const gridReducer = createReducer<Grid, GridActionMap>(initial, {
    GRID_INIT: state => state,
    GRID_SETUP: (state, payload) => {
        const schedulers: Scheduler[] = payload.schedulers.map(id => ({
            id,
            state: NodeState.Online
        }));

        const clusters: Cluster[] = payload.clusters.map(gcs => ({
            resourceManager: {
                id: gcs.resourceManager,
                state: NodeState.Online,
                jobs: 0
            },
            workers: gcs.workers.map(id => ({
                id,
                state: NodeState.Online
            }))
        }));

        return {
            user: payload.user,
            schedulerJobs: 0,
            schedulers,
            clusters
        };
    },
    GRID_STATE: (state, payload) => {
        return adjustNode(state, payload.id, payload.type, node => ({
            ...node,
            state: payload.state
        }));
    },
    GRID_STOP: state => state,
    GRID_TOGGLE: (state, payload) => {
        return adjustNode(state, payload.id, payload.type, node => {
            const nodeState =
                node.state === NodeState.Offline
                    ? NodeState.Online
                    : NodeState.Offline;

            return { ...node, state: nodeState };
        });
    }
});
