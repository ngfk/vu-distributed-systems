import * as React from 'react';

import { ActionCreators } from '../actions/actions';
import { WorkerModel } from '../models/worker';
import { getNodeColor } from '../utils/node-color';

export interface WorkerProps {
    nr: number;
    model?: WorkerModel;
    resourceManagerDown?: boolean;
    actions: ActionCreators;
}

export class Worker extends React.Component<WorkerProps> {
    public render(): JSX.Element {
        const { model } = this.props;
        const unreachable = this.props.resourceManagerDown;

        const backgroundColor =
            model && !unreachable
                ? getNodeColor(model.jobCount, model.isDown)
                : 'gray';

        return (
            <div
                className="worker"
                onClick={this.handleClick}
                style={{ backgroundColor }}
            />
        );
    }

    private handleClick = () => {
        if (!this.props.model) return;

        this.props.actions.workerToggle({
            id: this.props.model.id
        });
    };
}
