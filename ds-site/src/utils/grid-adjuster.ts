import {
    Cluster,
    Grid,
    GridNodeMap,
    ResourceManager,
    Scheduler,
    Worker
} from '../models/grid';
import { NodeType } from '../models/node';

export type Modifier<T> = (old: T) => T;
export type Adjuster<T, E = T> = (
    collection: T[],
    id: string,
    modifier: Modifier<E>
) => T[];

export const adjustScheduler: Adjuster<Scheduler> = (
    schedulers,
    id,
    modifier
) => {
    return schedulers.map(scheduler => {
        if (scheduler.id === id) return modifier(scheduler);
        return scheduler;
    });
};

export const adjustResourceManager: Adjuster<Cluster, ResourceManager> = (
    clusters,
    id,
    modifier
) => {
    return clusters.map(cluster => {
        if (cluster.resourceManager.id === id) {
            const resourceManager = modifier(cluster.resourceManager);
            return { ...cluster, resourceManager };
        }

        return cluster;
    });
};

export const adjustWorker: Adjuster<Cluster, Worker> = (
    clusters,
    id,
    modifier
) => {
    return clusters.map(cluster => {
        const workers = cluster.workers.map(worker => {
            if (worker.id === id) return modifier(worker);
            return worker;
        });

        return { ...cluster, workers };
    });
};

export const adjustNode = <T extends NodeType>(
    grid: Grid,
    id: string,
    type: T,
    modifier: Modifier<GridNodeMap[T]>
): Grid => {
    switch (type) {
        case NodeType.Scheduler: {
            const schedulers = adjustScheduler(
                grid.schedulers,
                id,
                modifier as Modifier<Scheduler>
            );
            return { ...grid, schedulers };
        }
        case NodeType.ResourceManager: {
            const clusters = adjustResourceManager(
                grid.clusters,
                id,
                modifier as Modifier<ResourceManager>
            );
            return { ...grid, clusters };
        }
        case NodeType.Worker: {
            const clusters = adjustWorker(
                grid.clusters,
                id,
                modifier as Modifier<Worker>
            );
            return { ...grid, clusters };
        }
        default:
            return grid;
    }
};
