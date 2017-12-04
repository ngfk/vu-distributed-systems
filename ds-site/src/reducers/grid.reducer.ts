import { createReducer } from '@ngfk/ts-redux';

import { GridActionMap } from '../actions/grid.actions';
import { Cluster, Grid, Scheduler, Worker } from '../models/grid';
import { NodeState } from '../models/node';
import { adjustNode } from '../utils/grid-adjuster';
import { uuid } from '../utils/uuid';

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
                id: uuid(),
                state: NodeState.Online,
                jobs: 0
            });
        }

        const clusters: Cluster[] = [];
        for (let c = 0; c < payload.clusters; c++) {
            const workers: Worker[] = [];
            for (let w = 0; w < payload.workers; w++) {
                workers.push({
                    id: uuid(),
                    state: NodeState.Online,
                    jobs: 0
                });
            }

            clusters.push({
                resourceManager: {
                    id: uuid(),
                    state: NodeState.Online,
                    jobs: 0
                },
                workers
            });
        }

        return {
            user: uuid(),
            schedulerJobs: 0,
            schedulers,
            clusters
        };
    },
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
