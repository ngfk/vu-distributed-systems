import { Middleware } from 'redux';

import { ActionMap } from '../actions/actions';
import {
    GridMessageInit,
    GridMessageStop,
    GridMessageToggle,
    GridMessageType,
    IncomingGridMessage,
    OutgoingGridMessage
} from '../models/grid-message';
import { NodeType } from '../models/node-type';

const DEFAULT_URL = 'ws://localhost:4000/connection';
const BASE_DELAY = 200;

export type OnMessageHandler = (message: IncomingGridMessage) => void;

/**
 * Unsubscribe function, will undo a subscription.
 */
export type Unsubscribe = () => void;

/**
 * Utility class used to create a connection with the grid back-end. On failure
 * to connect this class will retry with an exponential delay.
 */
export class GridConnection {
    private websocket: WebSocket;
    private reconnectDelay = BASE_DELAY;
    private observers = new Set<OnMessageHandler>();

    /**
     * Creates a new instance of the GridConnection class.
     * @param url The grid back-end endpoint, defaults to
     * `ws://localhost:4000/connection`.
     */
    constructor(url = DEFAULT_URL) {
        this.connect(url);
    }

    /**
     * Subscribes to messaged from  the grid back-end. Every message is
     * forwarded to the handler function provided.
     * @param onMessage The on-message handler function.
     * @returns Unsubscribe function, will undo this subscription.
     */
    public subscribe(onMessage: OnMessageHandler): Unsubscribe {
        this.observers.add(onMessage);
        return () => this.observers.delete(onMessage);
    }

    /**
     * Sends the provided message to the grid back-end.
     * @param message The message to send.
     */
    public send(message: OutgoingGridMessage): void {
        // Send message to the back-end.
        this.websocket.send(JSON.stringify(message));
    }

    /**
     * Connect to the grid back-end using a websocket.
     * @param url The websocket endpoint.
     */
    private connect(url: string): void {
        this.websocket = new WebSocket(url);
        this.websocket.onclose = () => this.reconnect(url);
        this.websocket.onopen = () => this.onOpen();
        this.websocket.onmessage = message => this.onMessage(message);
    }

    /**
     * Attempts to reconnect to the web socket whenever the previous connection
     * closes. Delay between connection attempts will increase exponentially.
     * @param url The websocket endpoint.
     */
    private reconnect(url: string): void {
        setTimeout(() => {
            this.reconnectDelay *= 1.2;
            this.connect(url);
        }, this.reconnectDelay);

        // tslint:disable-next-line
        window.onbeforeunload = () => {};
    }

    /**
     * Whenever a new connection is opened the re-connection delay can be reset
     * and the window's onUnload handler is configured to send a stop message
     * to the grid back-end.
     */
    private onOpen(): void {
        this.reconnectDelay = BASE_DELAY;

        window.onbeforeunload = () => {
            const message: GridMessageStop = { type: GridMessageType.Stop };
            this.send(message);
        };
    }

    /**
     * Handle's the provided message event, validating it, and forwarding the
     * data to the subscribers.
     * @param message The web socket message event.
     */
    private onMessage(message: MessageEvent): void {
        const invalidMessageErr = 'Invalid message received from grid:\n';

        let data: any;
        try {
            // Attempt to parse the JSON data
            data = JSON.parse(message.data);
        } catch {
            throw new Error(invalidMessageErr + message.data);
        }

        if (Array.isArray(data)) {
            data.forEach(d => this.observers.forEach(observer => observer(d)));
        } else {
            this.observers.forEach(observer => observer(data));
        }
    }
}

export type GridMiddleware = (grid: GridConnection) => Middleware;

/**
 * Redux middleware used to catch actions on the redux store and pass them to
 * the back-end when required.
 * @param grid The grid connection instance.
 */
export const gridMiddleware: GridMiddleware = grid => store => next => action => {
    // Unfortunately it would be too much effort to make this function type
    // safe, so this function simply uses a lot of casting.
    const p: any = (action as any).payload;

    const toggle = (id: string, type: NodeType) => {
        const message: GridMessageToggle = {
            type: GridMessageType.Toggle,
            nodeId: id,
            nodeType: type
        };
        grid.send(message);
    };

    switch (action.type) {
        case 'GRID_START': {
            const payload = p as ActionMap['GRID_START'];
            // First init, start it sent after rendering.
            const message: GridMessageInit = {
                type: GridMessageType.Init,
                sizes: {
                    schedulers: payload.schedulers,
                    clusters: payload.clusters,
                    workers: payload.workers
                }
            };
            grid.send(message);
            break;
        }
        case 'GRID_STOP': {
            const message: GridMessageStop = { type: GridMessageType.Stop };
            grid.send(message);
            break;
        }
        case 'SCHEDULER_TOGGLE': {
            const payload = p as ActionMap['SCHEDULER_TOGGLE'];
            toggle(payload.id, NodeType.Scheduler);
            break;
        }
        case 'RESOURCE_MANAGER_TOGGLE': {
            const payload = p as ActionMap['RESOURCE_MANAGER_TOGGLE'];
            toggle(payload.id, NodeType.ResourceManager);
            break;
        }
        case 'WORKER_TOGGLE': {
            const payload = p as ActionMap['WORKER_TOGGLE'];
            toggle(payload.id, NodeType.Worker);
            break;
        }
    }

    return next(action);
};
