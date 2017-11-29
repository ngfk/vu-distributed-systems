import * as React from 'react';

export interface SchedulerProps {}

export interface SchedulerState {}

export class Scheduler extends React.Component<SchedulerProps, SchedulerState> {
    public render(): JSX.Element {
        return (
            <div>
                <div> Scheduler is here </div>
            </div>
        );
    }
}
