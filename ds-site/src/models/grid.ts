export interface Grid {
    readonly user: User;
    readonly schedulers: Scheduler[];
    readonly clusters: Cluster[];
}

export interface User {
    readonly id: string;
    readonly jobCount: number;
}

export interface Scheduler {
    readonly id: string;
    readonly jobCount: number;
    readonly isDown: boolean;
}

export interface Cluster {
    readonly resourceManager: ResourceManager;
    readonly workers: Worker[];
}

export interface ResourceManager {
    readonly id: string;
    readonly jobCount: number;
    readonly isDown: boolean;
}

export interface Worker {
    readonly id: string;
    readonly jobCount: number;
    readonly isDown: boolean;
}

export interface GridSetup {
    readonly user: User;
    readonly schedulers: string[];
    readonly clusters: GridClusterSetup[];
}

export interface GridClusterSetup {
    readonly resourceManager: string;
    readonly workers: string[];
}

export interface GridNodeMap {
    scheduler: Scheduler;
    'resource-manager': ResourceManager;
    worker: Worker;
}
