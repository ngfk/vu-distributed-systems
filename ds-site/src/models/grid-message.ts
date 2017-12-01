import { GridSetup } from './grid';
import { NodeState, NodeType } from './node';

export interface GridMessage {
    readonly type: string;
}

export interface GridMessageInit extends GridMessage {
    readonly type: 'init';
    readonly sizes: {
        readonly schedulers: number;
        readonly clusters: number;
        readonly workers: number;
    };
}

export interface GridMessageSetup extends GridMessage {
    readonly type: 'setup';
    readonly grid: GridSetup;
}

export interface GridMessageState extends GridMessage {
    readonly type: 'state';
    readonly nodeId: number;
    readonly nodeType: NodeType;
    readonly nodeState: NodeState;
}

export interface GridMessageData extends GridMessage {
    readonly type: 'data';
    readonly nodeId: number;
    readonly nodeType: NodeType;
    readonly data: any;
}

export interface GridMessageStart extends GridMessage {
    readonly type: 'start';
}

export interface GridMessageStop extends GridMessage {
    readonly type: 'stop';
}

export interface GridMessageToggle extends GridMessage {
    readonly type: 'toggle';
    readonly nodeId: number;
    readonly nodeType: NodeType;
}

/**
 * Only includes the grid messages that are going to the grid back-end.
 */
export type OutgoingGridMessage =
    | GridMessageInit
    | GridMessageStart
    | GridMessageStop
    | GridMessageToggle;

/**
 * Only includes the grid messages that are from the grid back-end.
 */
export type IncomingGridMessage =
    | GridMessageSetup
    | GridMessageState
    | GridMessageData;
