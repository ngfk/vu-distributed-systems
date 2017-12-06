import { NodeType } from '../models/node-type';
import { delay } from '../utils/delay';
import { uuid } from '../utils/uuid';
import { GridMessage } from './grid-message';
import { GridSocket } from './grid-socket';

export enum NodeStatus {
    Available,
    Busy,
    Dead,
    Reserved
}

export abstract class GridNode {
    public readonly id: string;
    public status: NodeStatus;
    public readonly type: NodeType;
    public readonly socket: GridSocket;

    private running: boolean;

    constructor(type: NodeType) {
        this.id = uuid();
        this.status = NodeStatus.Available;
        this.type = type;
        this.socket = new GridSocket(this);
    }

    public async start(): Promise<void> {
        while (this.running) {
            await this.run();
            await delay(200);
        }
    }

    public stop(): void {
        this.running = false;
    }

    public abstract async run(): Promise<void>;
    public abstract onMessage(message: GridMessage): void;
}
