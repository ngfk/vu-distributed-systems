import { NodeType } from '../models/node-type';
import { randomRange } from '../utils/random';
import { sleep } from '../utils/sleep';
import { GridActiveJob } from './grid-active-job';
import { GridContext } from './grid-context';
import { JobStatus } from './grid-job';
import { GridMessage, MessageType } from './grid-message';
import { GridNode, NodeStatus } from './grid-node';
import { GridSocket } from './grid-socket';

export class GridScheduler extends GridNode {
    private schedulers = new Map<GridSocket, NodeStatus>();
    private resourceManagers: GridSocket[];
    private jobs = new Set<GridActiveJob>();

    constructor(context: GridContext) {
        super(context, NodeType.Scheduler);
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

        await sleep(5000);
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
                this.onUserRequest(message);
                break;
            case MessageType.Confirmation:
                this.onUserConfirmation(message);
                break;
        }
    }

    private onSchedulerMessage(message: GridMessage): void {
        switch (message.type) {
            case MessageType.Ping:
                this.onSchedulerPing(message);
                break;
            case MessageType.Request:
                this.onSchedulerRequest(message);
                break;
            case MessageType.Confirmation:
                this.onSchedulerConfirmation(message);
                break;
            case MessageType.Result:
                this.onSchedulerResult(message);
                break;
            case MessageType.Acknowledgement:
                this.onSchedulerAcknowledgement(message);
                break;
        }
    }

    private onResourceManagerMessage(message: GridMessage): void {
        switch (message.type) {
            case MessageType.Result:
                this.onResourceManagerResult(message);
                break;
        }
    }

    private onUserRequest(message: GridMessage): void {
        const job = message.getJob();

        const activeSchedulers = this.getActiveSchedulers();
        const activeJob = new GridActiveJob(job, this.socket, activeSchedulers);

        this.jobs.add(activeJob);
        this.sendJobCount(this.jobs.size);

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

    private onUserConfirmation(message: GridMessage): void {
        const activeJob = this.findActiveJob(message.value);
        activeJob.status = JobStatus.Finished;
        const job = activeJob.job;

        // Synchronize with other schedulers
        for (const scheduler of this.getActiveSchedulers()) {
            const schedulerMessage = this.createMessage(
                MessageType.Result,
                job.id
            );
            schedulerMessage.attachJob(job);
            scheduler.send(schedulerMessage);
        }
    }

    private onSchedulerPing(message: GridMessage): void {
        const socket = message.senderSocket;

        const status = this.schedulers.get(socket);
        if (status === NodeStatus.Dead)
            this.schedulers.set(socket, NodeStatus.Available);
    }

    private onSchedulerRequest(message: GridMessage): void {
        const job = message.getJob();
        const activeJob = new GridActiveJob(job, message.senderSocket);
        this.jobs.add(activeJob);
        this.sendJobCount(this.jobs.size);

        const newMessage = this.createMessage(MessageType.Confirmation, job.id);
        message.senderSocket.send(newMessage);
    }

    private onSchedulerConfirmation(message: GridMessage): void {
        const scheduler = message.senderSocket;
        const activeJob = this.findActiveJob(message.value);
        activeJob.confirmScheduler(scheduler);

        if (activeJob.canStart()) this.executeJob(activeJob);
    }

    private onResourceManagerResult(message: GridMessage): void {
        const activeJob = this.findActiveJob(message.value);
        activeJob.markAsDone(this.socket);
        const job = activeJob.job;

        // Send result to user
        const userMessage = this.createMessage(MessageType.Result, job.id);
        job.origin.send(userMessage);
    }

    private onSchedulerResult(message: GridMessage): void {
        const activeJob = this.findActiveJob(message.value);
        const newMessage = this.createMessage(
            MessageType.Acknowledgement,
            activeJob.job.id
        );
        message.senderSocket.send(newMessage);
        this.jobs.delete(activeJob);
        this.sendJobCount(this.jobs.size);
    }

    private onSchedulerAcknowledgement(message: GridMessage): void {
        const activeJob = this.findActiveJob(message.value);
        activeJob.markAsDone(message.senderSocket);

        if (activeJob.isFinished()) {
            this.jobs.delete(activeJob);
            this.sendJobCount(this.jobs.size);
        }
    }

    private getActiveSchedulers(): GridSocket[] {
        const sockets: GridSocket[] = [];
        this.schedulers.forEach((state, socket) => {
            if (state !== NodeStatus.Dead) sockets.push(socket);
        });
        return sockets;
    }

    private findActiveJob(jobId: string): GridActiveJob {
        for (let key of this.jobs.keys()) {
            if (key.job.id === jobId) return key;
        }

        throw Error('Unknown active job: ' + jobId);
    }

    private executeJob(activeJob: GridActiveJob): void {
        // Send confirmation to user
        const userMessage = this.createMessage(
            MessageType.Confirmation,
            activeJob.job.id
        );
        activeJob.job.origin.send(userMessage);

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
