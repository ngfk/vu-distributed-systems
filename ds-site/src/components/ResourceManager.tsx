import * as React from 'react';

import { GridActionCreators } from '../actions/grid.actions';
import { ResourceManager as ResourceManagerModel } from '../models/grid';
import { NodeType } from '../models/node';
import { getNodeColor } from '../utils/node-color';

export interface ResourceManagerProps {
    nr: number;
    model: ResourceManagerModel;
    gridToggle: GridActionCreators['gridToggle'];
}

export class ResourceManager extends React.Component<ResourceManagerProps> {
    public render(): JSX.Element {
        const { nr, model } = this.props;
        const { jobCount, isDown } = model;
        const backgroundColor = getNodeColor(jobCount, isDown);

        return (
            <div
                className="resource-manager"
                onClick={this.handleClick}
                style={{ backgroundColor }}
            >
                <div className="resource-manager__label">
                    resource-manager #{nr}
                </div>
                <div className="resource-manager__jobs">{jobCount}</div>
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
