import { createReducer } from '@ngfk/ts-redux';

import { GridActionMap } from '../actions/grid.actions';
import { Cluster, Grid, Scheduler } from '../models/grid';
import { NodeState } from '../models/node';
import { adjustNode } from '../utils/grid-adjuster';

const initial: Grid = {
    user: 'f9391477-16b2-5e31-9b30-d3483c9a0607',
    schedulerJobs: 6,
    schedulers: [
        {
            id: '0df164f4-feee-511e-859d-b2b0d35c31a2',
            state: NodeState.Busy,
            jobs: 2
        },
        {
            id: '382e60e7-5e8e-54bb-a403-1e447a0443a0',
            state: NodeState.Online,
            jobs: 0
        },
        {
            id: 'b675ef6e-1546-527a-98ec-7d8c73292294',
            state: NodeState.Online,
            jobs: 0
        },
        {
            id: '0881fd93-bb79-5f62-bc34-3add5b92952f',
            state: NodeState.Online,
            jobs: 0
        },
        {
            id: '8d1fbca8-381f-5b8e-bd0c-617677688040',
            state: NodeState.Online,
            jobs: 0
        }
    ],
    clusters: [
        {
            resourceManager: {
                id: 'f688d367-1126-5b64-bce4-4ff699de0bb3',
                state: NodeState.Online,
                jobs: 4
            },
            workers: [
                {
                    id: '7020eb53-4f19-5b50-9bec-70a508513216',
                    state: NodeState.Online,
                    jobs: 0
                }
            ]
        },
        {
            resourceManager: {
                id: 'dc172a37-a024-59ab-bbb1-c6fbe9cf60b6',
                state: NodeState.Offline,
                jobs: 4
            },
            workers: [
                {
                    id: '75c55640-8c36-5c5a-826e-0286777ff204',
                    state: NodeState.Online,
                    jobs: 0
                }
            ]
        }
    ]
};

export const gridReducer = createReducer<Grid, GridActionMap>(initial, {
    GRID_INIT: state => state,
    GRID_SETUP: (state, payload) => {
        const schedulers: Scheduler[] = payload.schedulers.map(id => ({
            id,
            state: NodeState.Online,
            jobs: 0
        }));

        const clusters: Cluster[] = payload.clusters.map(gcs => ({
            resourceManager: {
                id: gcs.resourceManager,
                state: NodeState.Online,
                jobs: 0
            },
            workers: gcs.workers.map(id => ({
                id,
                state: NodeState.Online,
                jobs: 0
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
    GRID_QUEUE: (state, payload) => {
        return adjustNode(state, payload.id, payload.type, node => {
            if (
                node.state === NodeState.Offline ||
                node.state === NodeState.Unreachable
            ) {
                return node;
            }

            const nodeState = node.jobs > 0 ? NodeState.Busy : NodeState.Online;
            return {
                ...node,
                state: nodeState,
                jobs: payload.jobs
            };
        });
    },
    GRID_START: state => state,
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
