import * as React from 'react';

import { GridActionCreators } from '../actions/grid.actions';
import { Worker } from '../components/Worker';
import {
    ResourceManager as ResourceManagerState,
    Worker as WorkerState
} from '../models/grid';
import { ResourceManager } from './ResourceManager';

export interface ClusterProps {
    workers: WorkerState[];
    resourceManager: ResourceManagerState;
    gridToggle: GridActionCreators['gridToggle'];
}

export class Cluster extends React.Component<ClusterProps> {
    public render(): JSX.Element {
        const { resourceManager, gridToggle } = this.props;
        let workerNodes: JSX.Element[] = [];

        workerNodes.push(
            <ResourceManager
                key={resourceManager.id}
                model={resourceManager}
                gridToggle={gridToggle}
            />
        );

        this.props.workers.forEach(worker => {
            workerNodes.push(
                <Worker
                    key={worker.id}
                    model={worker}
                    clusterState={resourceManager.state}
                    gridToggle={gridToggle}
                />
            );
        });

        let formatted = workerNodes.map((line, i) => (
            <div key={'Worker' + i}>{line}</div>
        ));

        return (
            <div className="Cluster">
                <div className="Cluster-label">Cluster</div>
                {formatted}
            </div>
        );
    }
}

export default Cluster;
