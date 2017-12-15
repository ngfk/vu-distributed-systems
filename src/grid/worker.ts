import { NodeType } from '../models/node-type';
import { Job } from './job';
import { Message, MessageType } from './message';
import { GridNode, NodeStatus } from './node';
import { Socket } from './socket';

export class WorkerNode extends GridNode {
    /**
     * Error message used when a message that should contain a job does not
     * have a job.
     */
    public static readonly NO_JOB_MESSAGE = 'Received message should contain a job.';

    /**
     * Error message used when a result message is sent without this working
     * holding a job.
     */
    public static readonly NO_JOB_RESULT = 'Should not attempt to send a result message without holding a job.';

    /**
     * The job being executed by this worker.
     */
    private job?: Job;

    /**
     * Map use to keep track of messages that are unconfirmed.
     */
    // private confirmed = new Map<Job, boolean>();

    constructor() {
        super(NodeType.Worker);
    }

    /**
     * The run method is constantly triggered from the base class. However a
     * worker does not need a constantly running thread.
     */
    public async run(): Promise<void> {
        // Workers actually don't need a constantly running thread.
        throw new Error('Not implemented yet.');
    }

    /**
     * Every message that the worker receives enters here.
     * @param message The received message
     */
    public onMessage(message: Message): void {
        // Ignore every message if dead
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
            // TODO: Not sure if we still need these
            // case MessageType.Status:
            //     this.onStatus(message.senderSocket);
            //     break;
        }
    }

    /**
     * Executed when a request message is received from a resource manager.
     * @param message The message
     */
    private onRequest(message: Message): void {
        const { job } = message;

        // Send a confirmation to the resource manager
        const confirmation = new Message(this, MessageType.Confirmation, job);
        message.from.send(confirmation);

        // Set active job
        this.job = message.job;
        this.setJobCount(1);

        // Execute the job & provide callback
        this.job.execute().then(() => this.sendJobResult(message.from));
    }

    /**
     * Executed when a confirmation message is received from a resource
     * manager.
     * @param message The message
     */
    private onConfirmation(message: Message): void {
        if (!message.job) throw new Error(WorkerNode.NO_JOB_MESSAGE);

        // Register as confirmed
        // this.confirmed.set(message.job, true);

        // Reset active job
        this.job = undefined;
        this.setJobCount(0);
    }

    /**
     * Executed when a ping message is received from a resource manager.
     * @param message The message
     */
    private onPing(message: Message): void {
        // TODO: Not sure what to do here...
        // let jobId = !this.activeJob ? '0' : this.activeJob.job.id;
        // const message = new GridMessage(
        //     this.socket,
        //     NodeType.Worker,
        //     MessageType.Ping,
        //     jobId
        // );
        // rmSocket.send(message);
    }

    /**
     * Sends a result message to the provided resource manager, will retry if
     * no confirmation is retrieved within 5 seconds.
     * @param resourceManager The resource manager socket
     */
    private sendJobResult(resourceManager: Socket): void {
        // This node could have died in the meantime
        if (this.status === NodeStatus.Dead) return;
        if (!this.job) throw new Error(WorkerNode.NO_JOB_RESULT);

        // Send a result message to the resource manager
        const result = new Message(this, MessageType.Result, this.job);
        resourceManager.send(result);

        // Register job as unconfirmed
        const job = this.job;
        this.setJobCount(0);
        // this.confirmed.set(job, false);

        // Retry if no confirmation is received within 5 seconds
        // setTimeout(() => {
        //     if (!this.confirmed.get(job)) this.sendJobResult(resourceManager);
        //     else this.confirmed.delete(job);
        // }, 5000);
    }
}
