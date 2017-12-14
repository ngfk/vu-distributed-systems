/**
 * Type definition used to define the state of a resource-manager represented
 * on the interface.
 */
export interface ResourceManagerModel {
    readonly id: string;
    readonly jobCount: number;
    readonly isDown: boolean;
}

/**
 * A collection of resource managers reachable by id.
 */
export interface ResourceManagers {
    readonly [id: string]: ResourceManagerModel;
}
