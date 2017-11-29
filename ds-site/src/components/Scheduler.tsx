import * as React from 'react';

export interface SchedulerProps {
    schedulers: number;
    active: number;
    randomScheduler: number;
}

export interface SchedulerState {}

export class Scheduler extends React.Component<SchedulerProps, SchedulerState> {
    public render(): JSX.Element {
        let i: number;
        let schedulerNodes = [];
        let backgroundStyle = {};

        if (this.props.active === 0) {
            backgroundStyle = { backgroundColor: 'red' };
        } else if (this.props.active === 1) {
            backgroundStyle = { backgroundColor: 'green' };
        } else if (this.props.active === 2) {
            backgroundStyle = { backgroundColor: 'orange' };
        }

        for (i = 0; i < this.props.schedulers; i++) {
            if (i === this.props.randomScheduler) {
                backgroundStyle = { backgroundColor: 'red' };
            }
            schedulerNodes.push(
                <div className="Scheduler" key={i} style={backgroundStyle}>
                    <div className="Scheduler-label">Scheduler</div>
                </div>
            );
        }

        return <div className="Scheduler-box">{schedulerNodes}</div>;
    }
}
