import { expect } from 'chai';

import { Message, MessageType } from '../src/grid/message';
import { Socket } from '../src/grid/socket';
import { DummyNode } from './utils/dummy-node';

describe('socket', () => {
    it('async delayed messages by default', () => {
        const dummy = new DummyNode();
        const message = new Message(dummy, MessageType.Ping);
        let async = true;

        dummy.setMessageHandler(() => (async = false));
        dummy.socket.send(message);

        expect(async).eq(true);
    });

    it('allow delay to be disabled', () => {
        Socket.DELAY = false;
        const dummy = new DummyNode();
        const message = new Message(dummy, MessageType.Ping);
        let async = true;

        dummy.setMessageHandler(() => (async = false));
        dummy.socket.send(message);

        expect(async).eq(false);
        Socket.DELAY = true;
    });
});
