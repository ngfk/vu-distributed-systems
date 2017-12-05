export interface WorkerModel {
    readonly id: string;
    readonly jobCount: number;
    readonly isDown: boolean;
}

export interface Workers {
    readonly [id: string]: WorkerModel;
}
