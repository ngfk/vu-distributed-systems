/**
 * Type definition used to define the state of a worker represented on the
 * interface.
 */
export interface WorkerModel {
    readonly id: string;
    readonly jobCount: number;
    readonly isDown: boolean;
}

/**
 * A collection of workers reachable by id.
 */
export interface Workers {
    readonly [id: string]: WorkerModel;
}
