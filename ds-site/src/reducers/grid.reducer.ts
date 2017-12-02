import { createReducer } from '@ngfk/ts-redux';

import { GridActionMap } from '../actions/grid.actions';
import { Cluster, Grid, Scheduler } from '../models/grid';
import { NodeState, NodeType } from '../models/node';

const initial: Grid = {
    user: 0,
    schedulers: [{ id: 6, state: NodeState.Online, jobs: 4 }],
    clusters: [
        {
            resourceManager: { id: 5, state: NodeState.Online },
            workers: [{ id: 2, state: NodeState.Online }]
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
                state: NodeState.Online
            },
            workers: gcs.workers.map(id => ({
                id,
                state: NodeState.Online
            }))
        }));

        return {
            user: payload.user,
            schedulers,
            clusters
        };
    },
    GRID_STATE: (state, payload) => {
        switch (payload.type) {
            case NodeType.Scheduler: {
                const schedulers = state.schedulers.map(scheduler => {
                    if (scheduler.id === payload.id)
                        return { ...scheduler, state: payload.state };

                    return scheduler;
                });

                return { ...state, schedulers };
            }
            case NodeType.ResourceManager: {
                const clusters = state.clusters.map(cluster => {
                    if (cluster.resourceManager.id === payload.id) {
                        const resourceManager = {
                            ...cluster.resourceManager,
                            state: payload.state
                        };

                        return { ...cluster, resourceManager };
                    }

                    return cluster;
                });

                return { ...state, clusters };
            }
            case NodeType.Worker: {
                const clusters = state.clusters.map(cluster => {
                    const workers = cluster.workers.map(worker => {
                        if (worker.id === payload.id)
                            return { ...worker, state: payload.state };

                        return worker;
                    });

                    return { ...cluster, workers };
                });

                return { ...state, clusters };
            }
            default:
                return state;
        }
    },
    GRID_STOP: state => state,
    GRID_TOGGLE: (state, payload) => {
        switch (payload.type) {
            case NodeType.Scheduler:
                const schedulers = state.schedulers.map(scheduler => {
                    if (scheduler.id === payload.id) {
                        const nodeState =
                            scheduler.state === NodeState.Offline
                                ? NodeState.Online
                                : NodeState.Offline;

                        return { ...scheduler, state: nodeState };
                    }

                    return scheduler;
                });

                return { ...state, schedulers };
            case NodeType.ResourceManager: {
                const clusters = state.clusters.map(cluster => {
                    if (cluster.resourceManager.id === payload.id) {
                        const nodeState =
                            cluster.resourceManager.state === NodeState.Offline
                                ? NodeState.Online
                                : NodeState.Offline;

                        const resourceManager = {
                            ...cluster.resourceManager,
                            state: nodeState
                        };

                        return { ...cluster, resourceManager };
                    }

                    return cluster;
                });

                return { ...state, clusters };
            }
            case NodeType.Worker: {
                const clusters = state.clusters.map(cluster => {
                    const workers = cluster.workers.map(worker => {
                        if (worker.id === payload.id) {
                            const nodeState =
                                worker.state === NodeState.Offline
                                    ? NodeState.Online
                                    : NodeState.Offline;
                            return { ...worker, state: nodeState };
                        }
                        return worker;
                    });

                    return { ...cluster, workers };
                });

                return { ...state, clusters };
            }

            default:
                return state;
        }
    }
});
