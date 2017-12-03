import { GridSetup } from './grid';
import { NodeState, NodeType } from './node';

export interface GridMessage {
    readonly type: GridMessageType;
}

export enum GridMessageType {
    Init = 'init',
    Setup = 'setup',
    State = 'state',
    Queue = 'queue',
    Stop = 'stop',
    Toggle = 'toggle'
}

export interface GridMessageInit extends GridMessage {
    readonly type: GridMessageType.Init;
    readonly sizes: {
        readonly schedulers: number;
        readonly clusters: number;
        readonly workers: number;
    };
}

export interface GridMessageSetup extends GridMessage {
    readonly type: GridMessageType.Setup;
    readonly grid: GridSetup;
}

export interface GridMessageState extends GridMessage {
    readonly type: GridMessageType.State;
    readonly nodeId: string;
    readonly nodeType: NodeType;
    readonly nodeState: NodeState;
}

export interface GridMessageQueue extends GridMessage {
    readonly type: GridMessageType.Queue;
    readonly nodeId: string;
    readonly nodeType: NodeType;
    readonly jobs: number;
}

export interface GridMessageStop extends GridMessage {
    readonly type: GridMessageType.Stop;
}

export interface GridMessageToggle extends GridMessage {
    readonly type: GridMessageType.Toggle;
    readonly nodeId: string;
    readonly nodeType: NodeType;
}

/**
 * Only includes the grid messages that are going to the grid back-end.
 */
export type OutgoingGridMessage =
    | GridMessageInit
    | GridMessageStop
    | GridMessageToggle;

/**
 * Only includes the grid messages that are from the grid back-end.
 */
export type IncomingGridMessage =
    | GridMessageSetup
    | GridMessageState
    | GridMessageQueue;
