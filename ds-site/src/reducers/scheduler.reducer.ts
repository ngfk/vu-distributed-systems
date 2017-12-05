import { ReducerBuilder } from '@ngfk/ts-redux';

import { SchedulerActionMap } from '../actions/scheduler.actions';
import { Schedulers } from '../models/scheduler';

const initial: Schedulers = {};

export const schedulerReducer = new ReducerBuilder<
    Schedulers,
    SchedulerActionMap
>()
    .init(initial)
    .case('SCHEDULER_INIT', (state, payload) =>
        payload.reduce(
            (acc, id) => ({
                ...acc,
                [id]: { id, isDown: false, jobCount: 0 }
            }),
            {} as Schedulers
        )
    )
    .case('SCHEDULER_TOGGLE', (state, payload) => {
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
    .case('SCHEDULER_JOBS', (state, payload) => ({
        ...state,
        [payload.id]: {
            ...state[payload.id],
            jobCount: payload.jobCount
        }
    }))
    .build();
