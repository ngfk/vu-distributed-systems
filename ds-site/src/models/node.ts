export enum NodeState {
    Online = 'online',
    Offline = 'offline',
    Busy = 'busy',
    Unreachable = 'unreachable'
}

export enum NodeType {
    Scheduler = 'scheduler',
    ResourceManager = 'resource-manager',
    Worker = 'worker'
}
