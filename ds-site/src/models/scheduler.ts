export interface SchedulerModel {
    readonly id: string;
    readonly jobCount: number;
    readonly isDown: boolean;
}

export interface Schedulers {
    readonly [id: string]: SchedulerModel;
}
