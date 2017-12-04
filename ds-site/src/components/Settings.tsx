import * as React from 'react';

import { GridActionCreators } from '../actions/grid.actions';
import { debounce } from '../utils/debounce';

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

    private debouncedGridInit: GridActionCreators['gridInit'];

    constructor(props: SettingsProps) {
        super(props);
        this.state = this.initialState;

        // Create debounced version of gridInit.
        const { gridInit } = this.props.actions;
        this.debouncedGridInit = debounce(gridInit, 1500);

        // Render grid with initial state.
        const { schedulers, clusters, workers } = this.state;
        gridInit({
            schedulers,
            clusters,
            workers: workers * 32
        });
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
                            min={2}
                            max={10}
                            value={schedulers}
                            onChange={this.onSchedulers}
                        />
                        <div className="settings__value">{schedulers}</div>
                    </div>
                    <div>
                        <div className="settings__label">Clusters</div>
                        <input
                            type="range"
                            min={10}
                            max={50}
                            value={clusters}
                            onChange={this.onClusters}
                        />
                        <div className="settings__value">{clusters}</div>
                    </div>
                    <div>
                        <div className="settings__label">Workers</div>
                        <input
                            type="range"
                            min={1}
                            max={32}
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
            schedulers: parseInt(event.target.value, 10)
        }));
        this.renderGrid();
    };

    private onClusters = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.persist();
        this.setState(state => ({
            ...state,
            clusters: parseInt(event.target.value, 10)
        }));
        this.renderGrid();
    };

    private onWorkers = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.persist();
        this.setState(state => ({
            ...state,
            workers: parseInt(event.target.value, 10)
        }));
        this.renderGrid();
    };

    private onReset = () => {
        this.setState(this.initialState);
        setTimeout(() => this.renderGrid(), 0);
    };

    private onStart = () => {
        const { schedulers, clusters, workers } = this.state;
        this.props.actions.gridStart({
            schedulers,
            clusters,
            workers: workers * 32
        });
    };

    private renderGrid(): void {
        const { schedulers, clusters, workers } = this.state;
        this.debouncedGridInit({
            schedulers,
            clusters,
            workers: workers * 32
        });
    }
}
