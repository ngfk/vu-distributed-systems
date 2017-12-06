import { NodeType } from '../models/node-type';
import { delay } from '../utils/delay';
import { uuid } from '../utils/uuid';
import { GridMessage, MessageType } from './grid-message';
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
        this.running = true;

        while (this.running) {
            if (this.status !== NodeStatus.Dead) await this.run();
            await delay(200);
        }
    }

    public stop(): void {
        this.running = false;
    }

    public createMessage(type: MessageType, value = 0): GridMessage {
        return new GridMessage(this.socket, this.type, type, value);
    }

    public abstract async run(): Promise<void>;
    public abstract onMessage(message: GridMessage): void;
}
