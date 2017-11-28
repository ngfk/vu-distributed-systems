import { NodeType } from './node-type';

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

export interface GridMessageToggle extends GridMessage {
    readonly type: 'toggle';
    readonly nodeId: string;
    readonly nodeType: NodeType;
}

export interface GridMessageData extends GridMessage {
    readonly type: 'data';
    readonly nodeId: string;
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
    readonly nodeId: string;
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
export type IncomingGridMessage = GridMessageToggle | GridMessageData;
