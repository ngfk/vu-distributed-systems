import { randomRange } from '../utils/random';
import { wait } from '../utils/wait';
import { GridMessage } from './grid-message';
import { GridNode } from './grid-node';

export class GridSocket {
    constructor(private receiver: GridNode) {}

    public async send(message: GridMessage): Promise<void> {
        // if (message.type !== MessageType.Ping) {
        //     let msg = `[${message.type}]`;
        //     msg += ` ${message.sender} -> ${this.receiver.type}`;
        //     console.log(msg);
        // }

        await wait(randomRange(0, 200));
        this.receiver.onMessage(message);
    }
}
