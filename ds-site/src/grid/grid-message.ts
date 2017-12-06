import { NodeType } from '../models/node-type';
import { GridJob } from './grid-job';
import { GridSocket } from './grid-socket';

export enum MessageType {
    Status = 'status',
    Request = 'request',
    Confirmation = 'confirmation',
    Result = 'result',
    Acknowledgement = 'acknowledgement',
    Ping = 'ping'
}

export class GridMessage {
    private job: GridJob;

    constructor(
        public readonly senderSocket: GridSocket,
        public readonly sender: NodeType,
        public readonly type: MessageType,
        public readonly value: string
    ) {}

    public getJob(): GridJob {
        return this.job;
    }

    public attachJob(job: GridJob): void {
        this.job = job;
    }
}
