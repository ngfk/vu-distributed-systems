import { GridSetupParams } from '../models/grid-setup';
import { NodeType } from '../models/node-type';

/**
 * Function type definition to set the job count on the interface
 */
export type JobCountSetter = (
    nodeType: NodeType,
    nodeId: string,
    jobCount: number
) => void;

/**
 * Defines the context of a grid.
 */
export interface GridContext extends GridSetupParams {
    /**
     * Jobs is an option job count. If set, instead of constantly generating
     * jobs, only the provided amount of jobs will be created.
     */
    jobs?: number;

    /**
     * Used to provide a callback function to forward the change of job counts
     * to the interface. Can be omitted to not connect to an interface.
     */
    sendJobCount?: JobCountSetter;
}
