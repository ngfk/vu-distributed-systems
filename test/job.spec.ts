import { expect } from 'chai';

import { Job, JobStatus } from '../src/grid/job';
import { DummyNode } from './utils/dummy-node';

describe('job', () => {
    it('roughly respect execution duration', async () => {
        const delay = 30;
        const dummy = new DummyNode();
        const job = new Job(dummy, delay);

        const start = process.hrtime();
        await job.execute();
        const end = process.hrtime(start);

        const diff = end[1] / 1e6;
        expect(diff).greaterThan(10);
        expect(diff).lessThan(50);
    });

    it('default job status to waiting', () => {
        const delay = 200;
        const dummy = new DummyNode();
        const job = new Job(dummy, delay);
        expect(job.getStatus()).eq(JobStatus.Waiting);
    });

    it('set job status to running', () => {
        const delay = 200;
        const dummy = new DummyNode();
        const job = new Job(dummy, delay);

        job.execute();
        expect(job.getStatus()).eq(JobStatus.Running);
    });

    it('set job status to finished', async () => {
        const delay = 0;
        const dummy = new DummyNode();
        const job = new Job(dummy, delay);

        await job.execute();
        expect(job.getStatus()).eq(JobStatus.Finished);
    });
});
