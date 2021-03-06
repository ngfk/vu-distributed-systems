import { Job } from './job';
import { GridNode } from './node';
import { Socket } from './socket';

export enum MessageType {
    Request = 'request',
    Confirmation = 'confirmation',
    Result = 'result',
    Acknowledgement = 'acknowledgement',
    Ping = 'ping',
    PingAck = 'ping-ack'
}

export class Message {
    /**
     * The socket of the message sender.
     */
    public readonly from: Socket;

    /**
     * The message type.
     */
    public readonly type: MessageType;

    /**
     * Optional. The job to be sent.
     */
    public readonly job: Job;

    constructor(from: GridNode, type: MessageType, job: Job) {
        this.from = from.socket;
        this.type = type;
        this.job = job;
    }
}
