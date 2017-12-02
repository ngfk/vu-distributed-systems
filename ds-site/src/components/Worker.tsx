import * as React from 'react';
import { NodeState, NodeType } from '../models/node';
import { GridActionCreators } from '../actions/grid.actions';

export interface WorkerProps {
    state: NodeState;
    id: number;
    gridToggle: GridActionCreators['gridToggle'];
}

export interface WorkerState {}

export class Worker extends React.Component<WorkerProps, WorkerState> {
    constructor(props: WorkerProps) {
        super(props);
    }
    public render(): JSX.Element {
        let backgroundStyle = {};

        if (
            this.props.state === NodeState.Busy ||
            this.props.state === NodeState.Online
        ) {
            backgroundStyle = {
                backgroundColor: 'green'
            };
        } else if (this.props.state === NodeState.Unreachable) {
            backgroundStyle = {
                backgroundColor: 'grey'
            };
        } else {
            backgroundStyle = { backgroundColor: 'red' };
        }

        return (
            <div
                className="Worker"
                onClick={this.handleClick}
                style={backgroundStyle}
            >
                <div className="Worker-label"> W </div>
            </div>
        );
    }

    private handleClick = () => {
        this.props.gridToggle({
            id: this.props.id,
            type: NodeType.Worker
        });
    };
}
