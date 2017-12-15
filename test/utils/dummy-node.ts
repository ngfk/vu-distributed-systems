import { Message } from '../../src/grid/message';
import { GridNode } from '../../src/grid/node';
import { NodeType } from '../../src/models/node-type';

export class DummyNode extends GridNode {
    constructor() {
        super(NodeType.Dummy);
    }

    public async run(): Promise<void> {
        // No-op
    }

    public onMessage(message: Message): void {
        // No-op
    }

    /**
     * Overrides the on message function to expect certain messages while
     * testing.
     * @param handler The new message handler
     */
    public setMessageHandler(handler: (message: Message) => void) {
        this.onMessage = handler;
    }
}
