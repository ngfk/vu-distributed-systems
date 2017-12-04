import * as React from 'react';

import { GridActionCreators } from '../actions/grid.actions';
import { ResourceManager as ResourceManagerModel } from '../models/grid';
import { NodeType } from '../models/node';
import { getNodeColor } from '../utils/node-color';

export interface ResourceManagerProps {
    model: ResourceManagerModel;
    gridToggle: GridActionCreators['gridToggle'];
}

export class ResourceManager extends React.Component<ResourceManagerProps> {
    public render(): JSX.Element {
        const { jobCount, isDown } = this.props.model;
        const backgroundColor = getNodeColor(jobCount, isDown);

        return (
            <div
                className="resource-manager"
                onClick={this.handleClick}
                style={{ backgroundColor }}
            >
                <div className="resource-manager__label">
                    <div>Resource manager</div>
                    <div>Job queue: {jobCount}</div>
                </div>
            </div>
        );
    }

    private handleClick = () => {
        this.props.gridToggle({
            id: this.props.model.id,
            type: NodeType.ResourceManager
        });
    };
}
