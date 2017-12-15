import { setTimeout } from 'timers';

import { NodeType } from '../models/node-type';
import { randomRange } from '../utils/random';
import { sleep } from '../utils/sleep';
import { Job } from './job';
import { Message, MessageType } from './message';
import { GridNode, NodeStatus } from './node';
import { Socket } from './socket';

export class SchedulerNode extends GridNode {
    /**
     * Collection of all registered schedulers.
     */
    private schedulers = new Set<Socket>();

    /**
     * Collection of active schedulers, kept up to date by schedulers pinging
     * each other.
     */
    private activeSchedulers = new Set<Socket>();

    /**
     * Collection of all registered resource managers.
     */
    private resourceManagers = new Set<Socket>();

    /**
     * Collection of jobs that have to be processed by this scheduler.
     */
    private jobs = new Set<Job>();

    /**
     * Map used to keep track of pings that are unconfirmed.
     */
    private pingConfirmed = new Map<Socket, boolean>();

    /**
     * Map used to keep track, per job, which scheduler syncs are unconfirmed.
     */
    private syncConfirmed = new Map<Job, Map<Socket, boolean>>();

    /**
     * Map used to keep track, per job, which scheduler results are unconfirmed.
     */
    private resultConfirmed = new Map<Job, Map<Socket, boolean>>();

    /**
     * Map used to keep track of user messages that are unconfirmed.
     */
    private userConfirmed = new Map<Job, boolean>();

    /**
     * Map used to keep track of resource manager messages that are unconfirmed.
     */
    private rmConfirmed = new Map<Job, boolean>();

    constructor() {
        super(NodeType.Scheduler);
    }

    /**
     * Registers the provided scheduler as usable by this scheduler, will
     * ignore self.
     * @param scheduler The scheduler socket to register.
     */
    public registerScheduler(scheduler: Socket): this {
        if (scheduler === this.socket) return this;
        this.schedulers.add(scheduler);
        this.activeSchedulers.add(scheduler);
        return this;
    }

    /**
     * Registers the provided schedulers as usable by this scheduler, will
     * ignore self.
     * @param schedulers The scheduler sockets to register.
     */
    public registerSchedulers(schedulers: Socket[]): this {
        schedulers.forEach(scheduler => this.registerScheduler(scheduler));
        return this;
    }

    /**
     * Registers the provided resource manager as usable by this scheduler.
     * @param resourceManager The resource manager to register.
     */
    public registerResourceManager(resourceManager: Socket): this {
        this.resourceManagers.add(resourceManager);
        return this;
    }

    /**
     * Registers the provided resource managers as usable by this scheduler.
     * @param resourceManagers The resource managers to register.
     */
    public registerResourceManagers(resourceManagers: Socket[]): this {
        resourceManagers.forEach(resourceManager => {
            this.registerResourceManager(resourceManager);
        });
        return this;
    }

    /**
     * The run method is constantly triggered from the base class. The
     * schedulers ping each other every 5 seconds.
     */
    public async run(): Promise<void> {
        const ping = new Message(this, MessageType.Ping, undefined as any);

        for (const scheduler of this.schedulers) {
            // Send ping to other schedulers
            scheduler.send(ping);

            // Set ping confirmation to false
            this.pingConfirmed.set(scheduler, false);
            setTimeout(() => {
                if (!this.pingConfirmed.get(scheduler)) {
                    // No ping ack within 2 seconds, assume scheduler is down
                    this.activeSchedulers.delete(scheduler);
                } else {
                    // Ping ack received, add scheduler to set. Since it is a
                    // set there will not be any duplicates.
                    this.activeSchedulers.add(scheduler);
                }
            }, 2000);
        }

        await sleep(5000);
    }

    /**
     * Executed when a message is received.
     * @param message The message.
     */
    public onMessage(message: Message): void {
        switch (message.from.type) {
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

    /**
     * Executed when a message is received from a user.
     * @param message The message
     */
    private onUserMessage(message: Message): void {
        switch (message.type) {
            case MessageType.Request:
                this.onUserRequest(message);
                break;
            case MessageType.Confirmation:
                this.onUserConfirmation(message);
                break;
        }
    }

    /**
     * Executed when a message is received from another scheduler.
     * @param message The message
     */
    private onSchedulerMessage(message: Message): void {
        switch (message.type) {
            case MessageType.Ping:
                this.onSchedulerPing(message);
                break;
            case MessageType.PingAck:
                this.onSchedulerPingAck(message);
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

    /**
     * Executed when a message is received from a resource manager.
     * @param message The message
     */
    private onResourceManagerMessage(message: Message): void {
        switch (message.type) {
            case MessageType.Confirmation:
                this.onResourceManagerConfirm(message);
                break;
            case MessageType.Result:
                this.onResourceManagerResult(message);
                break;
        }
    }

    /**
     * Executed when a request message is received from a user.
     * @param message The message
     */
    private onUserRequest(message: Message): void {
        const { job } = message;

        // Register active job
        this.jobs.add(job);
        this.setJobCount(this.jobs.size);

        // No other schedulers, skip synchronization
        if (this.schedulers.size === 0) {
            this.scheduleJob(job);
        }

        // Synchronize with other schedulers (fig 2, step 2)
        const schedulerSyncConfirmed = new Map<Socket, boolean>();
        for (const scheduler of this.activeSchedulers) {
            // Register unconfirmed sync
            schedulerSyncConfirmed.set(scheduler, false);

            // Send sync request
            const request = new Message(this, MessageType.Request, job);
            scheduler.send(request);
        }

        // Wrap map in job map, every job needs a separate sync confirm map
        this.syncConfirmed.set(job, schedulerSyncConfirmed);
        setTimeout(() => {
            if (this.status === NodeStatus.Dead) return;

            const values = schedulerSyncConfirmed.values();
            const allConfirmed = Array.from(values).every(val => !!val);

            if (!allConfirmed) {
                // Send anyway other scheduler might be down
                this.scheduleJob(job);
            } else {
                // Should already be sent
                this.syncConfirmed.delete(job);
            }
        }, 10000);
    }

    /**
     * Executed when a confirmation message is received from a user.
     * @param message The message
     */
    private onUserConfirmation(message: Message): void {
        const { job } = message;

        // Register as confirmed
        this.userConfirmed.set(job, true);

        // Update job count
        this.jobs.delete(job);
        this.setJobCount(this.jobs.size);

        // Synchronize with other schedulers (fig 2, step 13)
        const schedulerAckMap = new Map<Socket, boolean>();
        for (const scheduler of this.activeSchedulers) {
            // Register as unconfirmed
            schedulerAckMap.set(scheduler, false);

            // Send the message
            const result = new Message(this, MessageType.Result, job);
            scheduler.send(result);
        }

        this.resultConfirmed.set(job, schedulerAckMap);
        // setTimeout(() => {
        //     const values = schedulerAckMap.values();
        //     const allConfirmed = Array.from(values).every(val => !!val);

        //     if (!allConfirmed) {
        //         //
        //     } else {
        //         this.jobs.delete(job);
        //         this.setJobCount(this.jobs.size);
        //     }
        // }, 10000);
    }

    /**
     * Executed when a ping message is received from another scheduler.
     * @param message The message
     */
    private onSchedulerPing(message: Message): void {
        // Return a ping-ack
        const pingAck = new Message(
            this,
            MessageType.PingAck,
            undefined as any
        );
        message.from.send(pingAck);
    }

    /**
     * Executed when a ping-ack message is received from another scheduler.
     * @param message The message
     */
    private onSchedulerPingAck(message: Message): void {
        // Register ping-ack
        this.pingConfirmed.set(message.from, true);
    }

    /**
     * Executed when a request message is received from another scheduler.
     * @param message The message
     */
    private onSchedulerRequest(message: Message): void {
        const { job } = message;

        // Add to own jobs
        this.jobs.add(job);
        this.setJobCount(this.jobs.size);

        // Send back confirmation (fig 2, step 3)
        const confirmation = new Message(this, MessageType.Confirmation, job);
        message.from.send(confirmation);
    }

    /**
     * Executed when a confirmation message is received from another scheduler.
     * @param message The message
     */
    private onSchedulerConfirmation(message: Message): void {
        const { job } = message;

        // Register as confirmed
        const schedulerSyncConfirmed = this.syncConfirmed.get(job);
        if (!schedulerSyncConfirmed)
            throw new Error('No sync map found for scheduler confirmation');
        schedulerSyncConfirmed.set(message.from, true);

        const values = schedulerSyncConfirmed.values();
        const allConfirmed = Array.from(values).every(val => !!val);

        // Schedule job if all schedulers confirmed the sync.
        if (allConfirmed) {
            this.scheduleJob(job);
        }
    }

    /**
     * Executed when a result message is received from another scheduler.
     * @param message The message
     */
    private onSchedulerResult(message: Message): void {
        const { job } = message;

        // Remove from job count
        this.jobs.delete(job);
        this.setJobCount(this.jobs.size);

        // Return acknowledgement
        const ack = new Message(this, MessageType.Acknowledgement, job);
        message.from.send(ack);
    }

    /**
     * Executed when an acknowledgement message is received from another
     * scheduler.
     * @param message The message
     */
    private onSchedulerAcknowledgement(message: Message): void {
        const { job } = message;

        // Register as confirmed
        const ackConfirmedMap = this.resultConfirmed.get(job);
        if (!ackConfirmedMap)
            throw new Error('No sync map found for scheduler acknowledgement');
        ackConfirmedMap.set(message.from, true);

        const values = ackConfirmedMap.values();
        const allConfirmed = Array.from(values).every(val => !!val);

        if (allConfirmed) {
            this.jobs.delete(job);
            this.setJobCount(this.jobs.size);
        }
    }

    /**
     * Executed when a confirm message is received from a resource manager.
     * @param message The message
     */
    private onResourceManagerConfirm(message: Message): void {
        this.rmConfirmed.set(message.job, true);
    }

    /**
     * Executed when a result message is received from a resource manager.
     * @param message The message
     */
    private onResourceManagerResult(message: Message): void {
        const { job } = message;

        // Send result to user
        const result = new Message(this, MessageType.Result, job);
        this.sendToUser(result);
    }

    /**
     * Schedules the provided job, confirming to the user and sending it to a
     * resource manager.
     * @param job The job to schedule
     */
    private scheduleJob(job: Job): void {
        // Send confirmation to user (fig 2, step 4)
        const confirmation = new Message(this, MessageType.Confirmation, job);
        job.origin.send(confirmation);

        // Forward job to resource manager
        const request = new Message(this, MessageType.Request, job);
        this.sendToResourceManager(request);
    }

    /**
     * Picks a random resource manager and sends the message to it. If no
     * confirmation is received within 5 seconds the message is sent to another
     * resource manager.
     * @param message The message to send
     */
    private sendToResourceManager(message: Message): void {
        const { job } = message;

        // Pick a resource manager & send the message (fig 2, step 5)
        const max = this.resourceManagers.size - 1;
        const resourceManagerIdx = randomRange(0, max);
        const resourceManager = [...this.resourceManagers][resourceManagerIdx];
        resourceManager.send(message);

        // Register job as unconfirmed
        this.rmConfirmed.set(job, false);

        // Retry using a different resource manager if no confirmation is
        // received within 5 seconds
        setTimeout(() => {
            if (!this.rmConfirmed.get(job)) this.sendToResourceManager(message);
            else this.rmConfirmed.delete(job);
        }, 5000);
    }

    /**
     * Sends the message to a user. If no confirmation is received within 5
     * seconds the message is resent.
     * @param message The message to send
     */
    private sendToUser(message: Message): void {
        const { job } = message;

        // Send the message (fig 2, step 11)
        job.origin.send(message);
        this.userConfirmed.set(job, false);

        // Retry if no confirmation is received within 5 seconds
        setTimeout(() => {
            if (!this.userConfirmed.get(job)) this.sendToUser(message);
            else this.userConfirmed.delete(job);
            // TODO: abort case with retry counter
        }, 5000);
    }
}
