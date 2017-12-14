import * as React from 'react';

import { ResourceManagerModel } from '../../models/resource-manager';
import { getNodeColor } from '../../utils/node-color';
import { ActionCreators } from '../actions/actions';

export interface ResourceManagerProps {
    nr: number;
    model?: ResourceManagerModel;
    actions: ActionCreators;
}

export class ResourceManager extends React.Component<ResourceManagerProps> {
    public render(): JSX.Element {
        const { nr, model } = this.props;
        const backgroundColor = model
            ? getNodeColor(model.jobCount, model.isDown)
            : 'gray';

        return (
            <div
                className="resource-manager"
                onClick={this.handleClick}
                style={{ backgroundColor }}
            >
                <div className="resource-manager__label">
                    resource-manager: {nr}
                </div>
                <div className="resource-manager__jobs">
                    {model && model.jobCount}
                </div>
            </div>
        );
    }

    private handleClick = () => {
        if (!this.props.model) return;

        this.props.actions.resourceManagerToggle({
            id: this.props.model.id
        });
    };
}
