import { NodeType } from '../models/node-type';
import { randomRange } from '../utils/random';
import { sleep } from '../utils/sleep';
import { Job } from './job';
import { Message, MessageType } from './message';
import { GridNode } from './node';
import { Socket } from './socket';

export class UserNode extends GridNode {
    /**
     * Error message used when a job is dispatched without the user having a
     * registered scheduler.
     */
    public static readonly NO_SCHEDULER = 'No schedulers have been registered for this user.';

    /**
     * Error message used when a message that should contain a job does not
     * have a job.
     */
    public static readonly NO_JOB_MESSAGE = 'Received message should contain a job.';

    /**
     * Collection of schedulers. If not a simulation this would be the data
     * structure as defined in: Appendix A.
     */
    private schedulers = new Set<Socket>();

    /**
     * Collection of (uncompleted) jobs that are submitted by this user. If not
     * a simulation this would be the data structure as defined in: Appendix A.
     */
    private submittedJobs = new Set<Job>();

    /**
     * Map use to keep track of messages that are unconfirmed.
     */
    private confirmed = new Map<Job, boolean>();

    constructor() {
        super(NodeType.User);
    }

    /**
     * Registers the provided scheduler as usable by the user.
     * @param scheduler The scheduler socket to register.
     */
    public registerScheduler(scheduler: Socket): this {
        this.schedulers.add(scheduler);
        return this;
    }

    /**
     * Registers all the provided schedulers as usable by the user.
     * @param scheduler The scheduler sockets to register.
     */
    public registerSchedulers(schedulers: Socket[]): this {
        schedulers.forEach(scheduler => this.registerScheduler(scheduler));
        return this;
    }

    /**
     * Dispatches a job sending it to a random scheduler.
     */
    public dispatchJob(): void {
        if (!this.schedulers.size) throw new Error(UserNode.NO_SCHEDULER);

        // Create a job and wrap it into a request message
        const duration = randomRange(2000, 5000);
        const job = new Job(this, duration);
        const message = new Message(this, MessageType.Request, job);

        // Update list of active jobs
        this.submittedJobs.add(job);
        this.setJobCount(this.submittedJobs.size);

        // Pick random scheduler & send the message
        this.sendToScheduler(message);
    }

    /**
     * Every message that the user receives enters here.
     * @param message The received message
     */
    public onMessage(message: Message): void {
        switch (message.type) {
            case MessageType.Confirmation:
                this.onConfirmation(message);
                break;
            case MessageType.Result:
                this.onResult(message);
                break;
        }
    }

    /**
     * The run method is constantly triggered from the base class. The user
     * will constantly dispatch jobs.
     */
    protected async run(): Promise<void> {
        this.dispatchJob();

        // Wait 200ms to 500ms before dispatching a new job.
        const delay = randomRange(200, 500);
        await sleep(delay);
    }

    /**
     * Executed when a confirmation message is received from a scheduler.
     * @param message The message.
     */
    private onConfirmation(message: Message): void {
        if (!message.job) throw new Error(UserNode.NO_JOB_MESSAGE);

        // Register as confirmed
        this.confirmed.set(message.job, true);
    }

    /**
     * Executed when a result message if received from a scheduler. A
     * confirmation message is sent to the scheduler.
     * @param message The message.
     */
    private onResult(message: Message): void {
        if (!message.job) throw new Error(UserNode.NO_JOB_MESSAGE);

        // Send confirmation to scheduler
        const confirmation = new Message(this, MessageType.Confirmation);
        message.from.send(confirmation);

        // Remove from active jobs
        this.submittedJobs.delete(message.job);
        this.setJobCount(this.submittedJobs.size);
    }

    /**
     * Picks a random scheduler and sends the message to it. If no confirmation
     * is received within 5 seconds the message is sent to another scheduler.
     * @param message The message to send
     */
    private sendToScheduler(message: Message): void {
        if (!message.job) throw new Error(UserNode.NO_JOB_MESSAGE);

        // Pick a random scheduler & send the message
        const schedulerIdx = randomRange(0, this.schedulers.size - 1);
        const scheduler = [...this.schedulers][schedulerIdx];
        scheduler.send(message);

        // Register job as unconfirmed
        const job = message.job;
        this.confirmed.set(job, false);

        // Retry using a different scheduler if no confirmation is received
        // within 5 seconds
        setTimeout(() => {
            if (!this.confirmed.get(job)) this.sendToScheduler(message);
            else this.confirmed.delete(job);
        }, 5000);
    }
}
