import { ActionFactory } from '@ngfk/ts-redux';

export interface SchedulerActionMap {
    SCHEDULER_INIT: string[];
    SCHEDULER_TOGGLE: { id: string };
    SCHEDULER_JOBS: { id: string; jobCount: number };
}

const factory = new ActionFactory<SchedulerActionMap>();

export const schedulerActionCreators = {
    schedulerInit: factory.creator('SCHEDULER_INIT'),
    schedulerToggle: factory.creator('SCHEDULER_TOGGLE'),
    schedulerJobs: factory.creator('SCHEDULER_JOBS')
};

export type SchedulerActionCreators = typeof schedulerActionCreators;
