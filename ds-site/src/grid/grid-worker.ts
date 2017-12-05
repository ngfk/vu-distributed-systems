import { NodeType } from '../models/node-type';
import { GridMessage } from './grid-message';
import { GridNode } from './grid-node';

export class GridWorker extends GridNode {
    constructor() {
        super(NodeType.Worker);
    }

    public async run(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public onMessage(message: GridMessage): void {
        throw new Error('Method not implemented.');
    }
}
