import * as React from 'react';

export interface ResourceManagerProps {}

export interface ResourceManagerState {}

export class ResourceManager extends React.Component<
    ResourceManagerProps,
    ResourceManagerState
> {
    public render(): JSX.Element {
        return (
            <div>
                <div className="ResourceManager"> Resource manager </div>
            </div>
        );
    }
}
