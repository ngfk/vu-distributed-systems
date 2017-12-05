import { NodeType } from '../models/node-type';
import { GridMessage } from './grid-message';
import { GridNode } from './grid-node';
import { GridSocket } from './grid-socket';

export class GridResourceManager extends GridNode {
    public workerSockets: GridSocket[] = [];

    constructor() {
        super(NodeType.ResourceManager);
    }

    public async run(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public onMessage(message: GridMessage): void {
        throw new Error('Method not implemented.');
    }
}
