import { NodeType } from '../models/node-type';
import { randomRange } from '../utils/random';
import { GridActiveJob } from './grid-active-job';
import { GridContext } from './grid-context';
import { GridJob, JobStatus } from './grid-job';
import { GridMessage, MessageType } from './grid-message';
import { GridNode } from './grid-node';
import { GridSocket } from './grid-socket';

export class GridUser extends GridNode {
    private schedulers: GridSocket[] = [];
    private jobs = new Set<GridActiveJob>();

    constructor(context: GridContext) {
        super(context, NodeType.User);
    }

    public registerSchedulers(schedulers: GridSocket[]): void {
        this.schedulers = schedulers;
    }

    public async run(): Promise<void> {
        const job = new GridJob(this.socket, randomRange(0, 5000));
        this.executeJob(job);
        // await delay(10000);
    }

    public onMessage(message: GridMessage): void {
        switch (message.type) {
            case MessageType.Confirmation:
                this.onConfirmation(message);
                break;
            case MessageType.Result:
                this.onResult(message);
                break;
        }
    }

    private onConfirmation(message: GridMessage): void {
        const activeJob = this.findActiveJob(message.value);
        activeJob.status = JobStatus.Running;
    }

    private onResult(message: GridMessage): void {
        const jobId = message.value;

        const newMessage = this.createMessage(MessageType.Confirmation, jobId);
        message.senderSocket.send(newMessage);

        const activeJob = this.findActiveJob(jobId);
        this.jobs.delete(activeJob);
        this.sendJobCount(this.jobs.size);
    }

    private executeJob(job: GridJob): void {
        const idx = randomRange(0, this.schedulers.length - 1);
        const scheduler = this.schedulers[idx];

        const message = this.createMessage(MessageType.Request, job.id);
        message.attachJob(job);

        this.jobs.add(new GridActiveJob(job));
        this.sendJobCount(this.jobs.size);
        scheduler.send(message);
    }

    private findActiveJob(jobId: string): GridActiveJob {
        for (let key of this.jobs.keys()) {
            if (key.job.id === jobId) return key;
        }

        throw Error('Unknown active job: ' + jobId);
    }
}
