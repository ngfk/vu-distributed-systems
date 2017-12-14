/**
 * A setup structure used to define every id in a grid.
 */
export interface GridSetup {
    readonly user: string;
    readonly schedulers: string[];
    readonly clusters: GridClusterSetup[];
}

/**
 * Defines the id's in the cluster part of a grid setup.
 */
export interface GridClusterSetup {
    readonly resourceManager: string;
    readonly workers: string[];
}

/**
 * The params used to define the size of a grid.
 */
export interface GridSetupParams {
    readonly schedulers: number;
    readonly clusters: number;
    readonly workers: number;
}
