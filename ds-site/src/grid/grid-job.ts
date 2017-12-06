import { uuid } from '../utils/uuid';
import { GridSocket } from './grid-socket';

export enum JobStatus {
    Waiting,
    Running,
    Closed
}

export class GridJob {
    public readonly id = uuid();
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

    public getOrigin(): GridSocket {
        return this.origin;
    }
}
