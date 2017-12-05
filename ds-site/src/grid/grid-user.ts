import { NodeType } from '../models/node-type';
import { randomRange } from '../utils/random';
import { GridJob } from './grid-job';
import { GridMessage } from './grid-message';
import { GridNode } from './grid-node';
import { GridSocket } from './grid-socket';

export class GridUser extends GridNode {
    private schedulers: GridSocket[];
    private interval: any;

    constructor() {
        super(NodeType.User);

        for (let i = 0; i < 10; i++) {
            const job = new GridJob(this.socket, randomRange(0, 5000));
        }
    }

    public registerSchedulers(schedulers: GridSocket[]): void {
        this.schedulers = schedulers;
    }

    public async run(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public onMessage(message: GridMessage): void {
        throw new Error('Method not implemented.');
    }

    private executeJob(job: GridJob): void {}
}
