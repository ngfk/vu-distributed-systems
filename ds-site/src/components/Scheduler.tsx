import * as React from 'react';

import { GridActionCreators } from '../actions/grid.actions';
import { NodeState, NodeType } from '../models/node';

export interface SchedulerProps {
    id: number;
    state: NodeState;
    gridToggle: GridActionCreators['gridToggle'];
}

export interface SchedulerState {}

export class Scheduler extends React.Component<SchedulerProps, SchedulerState> {
    constructor(props: SchedulerProps) {
        super(props);
    }
    public render(): JSX.Element {
        let backgroundStyle = {};

        if (
            this.props.state === NodeState.Busy ||
            this.props.state === NodeState.Online ||
            this.props.state === NodeState.Unreachable
        ) {
            backgroundStyle = {
                backgroundColor: 'green'
            };
        } else {
            backgroundStyle = { backgroundColor: 'red' };
        }

        return (
            <div
                className="Scheduler"
                onClick={this.handleClick}
                style={backgroundStyle}
            >
                <div className="Scheduler-label"> Scheduler </div>
            </div>
        );
    }

    private handleClick = () => {
        this.props.gridToggle({
            id: this.props.id,
            type: NodeType.Scheduler
        });
    };
}
