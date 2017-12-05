import { delay } from '../utils/delay';
import { randomRange } from '../utils/random';
import { GridMessage } from './grid-message';
import { GridNode } from './grid-node';

export class GridSocket {
    constructor(private receiver: GridNode) {}

    public async send(message: GridMessage): Promise<void> {
        await delay(randomRange(0, 50));
        this.receiver.onMessage(message);
    }
}
