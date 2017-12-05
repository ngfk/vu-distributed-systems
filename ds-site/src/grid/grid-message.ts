import { GridNode } from './grid-node';
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
    private sender: GridNode;
    private type: MessageType;

    private socket: GridSocket;
}
