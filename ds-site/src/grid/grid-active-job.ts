import { GridJob, JobStatus } from './grid-job';
import { GridSocket } from './grid-socket';

export enum ActiveJobStatus {
    Unconfirmed,
    Confirmed,
    Done
}

export class GridActiveJob {
    private schedulers = new Map<GridSocket, ActiveJobStatus>();

    constructor(
        public job: GridJob,
        public status: JobStatus,
        public workerSocket: GridSocket,
        public rmSocket: GridSocket,
        private schedulerSockets: GridSocket[]
    ) {
        if (schedulerSockets !== null) {
            schedulerSockets.forEach(socket => {
                this.schedulers.set(socket, ActiveJobStatus.Unconfirmed);
            });
        }
    }

    public confirmScheduler(scheduler: GridSocket): void {
        this.schedulers.set(scheduler, ActiveJobStatus.Confirmed);
    }

    public markAsDone(scheduler: GridSocket): void {
        this.schedulers.set(scheduler, ActiveJobStatus.Done);
    }

    public canStart(): boolean {
        const statuses = [...this.schedulers.values()];

        for (let i = 0; i < statuses.length; i++) {
            if (statuses[i] === ActiveJobStatus.Unconfirmed) {
                return false;
            }
        }
        return true;
    }

    public isFinished(): boolean {
        const statuses = [...this.schedulers.values()];
        return statuses.some(s => s === ActiveJobStatus.Done);
    }
}
