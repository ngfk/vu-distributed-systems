import * as React from 'react';

import { GridActionCreators } from '../actions/grid.actions';
import { Worker as WorkerModel } from '../models/grid';
import { NodeType } from '../models/node';
import { getNodeColor } from '../utils/node-color';

export interface WorkerProps {
    model: WorkerModel;
    clusterState: boolean;
    gridToggle: GridActionCreators['gridToggle'];
}

export class Worker extends React.Component<WorkerProps> {
    public render(): JSX.Element {
        const { model } = this.props;
        const unreachable = this.props.clusterState;

        const backgroundColor = unreachable
            ? 'gray'
            : getNodeColor(model.jobCount, model.isDown);

        return (
            <div
                className="worker"
                onClick={this.handleClick}
                style={{ backgroundColor }}
            />
        );
    }

    private handleClick = () => {
        this.props.gridToggle({
            id: this.props.model.id,
            type: NodeType.Worker
        });
    };
}
