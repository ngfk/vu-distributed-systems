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
     * Map used to keep track of messages that are unconfirmed.
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
     * The run method is constantly triggered from the base class. The user
     * will constantly dispatch jobs.
     */
    public async run(): Promise<void> {
        this.dispatchJob();

        // Wait 200ms to 500ms before dispatching a new job.
        const delay = randomRange(200, 500);
        await sleep(delay);
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
     * Executed when a confirmation message is received from a scheduler.
     * @param message The message.
     */
    private onConfirmation(message: Message): void {
        // Register as confirmed
        this.confirmed.set(message.job, true);
    }

    /**
     * Executed when a result message is received from a scheduler. A
     * confirmation message is sent to the scheduler.
     * @param message The message.
     */
    private onResult(message: Message): void {
        const { job } = message;

        // Send confirmation to scheduler (fig 2 step 12)
        const confirmation = new Message(this, MessageType.Confirmation, job);
        message.from.send(confirmation);

        // Remove from active jobs
        this.submittedJobs.delete(job);
        this.setJobCount(this.submittedJobs.size);
    }

    /**
     * Picks a random scheduler and sends the message to it. If no confirmation
     * is received within 5 seconds the message is sent to another scheduler.
     * @param message The message to send
     */
    private sendToScheduler(message: Message): void {
        const { job } = message;

        // Pick a random scheduler & send the message (fig 2, step 1)
        const schedulerIdx = randomRange(0, this.schedulers.size - 1);
        const scheduler = [...this.schedulers][schedulerIdx];
        scheduler.send(message);

        // Register job as unconfirmed
        this.confirmed.set(job, false);

        // Retry using a different scheduler if no confirmation is received
        // within 5 seconds
        setTimeout(() => {
            if (!this.confirmed.get(job)) this.sendToScheduler(message);
            else this.confirmed.delete(job);
        }, 5000);
    }
}
