import { combineReducers } from '@ngfk/ts-redux';

import { GridSetup } from '../models/grid-setup';
import { ResourceManagers } from '../models/resource-manager';
import { Schedulers } from '../models/scheduler';
import { UserModel } from '../models/user';
import { Workers } from '../models/worker';
import { gridSetupReducer } from './grid-setup.reducer';
import { resourceManagerReducer } from './resource-manager.reducer';
import { schedulerReducer } from './scheduler.reducer';
import { userReducer } from './user.reducer';
import { workerReducer } from './worker.reducer';

export interface State {
    readonly setup: GridSetup;
    readonly user: UserModel;
    readonly schedulers: Schedulers;
    readonly resourceManagers: ResourceManagers;
    readonly workers: Workers;
}

export const reducer = combineReducers<State>({
    setup: gridSetupReducer,
    user: userReducer,
    schedulers: schedulerReducer,
    resourceManagers: resourceManagerReducer,
    workers: workerReducer
});
