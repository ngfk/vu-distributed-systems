import { GridSetupParams } from '../models/grid-setup';
import { NodeType } from '../models/node-type';

export interface GridContext extends GridSetupParams {
    jobs?: number;
    sendJobCount: (
        nodeType: NodeType,
        nodeId: string,
        jobCount: number
    ) => void;
}
