import { GridResourceManager } from './grid-resource-manager';
import { GridScheduler } from './grid-scheduler';
import { GridSocket } from './grid-socket';
import { GridUser } from './grid-user';
import { GridWorker } from './grid-worker';

export class Simulation {
    private user: GridUser;
    private schedulers: GridScheduler[] = [];
    private resourceManagers: GridResourceManager[] = [];
    private workers: { [id: string]: GridWorker } = {};

    constructor(
        schedulerCount: number,
        clusterCount: number,
        workerCount: number
    ) {
        this.user = new GridUser();

        const rmSockets: GridSocket[] = [];
        for (let c = 0; c < clusterCount; c++) {
            const rm = new GridResourceManager();
            this.resourceManagers.push(rm);
            rmSockets.push(rm.socket);

            for (let w = 0; w < workerCount; w++) {
                const worker = new GridWorker();
                this.workers[rm.id] = worker;
                rm.workerSockets.push(worker.socket);
            }
        }

        const schedulerSockets: GridSocket[] = [];
        for (let s = 0; s < schedulerCount; s++) {
            const scheduler = new GridScheduler();
            this.schedulers.push(scheduler);
            schedulerSockets.push(scheduler.socket);
        }

        this.schedulers.forEach(s => {
            s.registerResourceManagers(rmSockets);
            s.registerSchedulers(schedulerSockets);
        });

        this.user.registerSchedulers(schedulerSockets);
    }

    public start(): void {
        this.user.test();
    }
}
