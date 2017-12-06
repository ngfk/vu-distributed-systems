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
    private jobs: GridActiveJob[] = [];

    constructor(context: GridContext) {
        super(context, NodeType.User);
    }

    public registerSchedulers(schedulers: GridSocket[]): void {
        this.schedulers = schedulers;
    }

    public async run(): Promise<void> {
        const job = new GridJob(this.socket, randomRange(0, 5000));
        this.executeJob(job);
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
        this.jobs.push(activeJob);
        this.sendJobCount(this.jobs.length);
    }

    private onResult(message: GridMessage): void {
        const jobId = message.value;
        const activeJob = this.findActiveJob(jobId);
        const newMessage = this.createMessage(MessageType.Confirmation, jobId);
        message.senderSocket.send(newMessage);
        this.jobs = this.jobs.filter(j => j !== activeJob);
        this.sendJobCount(this.jobs.length);
    }

    private executeJob(job: GridJob): void {
        const idx = randomRange(0, this.schedulers.length - 1);
        const scheduler = this.schedulers[idx];

        const message = this.createMessage(MessageType.Request, job.id);
        message.attachJob(job);

        this.jobs.push(new GridActiveJob(job));
        this.sendJobCount(this.jobs.length);
        scheduler.send(message);
    }

    private findActiveJob(jobId: number): GridActiveJob {
        const result = this.jobs.find(activeJob => activeJob.job.id === jobId);
        if (!result) throw Error('Unknown active job: ' + jobId);
        return result;
    }
}
