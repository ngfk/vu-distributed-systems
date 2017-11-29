import * as React from 'react';

export interface ResourceManagerProps {
    active: number;
}

export interface ResourceManagerState {}

export class ResourceManager extends React.Component<
    ResourceManagerProps,
    ResourceManagerState
> {
    public render(): JSX.Element {
        let backgroundStyle = {};

        if (this.props.active === 0) {
            backgroundStyle = { backgroundColor: 'orange' };
        } else if (this.props.active === 1) {
            backgroundStyle = { backgroundColor: 'red' };
        } else if (this.props.active === 2) {
            backgroundStyle = { backgroundColor: 'green' };
        }

        return (
            <div className="ResourceManager" style={backgroundStyle}>
                <div className="ResourceManager-label">Resource manager</div>
            </div>
        );
    }
}
