import { expect } from 'chai';

import { Socket } from '../src/grid/socket';
import { UserNode } from '../src/grid/user';
import { DummyNode } from './utils/dummy-node';

describe('user', () => {
    before(() => (Socket.DELAY = false));
    after(() => (Socket.DELAY = true));

    it('allow registering schedulers', () => {
        const node1 = new DummyNode();
        const node2 = new DummyNode();

        const user = new UserNode()
            .registerScheduler(node1.socket)
            .registerScheduler(node1.socket)
            .registerScheduler(node2.socket);

        const schedulers: Set<Socket> = (user as any).schedulers;

        expect(schedulers.size).eq(2);
        expect(schedulers.has(node1.socket)).eq(true);
        expect(schedulers.has(node2.socket)).eq(true);
    });

    it('throw if no scheduler is registered', async () => {
        const user = new UserNode();
        const dispatchJob = user.dispatchJob.bind(user);
        expect(dispatchJob).throw(UserNode.NO_SCHEDULER);
    });

    // it('send request message on job dispatch', done => {
    //     const scheduler = new DummyNode();
    //     const user = new UserNode().registerScheduler(scheduler.socket);

    //     scheduler.setMessageHandler(message => {
    //         expect(message.from).eq(user.socket);
    //         expect(message.type).eq(MessageType.Request);
    //         expect(message.job).exist;
    //         done();
    //     });
    //     user.dispatchJob();
    // });
});
