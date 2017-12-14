/**
 * Type definition used to define the state of a scheduler represented on the
 * interface.
 */
export interface SchedulerModel {
    readonly id: string;
    readonly jobCount: number;
    readonly isDown: boolean;
}

/**
 * A collection of schedulers reachable by id.
 */
export interface Schedulers {
    readonly [id: string]: SchedulerModel;
}
