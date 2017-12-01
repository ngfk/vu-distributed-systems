export enum NodeState {
    Online = 'online',
    Offline = 'offline',
    Busy = 'busy',
    Unreachable = 'unreachable'
}

export enum NodeType {
    User = 'user',
    Scheduler = 'scheduler',
    ResourceManager = 'resource-manager',
    Worker = 'worker'
}
