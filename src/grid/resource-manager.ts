import { NodeType } from '../models/node-type';
import { sleep } from '../utils/sleep';
import { Job } from './job';
import { Message, MessageType } from './message';
import { GridNode, NodeStatus } from './node';
import { Socket } from './socket';

export class ResourceManagerNode extends GridNode {
    private static readonly SCHEDULER_LOST = 'A scheduler should be stored for this job';

    /**
     * Collection of workers that are registered to this resource manager.
     */
    private workers = new Set<Socket>();

    /**
     * Collection of jobs that have to be processed by this resource manager.
     */
    private jobs = new Set<Job>();

    /**
     * Map used to keep track of which scheduler to return a certain job to.
     */
    private schedulerMap = new Map<Job, Socket>();

    /**
     * Map used to keep track of messages that are unconfirmed.
     */
    // private confirmed = new Map<Job, boolean>();

    constructor() {
        super(NodeType.ResourceManager);
    }

    /**
     * Registers the provided worker as usable by this resource manager.
     * @param worker The worker socket to register.
     */
    public registerWorker(worker: Socket): this {
        this.workers.add(worker);
        return this;
    }

    /**
     * Registers the provided workers as usable by this resource manager.
     * @param workers The worker sockets to register.
     */
    public registerWorkers(workers: Socket[]): this {
        workers.forEach(worker => this.registerWorker(worker));
        return this;
    }

    /**
     * The run method is constantly triggered from the base class.
     */
    public async run(): Promise<void> {
        // For every active-unfinished job periodically check if the worker is
        // still alive
        // for (let i = 0; i < this.jobs.size; i++) {
        //     if (this.jobs[i].status !== JobStatus.Running) continue;
        //     const worker = this.jobs[i].workerSocket;
        //     this.pingWorker(worker);
        // }
        await sleep(200);
    }

    /**
     * Executed when a message is received.
     * @param message The message.
     */
    public onMessage(message: Message): void {
        // Ignore every message if dead
        if (this.status === NodeStatus.Dead) return;

        switch (message.from.type) {
            case NodeType.Scheduler:
                this.onSchedulerMessage(message);
                break;
            case NodeType.Worker:
                this.onWorkerMessage(message);
                break;
        }
    }

    /**
     * Executed when a message is received from a scheduler.
     * @param message The message.
     */
    private onSchedulerMessage(message: Message): void {
        switch (message.type) {
            case MessageType.Request:
                this.onSchedulerRequest(message);
                break;
            case MessageType.Acknowledgement:
                this.onSchedulerAcknowledgement(message);
                break;
            // case MessageType.Ping:
            //     this.onSchedulerPing(message);
            //     break;
        }
    }

    /**
     * Executed when a message is received from a worker.
     * @param message The message.
     */
    private onWorkerMessage(message: Message): void {
        switch (message.type) {
            case MessageType.Confirmation:
                this.onWorkerConfirmation(message);
                break;
            case MessageType.Result:
                this.onWorkerResult(message);
                break;
            // case MessageType.Ping:
            //     this.onWorkerPing(message);
            //     break;
        }
    }

    /**
     * Executed when a request message is received from a scheduler.
     * @param message The message.
     */
    private onSchedulerRequest(message: Message): void {
        const { job } = message;

        // Update job count
        this.jobs.add(job);
        this.setJobCount(this.jobs.size);

        // Keep job -> scheduler mapping
        this.schedulerMap.set(job, message.from);

        // Send confirmation to the scheduler (fig 2, step 6)
        const confirmation = new Message(this, MessageType.Confirmation, job);
        message.from.send(confirmation);

        // Send job to worker
        const request = new Message(this, MessageType.Request, job);
        this.sendToWorker(request);
    }

    /**
     * Executed when an acknowledgement message is received from a scheduler.
     * @param message The message.
     */
    private onSchedulerAcknowledgement(message: Message): void {
        // Remove from job -> scheduler mapping
        this.schedulerMap.delete(message.job);
    }

    /**
     * Executed when a ping message is received from a scheduler.
     * @param message The message.
     */
    private onSchedulerPing(message: Message): void {}

    /**
     * Executed when a confirmation message is received from a worker.
     * @param message The message.
     */
    private onWorkerConfirmation(message: Message): void {
        // Register as confirmed
        // this.confirmed.set(message.job, true);
    }

    /**
     * Executed when a result message is received from a worker. A confirmation
     * message is sent to the worker and the job result is returned to the
     * scheduler.
     * @param message The message.
     */
    private onWorkerResult(message: Message): void {
        const { job } = message;
        this.workers.add(message.from);

        // Confirm the result for a worker
        // const confirmation = new Message(this, MessageType.Confirmation, job);
        // message.from.send(confirmation);

        // Send job result to the scheduler (fig 2, step 10)
        const scheduler = this.schedulerMap.get(job);
        if (!scheduler) throw new Error(ResourceManagerNode.SCHEDULER_LOST);
        const result = new Message(this, MessageType.Result, job);
        scheduler.send(result);

        // Update job count
        this.jobs.delete(job);
        this.setJobCount(this.jobs.size);
    }

    /**
     * Picks an available worker and sends the message to it. If no confirmation
     * is received within 5 seconds the message is sent to another worker.
     * @param message The message to send
     */
    private sendToWorker(message: Message): void {
        const { job } = message;

        // Pick a worker & send the message
        const worker = [...this.workers][0];

        // If there is no available worker it will retry after 5 seconds.
        if (worker) {
            worker.send(message);

            // Remove from available workers & register job as unconfirmed
            this.workers.delete(worker);
            // this.confirmed.set(job, false);
        }

        // Retry using a different worker if no confirmation is received
        // within 5 seconds
        // setTimeout(() => {
        //     if (!this.confirmed.get(job)) {
        //         console.log('test');
        //         this.sendToWorker(message);
        //     } else this.confirmed.delete(job);
        // }, 5000);
    }
}
