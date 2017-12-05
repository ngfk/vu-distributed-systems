import { NodeType } from '../models/node-type';
import { GridJob } from './grid-job';
import { GridSocket } from './grid-socket';

export enum MessageType {
    Status,
    Request,
    Confirmation,
    Result,
    Acknowledgement,
    Ping
}

export class GridMessage {
    private job: GridJob;

    constructor(
        public readonly socket: GridSocket,
        public readonly sender: NodeType,
        public readonly type: MessageType,
        public readonly value: number
    ) {}

    public attachJob(job: GridJob): void {
        this.job = job.copy();
    }
}
