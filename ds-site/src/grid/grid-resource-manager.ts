import { NodeType } from '../models/node-type';
import { GridActiveJob } from './grid-active-job';
import { GridJob, JobStatus } from './grid-job';
import { GridMessage, MessageType } from './grid-message';
import { GridNode, NodeStatus } from './grid-node';
import { GridSocket } from './grid-socket';

export class GridResourceManager extends GridNode {
    public workerSockets: GridSocket[] = [];
    private activeJobs: GridActiveJob[] = [];
    private workers = new Map<GridSocket, NodeStatus>();

    constructor() {
        super(NodeType.ResourceManager);
    }

    public async run(): Promise<void> {
        throw new Error('Method not implemented.');
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

    public toggleState(): void {
        this.status =
            this.status === NodeStatus.Dead
                ? NodeStatus.Available
                : NodeStatus.Dead;
    }

    public getActiveJob(jobId: number): GridActiveJob {
        const activeJobs = [...this.activeJobs.values()];

        for (let i = 0; i < activeJobs.length; i++) {
            if (activeJobs[i].job.id === jobId) {
                return activeJobs[i];
            }
        }
        throw new Error('No active jobs');
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

    private sendJobConfirmationToScheduler(
        socket: GridSocket,
        value: number
    ): void {
        if (this.status === NodeStatus.Dead) return;

        socket.send(
            new GridMessage(
                socket,
                NodeType.ResourceManager,
                MessageType.Confirmation,
                value
            )
        );
    }

    private getAvailableWorker(): GridSocket | undefined {
        let workerSocket: GridSocket | undefined;

        this.workers.forEach((entry, key) => {
            if (entry === NodeStatus.Available) {
                workerSocket = key;
            }
            workerSocket = undefined;
        });

        return workerSocket;
    }

    private sendJobRequestToWorker(worker: GridSocket, job: GridJob) {
        if (this.status === NodeStatus.Dead) return;

        const message = new GridMessage(
            worker,
            NodeType.ResourceManager,
            MessageType.Request,
            job.id
        );
        message.attachJob(job);
        worker.send(message);
    }

    private tryJobExecution(aj: GridActiveJob): void {
        if (this.status === NodeStatus.Dead) return;

        const availableWorker = this.getAvailableWorker();

        if (availableWorker === undefined) {
            return;
        }

        aj.status = JobStatus.Running;
        this.workers.set(availableWorker, NodeStatus.Reserved);
        this.sendJobRequestToWorker(availableWorker, aj.job);
    }

    /**
     * Scheduler handlers
     * @param message received messages
     */
    private onSchedulerAcknowledgement(message: GridMessage): void {
        const jobId = message.value;
        const aj = this.getActiveJob(jobId);
        this.activeJobs = this.activeJobs.filter(a => a !== aj);
        // TODO redux
    }

    private onSchedulerPing(message: GridMessage): void {
        this.sendStatus(message.socket);
    }

    private onSchedulerJobRequest(message: GridMessage): void {
        const aj = new GridActiveJob(message.getJob(), message.socket);
        this.activeJobs.push(aj);
        // TODO redux
        this.sendJobConfirmationToScheduler(message.socket, message.value);
    }

    /**
     * Scheduler Message Handler
     * @param message received message
     */
    private onSchedulerMessage(message: GridMessage): void {
        switch (message.type) {
            case MessageType.Acknowledgement:
                this.onSchedulerAcknowledgement(message);
                break;
            case MessageType.Ping:
                this.onSchedulerPing(message);
                break;
            case MessageType.Request:
                this.onSchedulerJobRequest(message);
                break;
        }
    }

    private getQueuedJob(): GridActiveJob | undefined {
        for (let i = 0; i < this.activeJobs.length; i++) {
            if (this.activeJobs[i].status === JobStatus.Waiting) {
                return this.activeJobs[i];
            }
        }
        return undefined;
    }

    private dequeueJob(): void {
        const aj = this.getQueuedJob();

        if (aj === undefined) {
            return;
        }

        this.tryJobExecution(aj);
    }

    private onWorkerStatus(message: GridMessage): void {
        const workerSocket = message.socket;
        const newStatus: NodeStatus = message.value;
        this.workers.set(workerSocket, newStatus);
    }

    private onWorkerJobConfirmation(message: GridMessage): void {
        this.workers.set(message.socket, NodeStatus.Busy);
        const aj = this.getActiveJob(message.value);
        aj.status = JobStatus.Running;
    }

    private onWorkerPingReturn(message: GridMessage): void {
        const worker = message.socket;
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
        this.workers.set(message.socket, NodeStatus.Available);

        this.sendJobResultConfirmationToWorker(message.socket, jobId);
        this.sendJobResultToCluster(aj);
    }

    /**
     * Worker Message Handler
     * @param message received message
     */
    private onWorkerMessage(message: GridMessage): void {
        switch (message.type) {
            case MessageType.Confirmation:
                this.onWorkerJobConfirmation(message);
                break;
            case MessageType.Ping:
                this.onWorkerPingReturn(message);
                break;
            case MessageType.Result:
                this.onWorkerResult(message);
                break;
            case MessageType.Status:
                this.onWorkerStatus(message);
        }
    }
}
