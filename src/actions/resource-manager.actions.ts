import { ActionFactory } from '@ngfk/ts-redux';

export interface ResourceManagerActionMap {
    RESOURCE_MANAGER_INIT: string[];
    RESOURCE_MANAGER_TOGGLE: { id: string };
    RESOURCE_MANAGER_JOBS: { id: string; jobCount: number };
}

const factory = new ActionFactory<ResourceManagerActionMap>();

export const resourceManagerActionCreators = {
    resourceManagerInit: factory.creator('RESOURCE_MANAGER_INIT'),
    resourceManagerToggle: factory.creator('RESOURCE_MANAGER_TOGGLE'),
    resourceManagerJobs: factory.creator('RESOURCE_MANAGER_JOBS')
};

export type ResourceManagerActionCreators = typeof resourceManagerActionCreators;
