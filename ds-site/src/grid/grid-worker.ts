import { NodeType } from '../models/node-type';
import { delay } from '../utils/delay';
import { GridActiveJob } from './grid-active-job';
import { GridContext } from './grid-context';
import { JobStatus } from './grid-job';
import { GridMessage, MessageType } from './grid-message';
import { GridNode, NodeStatus } from './grid-node';
import { GridSocket } from './grid-socket';

export class GridWorker extends GridNode {
    public activeJob: GridActiveJob | undefined;

    constructor(context: GridContext) {
        super(context, NodeType.Worker);
    }

    public async run(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public onMessage(message: GridMessage): void {
        if (this.status === NodeStatus.Dead) return;

        switch (message.type) {
            case MessageType.Request:
                this.jobRequest(message);
                break;
            case MessageType.Confirmation:
                this.jobResultConfirmation(message);
                break;
            case MessageType.Ping:
                this.jobStatusRequest(message);
                break;
            case MessageType.Status:
                this.workerStatus(message.senderSocket);
                break;
        }
    }

    private jobRequest(message: GridMessage) {
        this.status = NodeStatus.Busy;
        this.sendJobConfirmationToRM(message.senderSocket, message.value);
        this.activeJob = new GridActiveJob(
            message.getJob(),
            message.senderSocket
        );

        this.activeJob.status = JobStatus.Running;
        this.sendJobCount(1);

        const executeActive = async () => {
            if (!this.activeJob) throw new Error('No active job');

            await delay(this.activeJob.job.duration);
            this.activeJob.job.setResult(42);
            this.activeJob.status = JobStatus.Closed;
            this.sendJobCount(0);

            this.sendJobResultToRM();
        };

        executeActive();
    }

    private getAliveMessage(): GridMessage {
        const message = new GridMessage(
            this.socket,
            NodeType.Worker,
            MessageType.Status,
            this.status
        );

        return message;
    }

    private workerStatus(rmSocket: GridSocket) {
        if (this.status === NodeStatus.Dead) return;

        rmSocket.send(this.getAliveMessage());
    }

    private sendJobConfirmationToRM(rmSocket: GridSocket, value: number) {
        if (this.status === NodeStatus.Dead) return;

        const message = this.createMessage(MessageType.Confirmation, value);
        rmSocket.send(message);
    }

    private sendJobResultToRM(): void {
        if (this.status === NodeStatus.Dead) return;
        if (!this.activeJob) {
            throw new Error('No active job');
        }
        const message = new GridMessage(
            this.socket,
            NodeType.Worker,
            MessageType.Result,
            this.activeJob.job.id
        );
        message.attachJob(this.activeJob.job);
        if (!this.activeJob.schedulerSocket) {
            throw new Error('No scheduler');
        }
        this.activeJob.schedulerSocket.send(message);
    }

    private sendJobStatusToRM(rmSocket: GridSocket): void {
        if (this.status === NodeStatus.Dead) return;
        let jobId;
        if (!this.activeJob) {
            jobId = 0;
        } else {
            jobId = this.activeJob.job.id;
        }
        const message = new GridMessage(
            this.socket,
            NodeType.Worker,
            MessageType.Ping,
            jobId
        );
        rmSocket.send(message);
    }

    private jobStatusRequest(message: GridMessage) {
        if (this.status === NodeStatus.Dead) return;
        this.sendJobStatusToRM(message.senderSocket);
    }

    private jobResultConfirmation(message: GridMessage) {
        this.activeJob = undefined;
        this.sendJobCount(0);

        if (this.status !== NodeStatus.Dead) {
            this.status = NodeStatus.Available;
        }
    }
}
