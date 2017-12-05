
export enum JobStatus {
    Waiting, Running, Closed
}

export class GridJobs {
    private status: JobStatus;
    private duration: number;
    private id: string;
    private result: number;
    private origin: GridSocket;
}
