import { NodeType } from '../models/node-type';
import { GridActiveJob } from './grid-active-job';
import { GridContext } from './grid-context';
import { GridJob, JobStatus } from './grid-job';
import { GridMessage, MessageType } from './grid-message';
import { GridNode, NodeStatus } from './grid-node';
import { GridSocket } from './grid-socket';

export class GridResourceManager extends GridNode {
    private jobs: GridActiveJob[] = [];
    private workers = new Map<GridSocket, NodeStatus>();

    constructor(context: GridContext) {
        super(context, NodeType.ResourceManager);
    }

    public registerWorkers(workers: GridSocket[]): void {
        workers.forEach(worker => {
            this.workers.set(worker, NodeStatus.Available);
        });
    }

    public async run(): Promise<void> {
        // For every active-unfinished job periodically check if the worker is still alive
        for (let i = 0; i < this.jobs.length; i++) {
            if (this.jobs[i].status !== JobStatus.Running) continue;

            const worker = this.jobs[i].workerSocket;
            this.pingWorker(worker);
        }
    }

    public onMessage(message: GridMessage): void {
        if (this.status === NodeStatus.Dead) return;

        switch (message.sender) {
            case NodeType.Scheduler:
                this.onSchedulerMessage(message);
                break;
            case NodeType.Worker:
                this.onWorkerMessage(message);
                break;
        }
    }

    private onSchedulerMessage(message: GridMessage): void {
        switch (message.type) {
            case MessageType.Request:
                this.onSchedulerRequest(message);
                break;
            case MessageType.Acknowledgement:
                this.onSchedulerAcknowledgement(message);
                break;
            case MessageType.Ping:
                this.onSchedulerPing(message);
                break;
        }
    }

    private onWorkerMessage(message: GridMessage): void {
        switch (message.type) {
            case MessageType.Confirmation:
                this.onWorkerConfirmation(message);
                break;
            case MessageType.Ping:
                this.onWorkerPing(message);
                break;
            case MessageType.Result:
                this.onWorkerResult(message);
                break;
            case MessageType.Status:
                this.onWorkerStatus(message);
        }
    }

    private onSchedulerRequest(message: GridMessage): void {
        const socket = message.senderSocket;
        const activeJob = new GridActiveJob(message.getJob(), socket);

        this.jobs.push(activeJob);
        this.sendJobCount(this.jobs.length);

        const newMessage = this.createMessage(
            MessageType.Confirmation,
            message.value
        );
        socket.send(newMessage);

        this.tryJobExecution(activeJob);
    }

    private onSchedulerAcknowledgement(message: GridMessage): void {
        const jobId = message.value;
        const aj = this.getActiveJob(jobId);
        this.jobs = this.jobs.filter(a => a !== aj);
        this.sendJobCount(this.jobs.length);
    }

    private requestStatusWorker(worker: GridSocket) {
        if (this.status === NodeStatus.Dead) return;

        const message = new GridMessage(
            this.socket,
            NodeType.ResourceManager,
            MessageType.Request,
            0
        );
        worker.send(message);
    }

    private pingWorker(worker: GridSocket) {
        if (this.status === NodeStatus.Dead) return;

        const message = new GridMessage(
            this.socket,
            NodeType.ResourceManager,
            MessageType.Ping,
            0
        );
        worker.send(message);
    }

    private sendStatus(recv: GridSocket): void {
        if (this.status === NodeStatus.Dead) return;

        recv.send(
            new GridMessage(
                this.socket,
                NodeType.ResourceManager,
                MessageType.Status,
                1
            )
        );
    }

    private getAvailableWorker(): GridSocket | undefined {
        let result: GridSocket | undefined;
        this.workers.forEach((entry, key) => {
            if (entry === NodeStatus.Available) {
                result = key;
                return;
            }
        });

        return result;
    }

    private sendJobRequestToWorker(worker: GridSocket, job: GridJob) {
        const message = this.createMessage(MessageType.Request, job.id);
        message.attachJob(job);
        worker.send(message);
    }

    private tryJobExecution(aj: GridActiveJob): void {
        const availableWorker = this.getAvailableWorker();
        if (!availableWorker) return;

        aj.status = JobStatus.Running;
        this.workers.set(availableWorker, NodeStatus.Reserved);
        aj.workerSocket = availableWorker;
        this.sendJobRequestToWorker(availableWorker, aj.job);
    }

    private onSchedulerPing(message: GridMessage): void {
        this.sendStatus(message.senderSocket);
    }

    private getQueuedJob(): GridActiveJob | undefined {
        for (let i = 0; i < this.jobs.length; i++) {
            if (this.jobs[i].status === JobStatus.Waiting) {
                return this.jobs[i];
            }
        }
        return undefined;
    }

    private dequeueJob(): void {
        const aj = this.getQueuedJob();
        if (!aj) return;
        this.tryJobExecution(aj);
    }

    private onWorkerStatus(message: GridMessage): void {
        const workerSocket = message.senderSocket;
        const newStatus: NodeStatus = message.value;
        this.workers.set(workerSocket, newStatus);
    }

    private onWorkerConfirmation(message: GridMessage): void {
        this.workers.set(message.senderSocket, NodeStatus.Busy);
        const activeJob = this.getActiveJob(message.value);
        activeJob.status = JobStatus.Running;
    }

    private onWorkerPing(message: GridMessage): void {
        const worker = message.senderSocket;
        this.workers.set(worker, NodeStatus.Available);
    }

    private sendJobResultConfirmationToWorker(
        socket: GridSocket,
        jobId: number
    ) {
        if (this.status === NodeStatus.Dead) return;

        const message = new GridMessage(
            socket,
            NodeType.ResourceManager,
            MessageType.Confirmation,
            jobId
        );
        socket.send(message);
    }

    private sendJobResultToCluster(aj: GridActiveJob): void {
        const message = new GridMessage(
            this.socket,
            NodeType.ResourceManager,
            MessageType.Result,
            aj.job.id
        );
        message.attachJob(aj.job);
        if (!aj.schedulerSocket) {
            throw new Error('No scheduler socket');
        }

        aj.schedulerSocket.send(message);
    }

    private onWorkerResult(message: GridMessage): void {
        const jobId = message.value;
        const aj = this.getActiveJob(jobId);
        aj.status = JobStatus.Closed;
        aj.job = message.getJob();
        this.workers.set(message.senderSocket, NodeStatus.Available);

        this.sendJobResultConfirmationToWorker(message.senderSocket, jobId);
        this.sendJobResultToCluster(aj);
    }

    private getActiveJob(jobId: number): GridActiveJob {
        for (let i = 0; i < this.jobs.length; i++) {
            if (this.jobs[i].job.id === jobId) {
                return this.jobs[i];
            }
        }
        throw new Error('No active jobs');
    }
}
