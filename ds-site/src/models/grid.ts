import { NodeState } from './node';

export interface Grid {
    readonly user: string;
    readonly schedulers: Scheduler[];
    readonly clusters: Cluster[];
}

export interface Scheduler {
    readonly id: string;
    readonly state: NodeState;
    readonly jobs: number;
}

export interface Cluster {
    readonly resourceManager: ResourceManager;
    readonly workers: Worker[];
}

export interface ResourceManager {
    readonly id: string;
    readonly state: NodeState;
}

export interface Worker {
    readonly id: string;
    readonly state: NodeState;
}

export interface GridSetup {
    readonly user: string;
    readonly schedulers: string[];
    readonly clusters: GridClusterSetup[];
}

export interface GridClusterSetup {
    readonly resourceManager: string;
    readonly workers: string[];
}
