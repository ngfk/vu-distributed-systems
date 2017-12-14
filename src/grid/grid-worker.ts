import { NodeType } from '../models/node-type';
import { GridActiveJob } from './grid-active-job';
import { GridContext } from './grid-context';
import { JobStatus } from './grid-job';
import { GridMessage, MessageType } from './grid-message';
import { GridNode, NodeStatus } from './grid-node';
import { GridSocket } from './grid-socket';

export class GridWorker extends GridNode {
    public activeJob: GridActiveJob;

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
                this.onRequest(message);
                break;
            case MessageType.Confirmation:
                this.onConfirmation(message);
                break;
            case MessageType.Ping:
                this.onPing(message);
                break;
            case MessageType.Status:
                this.onStatus(message.senderSocket);
                break;
        }
    }

    private onRequest(message: GridMessage) {
        this.status = NodeStatus.Busy;

        const newMessage = this.createMessage(
            MessageType.Confirmation,
            message.value
        );
        message.senderSocket.send(newMessage);

        this.activeJob = new GridActiveJob(
            message.getJob(),
            message.senderSocket
        );

        this.activeJob.status = JobStatus.Running;
        this.sendJobCount(1);

        const executeActive = () => {
            if (!this.activeJob) throw new Error('No active job');

            this.activeJob.job.setResult(42);
            this.activeJob.status = JobStatus.Closed;
            this.sendJobCount(0);

            this.sendJobResultToRM();
        };

        setTimeout(executeActive, this.activeJob.job.duration);
    }

    private getAliveMessage(): GridMessage {
        const message = new GridMessage(
            this.socket,
            NodeType.Worker,
            MessageType.Status,
            '' + this.status
        );

        return message;
    }

    private onStatus(rmSocket: GridSocket) {
        rmSocket.send(this.getAliveMessage());
    }

    private sendJobResultToRM(): void {
        if (this.status === NodeStatus.Dead) return;
        if (!this.activeJob) throw new Error('No active job');

        const message = this.createMessage(
            MessageType.Result,
            this.activeJob.job.id
        );
        message.attachJob(this.activeJob.job);

        if (!this.activeJob.schedulerSocket) throw new Error('No scheduler');
        this.activeJob.schedulerSocket.send(message);
    }

    private sendJobStatusToRM(rmSocket: GridSocket): void {
        if (this.status === NodeStatus.Dead) return;
        let jobId = !this.activeJob ? '0' : this.activeJob.job.id;

        const message = new GridMessage(
            this.socket,
            NodeType.Worker,
            MessageType.Ping,
            jobId
        );
        rmSocket.send(message);
    }

    private onPing(message: GridMessage) {
        if (this.status === NodeStatus.Dead) return;
        this.sendJobStatusToRM(message.senderSocket);
    }

    private onConfirmation(message: GridMessage) {
        this.sendJobCount(0);

        if (this.status !== NodeStatus.Dead) {
            this.status = NodeStatus.Available;
        }
    }
}
