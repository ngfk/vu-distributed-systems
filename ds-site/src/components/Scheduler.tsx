import * as React from 'react';

import { GridActionCreators } from '../actions/grid.actions';
import { Scheduler as SchedulerModel } from '../models/grid';
import { NodeType } from '../models/node';
import { getNodeColor } from '../utils/node-color';

export interface SchedulerProps {
    model: SchedulerModel;
    gridToggle: GridActionCreators['gridToggle'];
}

export class Scheduler extends React.Component<SchedulerProps> {
    public render(): JSX.Element {
        const { jobCount, isDown } = this.props.model;
        const backgroundColor = getNodeColor(jobCount, isDown);

        return (
            <div
                className="scheduler"
                onClick={this.handleClick}
                style={{ backgroundColor }}
            >
                <div className="scheduler__label">Scheduler</div>
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
