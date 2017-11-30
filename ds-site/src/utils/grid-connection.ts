import {
    IncomingGridMessage,
    OutgoingGridMessage
} from '../models/grid-message';

const DEFAULT_URL = 'ws://localhost:4000/connection';
const BASE_DELAY = 200;
const REGISTER_MESSAGE = 'register';

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
    private id: string;
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
        // Create new object with copied properties from message and append the
        // interface id to the message.
        const msg = { ...message, id: this.id };

        // Send message to the back-end.
        this.websocket.send(msg);
    }

    /**
     * Connect to the grid back-end using a websocket.
     * @param url The websocket endpoint.
     */
    private connect(url: string): void {
        this.websocket = new WebSocket(url);
        this.websocket.onclose = () => this.reconnect(url);
        this.websocket.onopen = () => this.register();
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
    }

    /**
     * Registers this interface at the back-end, requesting an interface id.
     */
    private register(): void {
        this.websocket.send({ type: REGISTER_MESSAGE, id: this.id });

        // Web socket connection is open, reset the re-connection delay.
        this.reconnectDelay = BASE_DELAY;
    }

    /**
     * Handle's the provided message event, validating it, and forwarding the
     * data to the subscribers.
     * @param message The web socket message event.
     */
    private onMessage(message: MessageEvent): void {
        const data = message.data;

        // Throw error on messages with invalid structure.
        if (!data || typeof data.type === 'string') {
            const json = JSON.stringify(message.data, undefined, 4);
            throw new Error('Invalid message received from grid:\n' + json);
        }

        // Register messages are handled internally.
        if (data.type === REGISTER_MESSAGE) {
            this.id = data.id;
            return;
        }

        // Only messages that are meant for this interface instance are passed
        // to the subscribed observers.
        const accept = ['setup', 'toggle', 'data'];
        if (data.id === this.id && accept.indexOf(data.type) >= 0) {
            this.observers.forEach(observer => observer(message.data));
        }
    }
}
