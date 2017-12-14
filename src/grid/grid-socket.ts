import { randomRange } from '../utils/random';
import { wait } from '../utils/wait';
import { GridMessage } from './grid-message';
import { GridNode } from './grid-node';

/**
 * The GridSocket class is used to fake a socket connection between nodes.
 * Whenever a message is send to this socket a random delay will be added
 * before actually delivering the message.
 */
export class GridSocket {
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
    }

    /**
     * Asynchronously sends the provided message to the owner of this socket. A
     * random delay will be used before delivering the message.
     * @param message The message to send
     */
    public async send(message: GridMessage): Promise<void> {
        // TODO: make this a context option, useful when running tests.
        // if (message.type !== MessageType.Ping) {
        //     let msg = `[${message.type}]`;
        //     msg += ` ${message.sender} -> ${this.receiver.type}`;
        //     console.log(msg);
        // }

        // Delay the delivery of the message.
        await wait(randomRange(0, 200));

        // Send the message to the receiver.
        this.receiver.onMessage(message);
    }
}
