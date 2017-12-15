import { NodeType } from '../models/node-type';
import { randomRange } from '../utils/random';
import { sleep } from '../utils/sleep';
import { Message } from './message';
import { GridNode } from './node';

/**
 * The Socket class is used to fake a socket connection between nodes. Whenever
 * a message is sent to this socket a random delay will be added before
 * actually delivering the message.
 */
export class Socket {
    /**
     * Boolean value used to disable the delay when executing tests.
     */
    public static DELAY = true;

    /**
     * The type of the receiver node.
     */
    public readonly type: NodeType;

    /**
     * The owner/receiver of this socket.
     */
    private receiver: GridNode;

    /**
     * Creates a new instance of the GridSocket class.
     * @param receiver The owner/receiver of this socket
     */
    constructor(receiver: GridNode) {
        this.receiver = receiver;
        this.type = this.receiver.type;
    }

    /**
     * Asynchronously sends the provided message to the owner of this socket. A
     * random delay will be used before delivering the message.
     * @param message The message to send
     */
    public async send(message: Message): Promise<void> {
        // if (
        //     message.type !== MessageType.Ping &&
        //     message.type !== MessageType.PingAck
        // ) {
        //     let msg = `[${message.type}]`;
        //     msg += ` ${message.from.type} -> ${this.receiver.type}`;
        //     console.log(msg);
        // }

        if (Socket.DELAY) {
            // Delay the delivery of the message.
            const duration = randomRange(0, 200);
            await sleep(duration);
        }

        // Send the message to the receiver.
        this.receiver.onMessage(message);
    }
}
