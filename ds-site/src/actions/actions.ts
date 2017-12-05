import {
    gridSetupActionCreators,
    GridSetupActionMap
} from './grid-setup.actions';
import { gridActionCreators, GridActionMap } from './grid.actions';
import {
    resourceManagerActionCreators,
    ResourceManagerActionMap
} from './resource-manager.actions';
import {
    schedulerActionCreators,
    SchedulerActionMap
} from './scheduler.actions';
import { userActionCreators, UserActionMap } from './user.actions';
import { workerActionCreators, WorkerActionMap } from './worker.actions';

// Combine action maps by extending them
export interface ActionMap
    extends GridActionMap,
        GridSetupActionMap,
        UserActionMap,
        SchedulerActionMap,
        ResourceManagerActionMap,
        WorkerActionMap {}

// Combine action creators using spread operator
export const actionCreators = {
    ...gridActionCreators,
    ...gridSetupActionCreators,
    ...userActionCreators,
    ...schedulerActionCreators,
    ...resourceManagerActionCreators,
    ...workerActionCreators
};

export type ActionCreators = typeof actionCreators;
