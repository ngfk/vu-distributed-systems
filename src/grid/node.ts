import { NodeType } from '../models/node-type';
import { sleep } from '../utils/sleep';
import { uuid } from '../utils/uuid';
import { JobCountSetter } from './grid-context';
import { Message } from './message';
import { Socket } from './socket';

export enum NodeStatus {
    Available,
    Dead
}

export abstract class GridNode {
    public readonly id: string;
    public readonly type: NodeType;
    public readonly socket: Socket;
    public status: NodeStatus;

    private running: boolean;
    private jobCountSetter: JobCountSetter;

    constructor(type: NodeType) {
        this.id = uuid();
        this.status = NodeStatus.Available;
        this.type = type;
        this.socket = new Socket(this);
    }

    public registerJobCountSetter(handler: JobCountSetter): this {
        this.jobCountSetter = handler;
        return this;
    }

    public async start(): Promise<void> {
        this.running = true;

        while (this.running) {
            if (this.status !== NodeStatus.Dead) await this.run();
            await sleep(200);
        }
    }

    public stop(): void {
        this.running = false;
    }

    public toggleStatus(): void {
        this.status =
            this.status === NodeStatus.Dead
                ? NodeStatus.Available
                : NodeStatus.Dead;
    }

    public setJobCount(jobCount: number): void {
        if (this.jobCountSetter)
            this.jobCountSetter(this.type, this.id, jobCount);
    }

    public abstract async run(): Promise<void>;
    public abstract onMessage(message: Message): void;
}
