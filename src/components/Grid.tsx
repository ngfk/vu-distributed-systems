import * as React from 'react';

import { ActionCreators } from '../actions/actions';
import { State } from '../reducers/reducer';
import { Cluster } from './Cluster';
import { Scheduler } from './Scheduler';
import { User } from './User';

export interface GridProps extends State {
    actions: ActionCreators;
}

export class Grid extends React.Component<GridProps> {
    public render(): JSX.Element {
        const { actions, setup } = this.props;

        const users = <User />;

        const schedulers = setup.schedulers.map((scheduler, i) => (
            <Scheduler
                key={scheduler}
                nr={i}
                model={this.props.schedulers[scheduler]}
                actions={actions}
            />
        ));

        const clusters = setup.clusters.map((cluster, i) => {
            const resourceManager = this.props.resourceManagers[
                cluster.resourceManager
            ];

            return (
                <Cluster
                    key={cluster.resourceManager}
                    nr={i}
                    resourceManager={resourceManager}
                    workerSetup={cluster.workers}
                    workers={this.props.workers}
                    actions={actions}
                />
            );
        });

        return (
            <div className="grid">
                <div className="grid__users">{users}</div>
                {/* <div>Jobs: {model.user.jobCount}</div> */}
                <div className="grid__schedulers-container">
                    <div className="grid__schedulers">{schedulers}</div>
                </div>
                <div className="grid__clusters">{clusters}</div>
            </div>
        );
    }
}
