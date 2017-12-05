import { GridSocket } from './grid-socket';

export enum JobStatus {
    Waiting,
    Running,
    Closed
}

export class GridJob {
    private id: string;

    private status: JobStatus;
    private result: number;

    constructor(private origin: GridSocket, private duration: number) {
        this.status = JobStatus.Waiting;
    }

    public switchOrigin(origin: GridSocket): void {
        this.origin = origin;
    }

    public copy(): GridJob {
        return new GridJob(this.origin, this.duration);
    }
}
