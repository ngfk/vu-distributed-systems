import * as React from 'react';
import { NodeState } from '../models/node';

export interface ResourceManagerProps {}

export interface ResourceManagerState {
    backgroundStyle: {};
    state: NodeState;
}

export class ResourceManager extends React.Component<
    ResourceManagerProps,
    ResourceManagerState
> {
    constructor(props: ResourceManagerProps) {
        super(props);
        this.state = {
            state: NodeState.Online,
            backgroundStyle: { backgroundColor: 'green' }
        };
    }
    public render(): JSX.Element {
        return (
            <div
                className="ResourceManager"
                onClick={this.handleClick}
                style={this.state.backgroundStyle}
            >
                <div className="ResourceManager-label"> Resource manager </div>
            </div>
        );
    }

    private handleClick = () => {
        if (
            this.state.state === NodeState.Busy ||
            this.state.state === NodeState.Online ||
            this.state.state === NodeState.Unreachable
        ) {
            this.setState({ backgroundStyle: { backgroundColor: 'red' } });
            this.setState({ state: NodeState.Offline });
        } else if (this.state.state === NodeState.Offline) {
            this.setState({ backgroundStyle: { backgroundColor: 'green' } });
            this.setState({ state: NodeState.Online });
        }
    };
}
