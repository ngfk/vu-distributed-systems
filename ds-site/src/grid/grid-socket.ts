import { Message } from '_debugger';

import { delay } from '../utils/delay';
import { randomRange } from '../utils/random';
import { GridNode } from './grid-node';

export class GridSocket {
    private source: GridNode;

    public async send(message: Message): Promise<void> {
        const wait = randomRange(0, 50);
        await delay(wait);
    }
}
