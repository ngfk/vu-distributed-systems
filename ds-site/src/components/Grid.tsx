import * as React from 'react';

import { GridActionCreators } from '../actions/grid.actions';
import { Grid as GridModel } from '../models/grid';
import { Cluster } from './Cluster';
import { Scheduler } from './Scheduler';
import { User } from './User';

export interface GridProps {
    model: GridModel;
    actions: GridActionCreators;
}

export class Grid extends React.Component<GridProps> {
    public render(): JSX.Element {
        const { actions, model } = this.props;

        const users = <User />;

        const schedulers = model.schedulers.map(scheduler => (
            <Scheduler
                key={scheduler.id}
                model={scheduler}
                gridToggle={actions.gridToggle}
            />
        ));

        const clusters = model.clusters.map(cluster => (
            <Cluster
                key={cluster.resourceManager.id}
                model={cluster}
                gridToggle={actions.gridToggle}
            />
        ));

        return (
            <div className="grid">
                <div className="grid__users">{users}</div>
                <div>Job queue: {model.schedulerJobs}</div>
                <div className="grid__schedulers-container">
                    <div className="grid__schedulers">{schedulers}</div>
                </div>
                <div className="grid__clusters">{clusters}</div>
            </div>
        );
    }
}
