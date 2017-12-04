import { createReducer } from '@ngfk/ts-redux';

import { GridActionMap } from '../actions/grid.actions';
import { Cluster, Grid, Scheduler } from '../models/grid';
import { adjustNode } from '../utils/grid-adjuster';

const initial: Grid = {
    user: 'f9391477-16b2-5e31-9b30-d3483c9a0607',
    schedulerJobs: 6,
    schedulers: [
        {
            id: '0df164f4-feee-511e-859d-b2b0d35c31a2',
            isDown: false,
            jobCount: 2
        },
        {
            id: '382e60e7-5e8e-54bb-a403-1e447a0443a0',
            isDown: false,
            jobCount: 0
        },
        {
            id: 'b675ef6e-1546-527a-98ec-7d8c73292294',
            isDown: false,
            jobCount: 0
        },
        {
            id: '0881fd93-bb79-5f62-bc34-3add5b92952f',
            isDown: false,
            jobCount: 0
        },
        {
            id: '8d1fbca8-381f-5b8e-bd0c-617677688040',
            isDown: false,
            jobCount: 0
        }
    ],
    clusters: [
        {
            resourceManager: {
                id: 'f688d367-1126-5b64-bce4-4ff699de0bb3',
                isDown: false,
                jobCount: 4
            },
            workers: [
                {
                    id: '7020eb53-4f19-5b50-9bec-70a508513216',
                    isDown: false,
                    jobCount: 0
                }
            ]
        },
        {
            resourceManager: {
                id: 'dc172a37-a024-59ab-bbb1-c6fbe9cf60b6',
                isDown: true,
                jobCount: 4
            },
            workers: [
                {
                    id: '75c55640-8c36-5c5a-826e-0286777ff204',
                    isDown: false,
                    jobCount: 0
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
            isDown: false,
            jobCount: 0
        }));

        const clusters: Cluster[] = payload.clusters.map(gcs => ({
            resourceManager: {
                id: gcs.resourceManager,
                isDown: false,
                jobCount: 0
            },
            workers: gcs.workers.map(id => ({
                id,
                isDown: false,
                jobCount: 0
            }))
        }));

        return {
            user: payload.user,
            schedulerJobs: 0,
            schedulers,
            clusters
        };
    },
    GRID_QUEUE: (state, payload) => {
        return adjustNode(state, payload.id, payload.type, node => {
            if (node.isDown === true) {
                return node;
            }

            return {
                ...node,
                jobCount: payload.jobs
            };
        });
    },
    GRID_START: state => state,
    GRID_STOP: state => state,
    GRID_TOGGLE: (state, payload) => {
        return adjustNode(state, payload.id, payload.type, node => {
            return { ...node, isDown: !node.isDown };
        });
    }
});
