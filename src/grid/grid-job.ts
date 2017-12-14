import { uuid } from '../utils/uuid';
import { wait } from '../utils/wait';
import { GridSocket } from './grid-socket';

/**
 * Represents the current status of a job.
 */
export enum JobStatus {
    Waiting,
    Running,
    Finished
}

/**
 * Represents a job within the gird.
 */
export class GridJob {
    /**
     * A unique identifier for this message.
     */
    public readonly id = uuid();

    /**
     * The origin of this message, always represents the user that sent the
     * message.
     */
    public readonly origin: GridSocket;

    private readonly duration: number;
    private status: JobStatus;

    /**
     * Creates a new job to be scheduled within the grid.
     * @param origin Socket of the user that creates this job instance
     * @param duration The execution time of this job in ms
     */
    constructor(origin: GridSocket, duration: number) {
        this.origin = origin;
        this.status = JobStatus.Waiting;
        this.duration = duration;
    }

    /**
     * Executes the job, note that this returns a promise that can either be
     * awaited or provided with a callback using `execute().then(() => {});`.
     */
    public async execute(): Promise<void> {
        this.status = JobStatus.Running;
        await wait(this.duration);
        this.status = JobStatus.Finished;
    }

    /**
     * Gets the status of this job.
     */
    public getStatus(): JobStatus {
        return this.status;
    }
}
