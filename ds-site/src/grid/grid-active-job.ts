import { GridJob } from './grid-job';

export enum ActiveJobStatus {
    Unconfirmed,
    Confirmed,
    Done
}

export class GridActiveJob {
    constructor(private job: GridJob) {}
}
