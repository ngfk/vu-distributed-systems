import { randomRange } from '../utils/random';
import { GridSocket } from './grid-socket';

export enum JobStatus {
    Waiting,
    Running,
    Closed
}

export class GridJob {
    public readonly id = randomRange(1, Number.MAX_SAFE_INTEGER);

    private status: JobStatus;
    private result: number;

    constructor(private origin: GridSocket, public readonly duration: number) {
        this.status = JobStatus.Waiting;
    }

    public setResult(result: number): void {
        this.result = result;
    }

    public switchOrigin(origin: GridSocket): void {
        this.origin = origin;
    }

    public copy(): GridJob {
        return new GridJob(this.origin, this.duration);
    }
}
