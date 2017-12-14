import { Reducer, ReducerBuilder } from '@ngfk/ts-redux';

import { WorkerActionMap } from '../actions/worker.actions';
import { Workers } from '../models/worker';

const initial: Workers = {};

export const workerReducer: Reducer<Workers> = new ReducerBuilder<
    Workers,
    WorkerActionMap
>()
    .init(initial)
    .case('WORKER_INIT', (state, payload) =>
        payload.reduce(
            (acc, id) => ({
                ...acc,
                [id]: { id, isDown: false, jobCount: 0 }
            }),
            {} as Workers
        )
    )
    .case('WORKER_TOGGLE', (state, payload) => {
        const worker = state[payload.id];
        if (!worker) return state;

        return {
            ...state,
            [payload.id]: {
                ...worker,
                isDown: !worker.isDown
            }
        };
    })
    .case('WORKER_JOBS', (state, payload) => ({
        ...state,
        [payload.id]: {
            ...state[payload.id],
            jobCount: payload.jobCount
        }
    }))
    .build();
