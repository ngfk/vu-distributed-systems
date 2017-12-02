import { NodeState } from './node';

export interface Grid {
    readonly user: number;
    readonly schedulerJobs: number;
    readonly schedulers: Scheduler[];
    readonly clusters: Cluster[];
}

export interface Scheduler {
    readonly id: number;
    readonly state: NodeState;
}

export interface Cluster {
    readonly resourceManager: ResourceManager;
    readonly workers: Worker[];
}

export interface ResourceManager {
    readonly id: number;
    readonly state: NodeState;
    readonly jobs: number;
}

export interface Worker {
    readonly id: number;
    readonly state: NodeState;
}

export interface GridSetup {
    readonly user: number;
    readonly schedulers: number[];
    readonly clusters: GridClusterSetup[];
}

export interface GridClusterSetup {
    readonly resourceManager: number;
    readonly workers: number[];
}
