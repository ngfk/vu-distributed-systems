import * as React from 'react';

export interface WorkerProps {
    active: number;
}

export interface WorkerState {}

export class Worker extends React.Component<WorkerProps, WorkerState> {
    public render(): JSX.Element {
        let backgroundStyle = {};
        if (this.props.active === 0) {
            backgroundStyle = { backgroundColor: 'green' };
        } else if (this.props.active === 1) {
            backgroundStyle = { backgroundColor: 'orange' };
        } else if (this.props.active === 2) {
            backgroundStyle = { backgroundColor: 'red' };
        }
        return (
            <div className="Worker" style={backgroundStyle}>
                <div className="Worker-label"> W </div>
            </div>
        );
    }
}
