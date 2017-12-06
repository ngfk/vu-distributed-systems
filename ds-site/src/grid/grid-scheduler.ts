import { NodeType } from '../models/node-type';
import { GridActiveJob } from './grid-active-job';
import { GridMessage, MessageType } from './grid-message';
import { GridNode, NodeStatus } from './grid-node';
import { GridSocket } from './grid-socket';

export class GridScheduler extends GridNode {
    private schedulers: GridSocket[];
    private resourceManagers: GridSocket[];
    private jobs: GridActiveJob[] = [];

    constructor() {
        super(NodeType.Scheduler);
    }

    public registerResourceManagers(resourceManagers: GridSocket[]): void {
        this.resourceManagers = resourceManagers;
    }

    public registerSchedulers(schedulers: GridSocket[]): void {
        this.schedulers = schedulers.filter(s => s !== this.socket);
    }

    public async run(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public onMessage(message: GridMessage): void {
        if (this.status === NodeStatus.Dead) return;

        switch (message.sender) {
            case NodeType.User:
                this.onUserMessage(message);
                break;
            case NodeType.Scheduler:
                this.onSchedulerMessage(message);
                break;
            case NodeType.ResourceManager:
                this.onResourceManagerMessage(message);
                break;
        }
    }

    private onUserMessage(message: GridMessage): void {
        switch (message.type) {
            case MessageType.Request:
                this.onUserRequestMessage(message);
                break;
        }
    }

    private onSchedulerMessage(message: GridMessage): void {}
    private onResourceManagerMessage(message: GridMessage): void {}

    private onUserRequestMessage(message: GridMessage): void {
        const job = message.getJob();
        job.switchOrigin(this.socket);

        // TODO sync between schedulers

        const activeJob = new GridActiveJob(job);
        this.jobs.push(activeJob);
        // TODO dispatch on redux store
    }
}
