import { GridSetup } from '../models/grid-setup';
import { GridContext } from './grid-context';
import { GridResourceManager } from './grid-resource-manager';
import { GridScheduler } from './grid-scheduler';
import { GridSocket } from './grid-socket';
import { GridUser } from './grid-user';
import { GridWorker } from './grid-worker';

export class Simulation {
    private user: GridUser;
    private schedulers: GridScheduler[] = [];
    private resourceManagers: GridResourceManager[] = [];
    private workers: { [rmId: string]: GridWorker[] } = {};

    constructor(private context: GridContext) {
        this.user = new GridUser(context);

        const rmSockets: GridSocket[] = [];
        for (let c = 0; c < context.clusters; c++) {
            const rm = new GridResourceManager(context);
            this.resourceManagers.push(rm);
            this.workers[rm.id] = [];
            rmSockets.push(rm.socket);

            const workerSockets: GridSocket[] = [];
            for (let w = 0; w < context.workers; w++) {
                const worker = new GridWorker(context);
                this.workers[rm.id].push(worker);
                workerSockets.push(worker.socket);
            }

            rm.registerWorkers(workerSockets);
        }

        const schedulerSockets: GridSocket[] = [];
        for (let s = 0; s < context.schedulers; s++) {
            const scheduler = new GridScheduler(context);
            this.schedulers.push(scheduler);
            schedulerSockets.push(scheduler.socket);
        }

        this.schedulers.forEach(s => {
            s.registerSchedulers(schedulerSockets);
            s.registerResourceManagers(rmSockets);
        });

        this.user.registerSchedulers(schedulerSockets);
        console.log('Simulation initialized...');
    }

    /**
     * Starts the simulation.
     */
    public async start(): Promise<void> {
        this.user.start();
        this.schedulers.forEach(s => s.start());
        this.resourceManagers.forEach(rm => rm.start());
    }

    /**
     * Stops the simulation.
     * Note: this only only prevents the `run` methods on every node from
     * being executed. Every message that was still in the simulation will
     * continue its path until finished or lost.
     */
    public stop(): void {
        this.user.stop();
        this.schedulers.forEach(s => s.stop());
        this.resourceManagers.forEach(rm => rm.stop());
    }

    /**
     * Toggles the current state of a scheduler.
     * @param nodeId The scheduler id
     */
    public toggleScheduler(nodeId: string): void {
        const scheduler = this.schedulers.find(s => s.id === nodeId);
        if (scheduler) scheduler.toggleStatus();
    }

    /**
     * Toggles the current state of a resource manager.
     * @param nodeId The resource-manager id
     */
    public toggleResourceManager(nodeId: string): void {
        const resourceManager = this.resourceManagers.find(
            rm => rm.id === nodeId
        );
        if (resourceManager) resourceManager.toggleStatus();
    }

    /**
     * Toggles the current state of a worker.
     * @param nodeId The worker id
     */
    public toggleWorker(nodeId: string): void {
        for (const rmId in this.workers) {
            const worker = this.workers[rmId].find(w => w.id === nodeId);
            if (worker) worker.toggleStatus();
        }
    }

    /**
     * Retrieves the structure of id's. This can be used to setup the
     * interface with the same id's as the simulation.
     */
    public getSetup(): GridSetup {
        return {
            user: this.user.id,
            schedulers: this.schedulers.map(s => s.id),
            clusters: this.resourceManagers.map(rm => ({
                resourceManager: rm.id,
                workers: this.workers[rm.id].map(w => w.id)
            }))
        };
    }
}
