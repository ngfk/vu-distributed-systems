import { ActionFactory } from '@ngfk/ts-redux';

export interface UserActionMap {
    USER_INIT: string;
    USER_JOBS: { id: string; jobCount: number };
}

const factory = new ActionFactory<UserActionMap>();

export const userActionCreators = {
    userInit: factory.creator('USER_INIT'),
    userJobs: factory.creator('USER_JOBS')
};

export type UserActionCreators = typeof userActionCreators;
