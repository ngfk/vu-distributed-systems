import * as React from 'react';

import { GridActionCreators } from '../actions/grid.actions';
import { Scheduler as SchedulerModel } from '../models/grid';
import { NodeState, NodeType } from '../models/node';

export interface SchedulerProps {
    model: SchedulerModel;
    gridToggle: GridActionCreators['gridToggle'];
}

export interface SchedulerState {}

export class Scheduler extends React.Component<SchedulerProps, SchedulerState> {
    constructor(props: SchedulerProps) {
        super(props);
    }
    public render(): JSX.Element {
        const { state } = this.props.model;
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
            id: this.props.model.id,
            type: NodeType.Scheduler
        });
    };
}
