import * as React from 'react';
import {
    Worker as WorkerState,
    ResourceManager as ResourceManagerState
} from '../models/grid';
import { Worker } from '../components/Worker';
import { ResourceManager } from './ResourceManager';
import { GridActionCreators } from '../actions/grid.actions';
import { NodeState } from '../models/node';

export interface ClusterProps {
    workers: WorkerState[];
    resourceManager: ResourceManagerState;
    gridToggle: GridActionCreators['gridToggle'];
}

export class Cluster extends React.Component<ClusterProps> {
    public render(): JSX.Element {
        let workerNodes: JSX.Element[] = [];

        workerNodes.push(
            <ResourceManager
                id={this.props.resourceManager.id}
                state={this.props.resourceManager.state}
                gridToggle={this.props.gridToggle}
            />
        );

        this.props.workers.forEach(worker => {
            const state =
                this.props.resourceManager.state === NodeState.Offline
                    ? NodeState.Unreachable
                    : worker.state;
            workerNodes.push(
                <Worker
                    key={worker.id}
                    id={worker.id}
                    state={state}
                    gridToggle={this.props.gridToggle}
                />
            );
        });

        let formatted = workerNodes.map((line, i) => (
            <div key={'Worker' + i.toString()}> {line} </div>
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
