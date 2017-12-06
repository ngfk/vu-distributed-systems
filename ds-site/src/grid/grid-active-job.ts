import { GridJob, JobStatus } from './grid-job';
import { GridSocket } from './grid-socket';

export enum ActiveJobStatus {
    Unconfirmed,
    Confirmed,
    Done
}

export class GridActiveJob {
    public status: JobStatus;
    public workerSocket: GridSocket;
    public rmSocket: GridSocket;
    private schedulers = new Map<GridSocket, ActiveJobStatus>();

    constructor(
        public job: GridJob,
        public schedulerSocket?: GridSocket,
        private schedulerSockets?: GridSocket[]
    ) {
        this.status = JobStatus.Waiting;

        if (!this.schedulerSocket || !schedulerSockets) {
            return;
        }

        schedulerSockets.forEach(socket => {
            this.schedulers.set(socket, ActiveJobStatus.Unconfirmed);
        });

        this.confirmScheduler(this.schedulerSocket);
    }

    public confirmScheduler(scheduler: GridSocket): void {
        this.schedulers.set(scheduler, ActiveJobStatus.Confirmed);
    }

    public markAsDone(scheduler: GridSocket): void {
        this.schedulers.set(scheduler, ActiveJobStatus.Done);
    }

    public canStart(): boolean {
        const statuses = Array.from(this.schedulers.values());
        return statuses.every(s => s === ActiveJobStatus.Confirmed);
    }

    public isFinished(): boolean {
        const statuses = Array.from(this.schedulers.values());
        return statuses.every(s => s === ActiveJobStatus.Done);
    }
}
