import { GridSetup } from '../models/grid-setup';
import { JobCountSetter } from './grid-context';
import { ResourceManagerNode } from './resource-manager';
import { SchedulerNode } from './scheduler';
import { Socket } from './socket';
import { UserNode } from './user';
import { WorkerNode } from './worker';

export class Simulation {
    private user: UserNode;
    private schedulers: SchedulerNode[] = [];
    private resourceManagers: ResourceManagerNode[] = [];
    private workers: { [rmId: string]: WorkerNode[] } = {};

    constructor(
        schedulerCount: number,
        clusterCount: number,
        workerCount: number,
        jcs: JobCountSetter = () => {}
    ) {
        this.user = new UserNode();

        const rmSockets: Socket[] = [];
        for (let c = 0; c < clusterCount; c++) {
            const rm = new ResourceManagerNode();
            this.resourceManagers.push(rm);
            this.workers[rm.id] = [];
            rmSockets.push(rm.socket);

            const workerSockets: Socket[] = [];
            for (let w = 0; w < workerCount; w++) {
                const worker = new WorkerNode().registerJobCountSetter(jcs);
                this.workers[rm.id].push(worker);
                workerSockets.push(worker.socket);
            }

            rm.registerWorkers(workerSockets).registerJobCountSetter(jcs);
        }

        const schedulerSockets: Socket[] = [];
        for (let s = 0; s < schedulerCount; s++) {
            const scheduler = new SchedulerNode();
            this.schedulers.push(scheduler);
            schedulerSockets.push(scheduler.socket);
        }

        this.schedulers.forEach(scheduler => {
            scheduler
                .registerSchedulers(schedulerSockets)
                .registerResourceManagers(rmSockets)
                .registerJobCountSetter(jcs);
        });

        this.user
            .registerSchedulers(schedulerSockets)
            .registerJobCountSetter(jcs);

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
