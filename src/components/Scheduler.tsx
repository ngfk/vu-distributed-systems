import * as React from 'react';

import { ActionCreators } from '../actions/actions';
import { SchedulerModel } from '../models/scheduler';
import { getNodeColor } from '../utils/node-color';

export interface SchedulerProps {
    nr: number;
    model?: SchedulerModel;
    actions: ActionCreators;
}

export class Scheduler extends React.Component<SchedulerProps> {
    public render(): JSX.Element {
        const { nr, model } = this.props;
        const backgroundColor = model
            ? getNodeColor(model.jobCount, model.isDown)
            : 'gray';

        return (
            <div
                className="scheduler"
                onClick={this.handleClick}
                style={{ backgroundColor }}
            >
                <div className="scheduler__label">scheduler: {nr}</div>
                <div className="scheduler__jobs">{model && model.jobCount}</div>
            </div>
        );
    }

    private handleClick = () => {
        if (!this.props.model) return;

        this.props.actions.schedulerToggle({
            id: this.props.model.id
        });
    };
}
