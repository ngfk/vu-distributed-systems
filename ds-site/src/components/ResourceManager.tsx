import * as React from 'react';

import { GridActionCreators } from '../actions/grid.actions';
import { NodeState, NodeType } from '../models/node';

export interface ResourceManagerProps {
    id: number;
    state: NodeState;
    jobs: number;
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
        let backgroundStyle = {};

        if (this.props.state === NodeState.Online) {
            backgroundStyle = {
                backgroundColor: 'green'
            };
        } else if (this.props.state === NodeState.Busy) {
            backgroundStyle = {
                backgroundColor: 'orange'
            };
        } else if (this.props.state === NodeState.Unreachable) {
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
                    Resource manager <br /> Job queue: {this.props.jobs}
                </div>
            </div>
        );
    }

    private handleClick = () => {
        this.props.gridToggle({
            id: this.props.id,
            type: NodeType.ResourceManager
        });
    };
}
