import { sleep } from '../utils/sleep';
import { GridNode } from './grid-node';
import { Socket } from './socket';

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
export class Job {
    /**
     * The origin of this message, always represents the user that sent the
     * message.
     */
    public readonly origin: Socket;

    /**
     * The job execution duration.
     */
    private readonly duration: number;

    /**
     * The job status.
     */
    private status: JobStatus;

    /**
     * Creates a new job to be scheduled within the grid.
     * @param origin Socket of the user that creates this job instance
     * @param duration The execution time of this job in ms
     */
    constructor(origin: GridNode, duration: number) {
        this.origin = origin.socket;
        this.status = JobStatus.Waiting;
        this.duration = duration;
    }

    /**
     * Executes the job, note that this returns a promise that can either be
     * awaited or provided with a callback using `execute().then(() => {});`.
     */
    public async execute(): Promise<void> {
        this.status = JobStatus.Running;
        await sleep(this.duration);
        this.status = JobStatus.Finished;
    }

    /**
     * Gets the status of this job.
     */
    public getStatus(): JobStatus {
        return this.status;
    }
}
