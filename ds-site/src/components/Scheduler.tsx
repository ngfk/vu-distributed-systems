import * as React from 'react';
import { NodeState } from '../models/node';

export interface SchedulerProps {}

export interface SchedulerState {
    backgroundStyle: {};
    state: NodeState;
}

export class Scheduler extends React.Component<SchedulerProps, SchedulerState> {
    constructor(props: SchedulerProps) {
        super(props);
        this.state = {
            state: NodeState.Online,
            backgroundStyle: { backgroundColor: 'green' }
        };
    }
    public render(): JSX.Element {
        return (
            <div
                className="Scheduler"
                onClick={this.handleClick}
                style={this.state.backgroundStyle}
            >
                <div className="Scheduler-label"> Scheduler </div>
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
