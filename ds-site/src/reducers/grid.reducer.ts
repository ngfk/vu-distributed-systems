import { createReducer } from '@ngfk/ts-redux';

import { GridActionMap } from '../actions/grid.actions';
import { Cluster, Grid, Scheduler, Worker } from '../models/grid';
import { adjustNode } from '../utils/grid-adjuster';

const initial: Grid = {
    user: '',
    schedulerJobs: 0,
    schedulers: [],
    clusters: []
};

export const gridReducer = createReducer<Grid, GridActionMap>(initial, {
    GRID_INIT: (state, payload) => {
        const schedulers: Scheduler[] = [];
        for (let s = 0; s < payload.schedulers; s++) {
            schedulers.push({
                id: 's' + s,
                jobCount: 0,
                isDown: false
            });
        }

        const clusters: Cluster[] = [];
        for (let c = 0; c < payload.clusters; c++) {
            const workers: Worker[] = [];
            for (let w = 0; w < payload.workers; w++) {
                workers.push({
                    id: 'c' + c + 'w' + w,
                    jobCount: 0,
                    isDown: false
                });
            }

            clusters.push({
                resourceManager: {
                    id: 'c' + c,
                    jobCount: 0,
                    isDown: false
                },
                workers
            });
        }

        return {
            user: 'u',
            schedulerJobs: 0,
            schedulers,
            clusters
        };
    },
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
