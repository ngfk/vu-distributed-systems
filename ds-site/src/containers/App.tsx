import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { ActionCreators, actionCreators } from '../actions/actions';
import { Grid } from '../components/Grid';
import { Grid as GridModel } from '../models/grid';
import { State } from '../reducers/reducer';

// tslint:disable-next-line
const logo = require('./ludwig.jpg');

export interface AppProps {
    grid: GridModel;
    actions: ActionCreators;
}

export interface AppState {
    initialized: boolean;
    clusterCount: number;
    workerCount: number;
    schedulerCount: number;
}

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);

        this.state = {
            initialized: false,
            clusterCount: 0,
            workerCount: 0,
            schedulerCount: 0
        };
    }

    public render(): JSX.Element {
        const { actions, grid } = this.props;

        return (
            <div className="app">
                <div className="app__header">
                    <img src={logo} className="app__logo" alt="logo" />
                    <h2>Welcome to Ludwig Dahl Fanclub</h2>
                </div>
                <h1 className="app__intro">Simulation of grid schedulers</h1>

                <form onSubmit={this.onSubmit}>
                    <div className="input-form">
                        <label>Schedulers</label>
                        <input
                            type="text"
                            name="schedulerCount"
                            onChange={this.onChangeScheduler}
                        />
                        <label>Clusters</label>
                        <input
                            type="text"
                            name="clusterCount"
                            onChange={this.onChangeCluster}
                        />
                        <label>Workers</label>
                        <input
                            type="text"
                            name="workerCount"
                            onChange={this.onChangeWorker}
                        />
                        <input type="submit" value="Send!" />
                        <input
                            type="button"
                            value="Start!"
                            onClick={this.onStart}
                        />
                    </div>
                </form>
                <Grid model={grid} actions={actions} />
            </div>
        );
    }

    private onChangeCluster = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ clusterCount: parseInt(e.target.value, 10) });
    };

    private onChangeWorker = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ workerCount: parseInt(e.target.value, 10) });
    };

    private onChangeScheduler = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ schedulerCount: parseInt(e.target.value, 10) });
    };

    private onSubmit = (event: React.FormEvent<any>) => {
        this.initialize();
        event.preventDefault();
    };

    private onStart = () => {
        if (!this.state.initialized) {
            this.setState(state => ({
                ...state,
                schedulerCount: state.schedulerCount || 5,
                clusterCount: state.clusterCount || 20,
                workerCount: state.workerCount || 50
            }));
            this.initialize();
        }

        this.props.actions.gridStart(void 0);
    };

    private initialize(): void {
        this.props.actions.gridInit({
            schedulers: this.state.schedulerCount,
            clusters: this.state.clusterCount,
            workers: this.state.workerCount
        });
        this.setState({ initialized: true });
    }
}

const mapStateToProps = (state: State) => ({
    grid: state.grid
});

const mapDispatchToProps = (dispatch: any) => ({
    actions: bindActionCreators(actionCreators, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
