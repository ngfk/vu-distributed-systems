export interface GridSetup {
    readonly user: string;
    readonly schedulers: string[];
    readonly clusters: GridClusterSetup[];
}

export interface GridClusterSetup {
    readonly resourceManager: string;
    readonly workers: string[];
}

export interface GridSetupParams {
    readonly schedulers: number;
    readonly clusters: number;
    readonly workers: number;
}
