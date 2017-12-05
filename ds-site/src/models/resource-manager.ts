export interface ResourceManagerModel {
    readonly id: string;
    readonly jobCount: number;
    readonly isDown: boolean;
}

export interface ResourceManagers {
    readonly [id: string]: ResourceManagerModel;
}
