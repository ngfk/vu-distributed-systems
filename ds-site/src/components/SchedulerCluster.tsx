import * as React from 'react';
import { Scheduler } from './Scheduler';

export interface SchedulerClusterProps {
    schedulers: number;
}

export class SchedulerCluster extends React.Component<SchedulerClusterProps> {
    public render(): JSX.Element {
        let i: number;
        let schedulerNodes = [];
        // let backgroundStyle = {};

        // if (this.props.active === 0) {
        //     backgroundStyle = { backgroundColor: 'red' };
        // } else if (this.props.active === 1) {
        //     backgroundStyle = { backgroundColor: 'green' };
        // } else if (this.props.active === 2) {
        //     backgroundStyle = { backgroundColor: 'orange' };
        // }

        for (i = 0; i < this.props.schedulers; i++) {
            schedulerNodes.push(<Scheduler />);
        }

        return <div className="Scheduler-box">{schedulerNodes}</div>;
    }
}
