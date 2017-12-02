import * as React from 'react';
import { NodeState, NodeType } from '../models/node';
import { GridActionCreators } from '../actions/grid.actions';

export interface ResourceManagerProps {
    id: number;
    state: NodeState;
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

        if (
            this.props.state === NodeState.Busy ||
            this.props.state === NodeState.Online ||
            this.props.state === NodeState.Unreachable
        ) {
            backgroundStyle = {
                backgroundColor: 'green'
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
                <div className="ResourceManager-label"> Resource manager </div>
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
