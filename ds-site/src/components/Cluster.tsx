import * as React from 'react';
import { Worker } from '../components/Worker';
import { ResourceManager } from './ResourceManager';

export interface ClusterProps {
    workers: number;
    resourceActive: number;
    workerActive: number;
}

export class Cluster extends React.Component<ClusterProps> {
    public render(): JSX.Element {
        let workerNodes = [];

        workerNodes.push(
            <ResourceManager active={this.props.resourceActive} />
        );
        for (let i = 1; i <= this.props.workers; i++) {
            workerNodes.push(<Worker active={this.props.workerActive} />);
        }
        let formatted = workerNodes.map((line, i) => (
            <div key={i}> {line} </div>
        ));

        return (
            <div>
                <div className="Cluster">
                    <div className="Cluster-label">Cluster</div>
                    {formatted}
                </div>
            </div>
        );
    }
}

export default Cluster;
