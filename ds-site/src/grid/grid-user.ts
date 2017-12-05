import { NodeType } from '../models/node-type';
import { randomRange } from '../utils/random';
import { GridActiveJob } from './grid-active-job';
import { GridJob } from './grid-job';
import { GridMessage, MessageType } from './grid-message';
import { GridNode } from './grid-node';
import { GridSocket } from './grid-socket';

export class GridUser extends GridNode {
    private schedulers: GridSocket[] = [];
    private jobs: GridActiveJob[] = [];

    constructor() {
        super(NodeType.User);
    }

    /**
     * Temporary
     */
    public test(): void {
        for (let i = 0; i < 1; i++) {
            const job = new GridJob(this.socket, randomRange(0, 5000));
            this.executeJob(job);
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

    private executeJob(job: GridJob): void {
        const idx = randomRange(0, this.schedulers.length - 1);
        const scheduler = this.schedulers[idx];

        const message = new GridMessage(
            this.socket,
            NodeType.User,
            MessageType.Request,
            job.id
        );
        message.attachJob(job);

        this.jobs.push(new GridActiveJob(job));
        scheduler.send(message);
    }
}
