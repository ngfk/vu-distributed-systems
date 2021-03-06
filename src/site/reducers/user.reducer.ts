import { Reducer } from '@ngfk/ts-redux/dist/reducer';
import { createReducer } from '@ngfk/ts-redux/dist/reducer-creation';

import { UserModel } from '../../models/user';
import { UserActionMap } from '../actions/user.actions';

const initial: UserModel = {
    id: '0',
    jobCount: 0
};

export const userReducer: Reducer<UserModel> = createReducer<
    UserModel,
    UserActionMap
>(initial, {
    USER_INIT: (state, payload) => ({ id: payload, jobCount: 0 }),
    USER_JOBS: (state, payload) => ({ ...state, jobCount: payload.jobCount })
});
