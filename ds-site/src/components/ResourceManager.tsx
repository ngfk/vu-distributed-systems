import * as React from 'react';

import { GridActionCreators } from '../actions/grid.actions';
import { ResourceManager as ResourceManagerModel } from '../models/grid';
import { NodeState, NodeType } from '../models/node';

export interface ResourceManagerProps {
    model: ResourceManagerModel;
    gridToggle: GridActionCreators['gridToggle'];
}

export interface ResourceManagerState {}

export class ResourceManager extends React.Component<
    ResourceManagerProps,
    ResourceManagerState
> {
    constructor(props: ResourceManagerProps) {
        super(props);
    }

    public render(): JSX.Element {
        const { state, jobs } = this.props.model;
        let backgroundStyle = {};

        if (state === NodeState.Online) {
            backgroundStyle = {
                backgroundColor: 'green'
            };
        } else if (state === NodeState.Busy) {
            backgroundStyle = {
                backgroundColor: 'orange'
            };
        } else if (state === NodeState.Unreachable) {
            backgroundStyle = {
                backgroundColor: 'grey'
            };
        } else {
            backgroundStyle = { backgroundColor: 'red' };
        }

        return (
            <div
                className="ResourceManager"
                onClick={this.handleClick}
                style={backgroundStyle}
            >
                <div className="ResourceManager-label">
                    Resource manager <br /> Job queue: {jobs}
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
