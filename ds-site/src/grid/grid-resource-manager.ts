import { NodeType } from '../models/node-type';
import { GridActiveJob } from './grid-active-job';
import { GridMessage, MessageType } from './grid-message';
import { GridNode, NodeStatus } from './grid-node';
import { GridSocket } from './grid-socket';

export class GridResourceManager extends GridNode {
    public workerSockets: GridSocket[] = [];
    private activeJobs: GridActiveJob[] = [];
    constructor() {
        super(NodeType.ResourceManager);
    }

    public async run(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public onMessage(message: GridMessage): void {
        if (this.status === NodeStatus.Dead) return;

        switch (message.sender) {
            case NodeType.Scheduler:
                this.onSchedulerMessage(message);
                break;
            case NodeType.Worker:
                this.onWorkerMessage(message);
                break;
        }
    }

    public toggleState(): void {
        this.status =
            this.status === NodeStatus.Dead
                ? NodeStatus.Available
                : NodeStatus.Dead;
    }

    public getActiveJob(jobId: string): GridActiveJob {
        const activeJobs = [...this.activeJobs.values()];

        for (let i = 0; i < activeJobs.length; i++) {
            if (activeJobs[i].job.id === jobId) {
                return activeJobs[i];
            }
        }
        throw new Error('No active jobs');
    }

    /**
     * Scheduler handlers
     * @param message received messages
     */
    private onSchedulerAcknowledgement(message: GridMessage): void {
        const jobId = message.value;
        const aj = this.getActiveJob();
    }

    private onSchedulerPing(message: GridMessage): void {
        return;
    }

    private onSchedulerJobRequest(message: GridMessage): void {
        return;
    }

    /**
     * Scheduler Message Handler
     * @param message received message
     */
    private onSchedulerMessage(message: GridMessage): void {
        switch (message.type) {
            case MessageType.Acknowledgement:
                this.onSchedulerAcknowledgement(message);
                break;
            case MessageType.Ping:
                this.onSchedulerPing(message);
                break;
            case MessageType.Request:
                this.onSchedulerJobRequest(message);
                break;
        }
    }

    /**
     * Worker Message Handler
     * @param message received message
     */
    private onWorkerMessage(message: GridMessage): void {
        switch (message.type) {
            case MessageType.Acknowledgement:
                this.onWorkerStatus(message);
                break;
            case MessageType.Confirmation:
                this.onWorkerJobConfirmation(message);
                break;
            case MessageType.Ping:
                this.onWorkerPingReturn(message);
                break;
            case MessageType.Result:
                this.onWorkerResult(message);
                break;
        }
    }
}
