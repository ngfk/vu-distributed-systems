import { NodeState } from '../models/node';

export const getNodeColor = (state: NodeState): string => {
    switch (state) {
        case NodeState.Online:
            return 'green';
        case NodeState.Offline:
            return 'red';
        case NodeState.Busy:
            return 'orange';
        case NodeState.Unreachable:
            return 'gray';
        default:
            return 'purple';
    }
};
