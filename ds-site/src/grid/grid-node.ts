import { NodeType } from '../models/node-type';
import { uuid } from '../utils/uuid';

export enum NodeStatus {
    Available,
    Busy,
    Dead
}

export class GridNode {
    protected id = uuid();
    protected status = NodeStatus.Available;
    protected type: NodeType;
}
