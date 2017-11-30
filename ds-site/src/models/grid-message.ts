import { NodeState, NodeType } from './node';

import { GridSetup } from './grid';

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

export interface GridMessageToggle extends GridMessage {
    readonly type: 'toggle';
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

export interface GridMessageKill extends GridMessage {
    readonly type: 'kill';
}

export interface GridMessageSilence extends GridMessage {
    readonly type: 'silence';
    readonly nodeId: number;
    readonly nodeType: NodeType;
}

/**
 * Only includes the grid messages that are going to the grid back-end.
 */
export type OutgoingGridMessage =
    | GridMessageInit
    | GridMessageStart
    | GridMessageKill
    | GridMessageSilence;

/**
 * Only includes the grid messages that are from the grid back-end.
 */
export type IncomingGridMessage =
    | GridMessageSetup
    | GridMessageToggle
    | GridMessageData;
