import { Reducer, ReducerBuilder } from '@ngfk/ts-redux';

import { ResourceManagerActionMap } from '../actions/resource-manager.actions';
import { ResourceManagers } from '../models/resource-manager';

const initial: ResourceManagers = {};

export const resourceManagerReducer: Reducer<
    ResourceManagers
> = new ReducerBuilder<ResourceManagers, ResourceManagerActionMap>()
    .init(initial)
    .case('RESOURCE_MANAGER_INIT', (_, payload) =>
        payload.reduce(
            (acc, id) => ({
                ...acc,
                [id]: { id, isDown: false, jobCount: 0 }
            }),
            {} as ResourceManagers
        )
    )
    .case('RESOURCE_MANAGER_TOGGLE', (state, payload) => {
        const resourceManager = state[payload.id];
        if (!resourceManager) return state;

        return {
            ...state,
            [payload.id]: {
                ...resourceManager,
                isDown: !resourceManager.isDown
            }
        };
    })
    .case('RESOURCE_MANAGER_JOBS', (state, payload) => ({
        ...state,
        [payload.id]: {
            ...state[payload.id],
            jobCount: payload.jobCount
        }
    }))
    .build();
