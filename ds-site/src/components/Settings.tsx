import * as React from 'react';

import { GridActionCreators } from '../actions/grid.actions';

export interface SettingsProps {
    actions: GridActionCreators;
}

export interface SettingsState {
    schedulers: number;
    clusters: number;
    workers: number;
}

export class Settings extends React.Component<SettingsProps, SettingsState> {
    private initialState: SettingsState = {
        schedulers: 5,
        clusters: 20,
        workers: 2
    };

    constructor(props: SettingsProps) {
        super(props);
        this.state = this.initialState;
    }

    public render(): JSX.Element {
        const { schedulers, clusters, workers } = this.state;

        return (
            <div className="settings">
                <div className="settings__sliders">
                    <div>
                        <div className="settings__label">Schedulers</div>
                        <input
                            type="range"
                            min="2"
                            max="10"
                            value={schedulers}
                            onChange={this.onSchedulers}
                        />
                        <div className="settings__value">{schedulers}</div>
                    </div>
                    <div>
                        <div className="settings__label">Clusters</div>
                        <input
                            type="range"
                            min="10"
                            max="50"
                            value={clusters}
                            onChange={this.onClusters}
                        />
                        <div className="settings__value">{clusters}</div>
                    </div>
                    <div>
                        <div className="settings__label">Workers</div>
                        <input
                            type="range"
                            min="1"
                            max="32"
                            value={workers}
                            onChange={this.onWorkers}
                        />
                        <div className="settings__value">{workers * 32}</div>
                    </div>
                </div>
                <div className="settings__buttons">
                    <button onClick={this.onReset}>reset</button>
                    <button onClick={this.onStart}>start</button>
                </div>
            </div>
        );
    }

    private onSchedulers = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.persist();
        this.setState(state => ({
            ...state,
            schedulers: event.target.value
        }));
    };

    private onClusters = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.persist();
        this.setState(state => ({
            ...state,
            clusters: event.target.value
        }));
    };

    private onWorkers = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.persist();
        this.setState(state => ({
            ...state,
            workers: event.target.value
        }));
    };

    private onReset = () => {
        this.setState(this.initialState);
    };

    private onStart = () => {
        const { schedulers, clusters, workers } = this.state;
        this.props.actions.gridInit({
            schedulers,
            clusters,
            workers: workers * 32
        });
    };
}
