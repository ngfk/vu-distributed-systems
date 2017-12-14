import * as React from 'react';

import { ResourceManagerModel } from '../../models/resource-manager';
import { Workers } from '../../models/worker';
import { ActionCreators } from '../actions/actions';
import { Worker } from '../components/Worker';
import { ResourceManager } from './ResourceManager';

export interface ClusterProps {
    nr: number;
    resourceManager?: ResourceManagerModel;
    workerSetup: string[];
    workers: Workers;
    actions: ActionCreators;
}

export class Cluster extends React.Component<ClusterProps> {
    public render(): JSX.Element {
        const { nr, resourceManager, workerSetup, actions } = this.props;

        const workers = workerSetup.map((worker, i) => {
            const resourceManagerDown = resourceManager
                ? resourceManager.isDown
                : undefined;

            return (
                <Worker
                    key={worker}
                    nr={i}
                    model={this.props.workers[worker]}
                    resourceManagerDown={resourceManagerDown}
                    actions={actions}
                />
            );
        });

        return (
            <div className="cluster">
                <div>Cluster</div>
                <ResourceManager
                    nr={nr}
                    model={resourceManager}
                    actions={actions}
                />
                <div className="cluster__workers">{workers}</div>
            </div>
        );
    }
}
