import * as React from 'react';

import { GridActionCreators } from '../actions/grid.actions';
import { Worker as WorkerModel } from '../models/grid';
import { NodeState, NodeType } from '../models/node';
import { getNodeColor } from '../utils/node-color';

export interface WorkerProps {
    model: WorkerModel;
    clusterState: NodeState;
    gridToggle: GridActionCreators['gridToggle'];
}

export class Worker extends React.Component<WorkerProps> {
    public render(): JSX.Element {
        const state =
            this.props.clusterState === NodeState.Offline
                ? NodeState.Unreachable
                : this.props.model.state;

        const backgroundColor = getNodeColor(state);

        return (
            <div
                className="worker"
                onClick={this.handleClick}
                style={{ backgroundColor }}
            >
                <div className="worker__label">W</div>
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
