import { GridSetup } from './grid-setup';
import { NodeType } from './node-type';

export interface GridMessage {
    readonly type: GridMessageType;
}

export enum GridMessageType {
    Setup = 'setup',
    Queue = 'queue',
    Start = 'start',
    Stop = 'stop',
    Toggle = 'toggle'
}

export interface GridMessageSetup extends GridMessage {
    readonly type: GridMessageType.Setup;
    readonly grid: GridSetup;
}

export interface GridMessageQueue extends GridMessage {
    readonly type: GridMessageType.Queue;
    readonly nodeId: string;
    readonly nodeType: NodeType;
    readonly jobs: number;
}

export interface GridMessageStart extends GridMessage {
    readonly type: GridMessageType.Start;
    readonly sizes: {
        readonly schedulers: number;
        readonly clusters: number;
        readonly workers: number;
    };
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
    | GridMessageStart
    | GridMessageStop
    | GridMessageToggle;

/**
 * Only includes the grid messages that are from the grid back-end.
 */
export type IncomingGridMessage = GridMessageSetup | GridMessageQueue;
