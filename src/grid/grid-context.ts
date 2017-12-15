import { GridSetupParams } from '../models/grid-setup';
import { NodeType } from '../models/node-type';

/**
 * Function type definition to set the job count on the interface.
 */
export type JobCountSetter = (
    nodeType: NodeType,
    nodeId: string,
    jobCount: number
) => void;

/**
 * Defines the context of a grid.
 */
export class GridContext implements GridSetupParams {
    /**
     * The amount of schedulers that should be created.
     */
    public readonly schedulers: number;

    /**
     * The amount of clusters that should be created.
     */
    public readonly clusters: number;

    /**
     * The amount of workers that should be created.
     */
    public readonly workers: number;

    /**
     * Jobs is an option job count. If set, instead of constantly generating
     * jobs, only the provided amount of jobs will be created.
     */
    public jobs?: number;

    /**
     * Used to provide a callback function to forward the change of job counts
     * to the interface. Can be omitted to not connect to an interface.
     */
    public sendJobCount?: JobCountSetter;

    /**
     * Creates a new instance of the grid context.
     * @param schedulerCount the amount of schedulers
     * @param clusterCount the amount of clusters
     * @param workerCount the amount of workers
     */
    constructor(
        schedulerCount: number,
        clusterCount: number,
        workerCount: number
    ) {
        this.schedulers = schedulerCount;
        this.clusters = clusterCount;
        this.workers = workerCount;
    }

    public setJobCount(count: number): this {
        this.jobs = count;
        return this;
    }
}
