import * as React from 'react';

import { GridActionCreators } from '../actions/grid.actions';
import { Worker } from '../components/Worker';
import { Cluster as ClusterModel } from '../models/grid';
import { ResourceManager } from './ResourceManager';

export interface ClusterProps {
    nr: number;
    model: ClusterModel;
    gridToggle: GridActionCreators['gridToggle'];
}

export class Cluster extends React.Component<ClusterProps> {
    public render(): JSX.Element {
        const { nr, model, gridToggle } = this.props;

        const workers = model.workers.map(worker => (
            <Worker
                key={worker.id}
                model={worker}
                clusterState={model.resourceManager.isDown}
                gridToggle={gridToggle}
            />
        ));

        return (
            <div className="cluster">
                <div>Cluster</div>
                <ResourceManager
                    nr={nr}
                    key={model.resourceManager.id}
                    model={model.resourceManager}
                    gridToggle={gridToggle}
                />
                <div className="cluster__workers">{workers}</div>
            </div>
        );
    }
}
