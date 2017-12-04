import * as React from 'react';

import { GridActionCreators } from '../actions/grid.actions';
import { Scheduler as SchedulerModel } from '../models/grid';
import { NodeType } from '../models/node';
import { getNodeColor } from '../utils/node-color';

export interface SchedulerProps {
    nr: number;
    model: SchedulerModel;
    gridToggle: GridActionCreators['gridToggle'];
}

export class Scheduler extends React.Component<SchedulerProps> {
    public render(): JSX.Element {
        const { nr, model } = this.props;
        const { jobCount, isDown } = model;
        const backgroundColor = getNodeColor(jobCount, isDown);

        return (
            <div
                className="scheduler"
                onClick={this.handleClick}
                style={{ backgroundColor }}
            >
                <div className="scheduler__label">scheduler #{nr}</div>
                <div className="scheduler__jobs">{jobCount}</div>
            </div>
        );
    }

    private handleClick = () => {
        this.props.gridToggle({
            id: this.props.model.id,
            type: NodeType.Scheduler
        });
    };
}
