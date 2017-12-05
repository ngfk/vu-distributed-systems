import { NodeType } from '../models/node-type';
import { GridMessage } from './grid-message';
import { GridNode } from './grid-node';
import { GridSocket } from './grid-socket';

export class GridScheduler extends GridNode {
    private schedulers: GridSocket[];
    private resourceManagers: GridSocket[];

    constructor() {
        super(NodeType.Scheduler);
    }

    public registerResourceManagers(resourceManagers: GridSocket[]): void {
        this.resourceManagers = resourceManagers;
    }

    public registerSchedulers(schedulers: GridSocket[]): void {
        this.schedulers = schedulers.filter(s => s !== this.socket);
    }

    public async run(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public onMessage(message: GridMessage): void {
        throw new Error('Method not implemented.');
    }
}
