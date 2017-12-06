import { delay } from '../utils/delay';
import { randomRange } from '../utils/random';
import { GridMessage, MessageType } from './grid-message';
import { GridNode } from './grid-node';

export class GridSocket {
    constructor(private receiver: GridNode) {}

    public async send(message: GridMessage): Promise<void> {
        if (message.type === MessageType.Ping) {
            let msg = `[${message.type}]`;
            msg += ` ${message.sender} -> ${this.receiver.type}`;
            console.log(msg);
        }

        await delay(randomRange(0, 200));
        this.receiver.onMessage(message);
    }
}
