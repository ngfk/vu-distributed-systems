import * as React from 'react';

import { GridActionCreators } from '../actions/grid.actions';
import { Worker as WorkerModel } from '../models/grid';
import { NodeState, NodeType } from '../models/node';

export interface WorkerProps {
    model: WorkerModel;
    clusterState: NodeState;
    gridToggle: GridActionCreators['gridToggle'];
}

export interface WorkerState {}

export class Worker extends React.Component<WorkerProps, WorkerState> {
    constructor(props: WorkerProps) {
        super(props);
    }

    public render(): JSX.Element {
        const state =
            this.props.clusterState === NodeState.Offline
                ? NodeState.Unreachable
                : this.props.model.state;

        let backgroundStyle = {};

        if (state === NodeState.Online) {
            backgroundStyle = {
                backgroundColor: 'green'
            };
        } else if (state === NodeState.Busy) {
            backgroundStyle = {
                backgroundColor: 'orange'
            };
        } else if (state === NodeState.Unreachable) {
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
            id: this.props.model.id,
            type: NodeType.Worker
        });
    };
}
