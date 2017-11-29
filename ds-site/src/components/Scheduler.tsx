import * as React from 'react';

export interface SchedulerProps {
    schedulers: number;
}

export class Scheduler extends React.Component<SchedulerProps> {
    public render(): JSX.Element {
        let i: number;
        let schedulerNodes = [];
        for (i = 0; i < this.props.schedulers; i++) {
            schedulerNodes.push(
                <div className="Scheduler">
                    <div className="Scheduler-label">Scheduler</div>
                </div>
            );
        }

        return <div className="Scheduler-box">{schedulerNodes}</div>;
    }
}
