import { NodeType } from '../models/node-type';
import { delay } from '../utils/delay';
import { randomRange } from '../utils/random';
import { GridActiveJob } from './grid-active-job';
import { JobStatus } from './grid-job';
import { GridMessage, MessageType } from './grid-message';
import { GridNode, NodeStatus } from './grid-node';
import { GridSocket } from './grid-socket';

export class GridScheduler extends GridNode {
    private schedulers = new Map<GridSocket, NodeStatus>();
    private resourceManagers: GridSocket[];
    private jobs: GridActiveJob[] = [];

    constructor() {
        super(NodeType.Scheduler);
    }

    public registerResourceManagers(resourceManagers: GridSocket[]): void {
        this.resourceManagers = resourceManagers;
    }

    public registerSchedulers(schedulers: GridSocket[]): void {
        schedulers.filter(s => s !== this.socket).forEach(s => {
            this.schedulers.set(s, NodeStatus.Available);
        });
    }

    public async run(): Promise<void> {
        // Ping other schedulers
        const message = this.createMessage(MessageType.Ping);
        this.getActiveSchedulers().forEach(s => s.send(message));

        await delay(5000);
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

    private onSchedulerMessage(message: GridMessage): void {
        switch (message.type) {
            case MessageType.Ping:
                this.onSchedulerPingMessage(message);
                break;
            case MessageType.Request:
                this.onSchedulerRequestMessage(message);
                break;
            case MessageType.Confirmation:
                this.onSchedulerConfirmationMessage(message);
                break;
        }
    }

    private onResourceManagerMessage(message: GridMessage): void {}

    private onUserRequestMessage(message: GridMessage): void {
        const job = message.getJob();

        const activeSchedulers = this.getActiveSchedulers();
        const activeJob = new GridActiveJob(job, this.socket, activeSchedulers);

        this.jobs.push(activeJob);
        // TODO dispatch on redux store

        // edge case where there are no other sockets
        if (activeSchedulers.length === 0) {
            this.executeJob(activeJob);
            return;
        }

        // Synchronize with other schedulers
        for (let scheduler of activeSchedulers) {
            const newMessage = this.createMessage(MessageType.Request, job.id);
            newMessage.attachJob(job);
            scheduler.send(newMessage);
        }
    }

    private onSchedulerPingMessage(message: GridMessage): void {
        const socket = message.senderSocket;

        const status = this.schedulers.get(socket);
        if (status === NodeStatus.Dead)
            this.schedulers.set(socket, NodeStatus.Available);
    }

    private onSchedulerRequestMessage(message: GridMessage): void {
        const job = message.getJob();
        const activeJob = new GridActiveJob(job, message.senderSocket);
        this.jobs.push(activeJob);
        // TODO dispatch on redux store

        const newMessage = this.createMessage(MessageType.Confirmation, job.id);
        message.senderSocket.send(newMessage);
    }

    private onSchedulerConfirmationMessage(message: GridMessage): void {
        const scheduler = message.senderSocket;
        const activeJob = this.findActiveJob(message.value);
        activeJob.confirmScheduler(scheduler);

        if (activeJob.canStart()) this.executeJob(activeJob);
    }

    private getActiveSchedulers(): GridSocket[] {
        const sockets: GridSocket[] = [];
        this.schedulers.forEach((state, socket) => {
            if (state !== NodeStatus.Dead) sockets.push(socket);
        });
        return sockets;
    }

    private findActiveJob(jobId: number): GridActiveJob {
        const result = this.jobs.find(activeJob => activeJob.job.id === jobId);
        if (!result) throw Error('Unknown active job: ' + jobId);
        return result;
    }

    private executeJob(activeJob: GridActiveJob): void {
        // Send confirmation to user
        const userMessage = this.createMessage(
            MessageType.Confirmation,
            activeJob.job.id
        );
        activeJob.job.getOrigin().send(userMessage);

        // Forward job to ResourceManager
        const job = activeJob.job;
        const idx = randomRange(0, this.resourceManagers.length - 1);
        const resourceManager = this.resourceManagers[idx];
        activeJob.status = JobStatus.Running;

        const rmMessage = this.createMessage(MessageType.Request, job.id);
        rmMessage.attachJob(job);
        resourceManager.send(rmMessage);
    }
}
