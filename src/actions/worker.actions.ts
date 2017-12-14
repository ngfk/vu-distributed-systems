import { ActionFactory } from '@ngfk/ts-redux';

export interface WorkerActionMap {
    WORKER_INIT: string[];
    WORKER_TOGGLE: { id: string };
    WORKER_JOBS: { id: string; jobCount: number };
}

const factory = new ActionFactory<WorkerActionMap>();

export const workerActionCreators = {
    workerInit: factory.creator('WORKER_INIT'),
    workerToggle: factory.creator('WORKER_TOGGLE'),
    workerJobs: factory.creator('WORKER_JOBS')
};

export type WorkerActionCreators = typeof workerActionCreators;
