import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { ActionCreators, actionCreators } from '../actions/actions';
import { Cluster } from '../components/Cluster';
import { Scheduler } from '../components/Scheduler';
import { User } from '../components/User';
import { Grid } from '../models/grid';
import { State } from '../reducers/reducer';

// tslint:disable-next-line
const logo = require('./ludwig.jpg');

export interface AppProps {
    grid: Grid;
    actions: ActionCreators;
}

export interface AppState {
    clusterCount: number;
    workerCount: number;
    schedulerCount: number;
}

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = { clusterCount: 0, workerCount: 0, schedulerCount: 0 };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChangeCluster = this.handleChangeCluster.bind(this);
        this.handleChangeScheduler = this.handleChangeScheduler.bind(this);
        this.handleChangeWorker = this.handleChangeWorker.bind(this);
    }

    public render(): JSX.Element {
        let clusters: JSX.Element[] = [];
        let schedulers: JSX.Element[] = [];
        const { gridToggle } = this.props.actions;

        this.props.grid.schedulers.forEach(scheduler => {
            schedulers.push(
                <Scheduler
                    key={scheduler.id}
                    model={scheduler}
                    gridToggle={gridToggle}
                />
            );
        });

        this.props.grid.clusters.forEach(cluster => {
            clusters.push(
                <Cluster
                    workers={cluster.workers}
                    resourceManager={cluster.resourceManager}
                    key={cluster.resourceManager.id}
                    gridToggle={gridToggle}
                />
            );
        });

        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>Welcome to Ludwig Dahl Fanclub</h2>
                </div>
                <h1 className="App-intro">Simulation of the grid schedulers</h1>
                <form onSubmit={this.handleSubmit}>
                    <div className="inputForm">
                        <label>Clusters </label>
                        <input
                            type="text"
                            name="clusterCount"
                            onChange={this.handleChangeCluster}
                        />
                        <label>Workers </label>
                        <input
                            type="text"
                            name="workerCount"
                            onChange={this.handleChangeWorker}
                        />
                        <label>Schedulers </label>
                        <input
                            type="text"
                            name="schedulerCount"
                            onChange={this.handleChangeScheduler}
                        />
                        <input type="submit" value="Send!" />
                    </div>
                </form>
                <div className="App-body">
                    <div className="User-box">
                        <User />
                    </div>
                    <div className="Scheduler-box">
                        Waiting user jobs: {this.props.grid.schedulerJobs}
                        <div className="Schedulers">{schedulers}</div>
                    </div>
                </div>
                <div className="Cluster-box">{clusters}</div>
            </div>
        );
    }
    private handleChangeCluster(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ clusterCount: parseInt(e.target.value, 10) });
    }

    private handleChangeWorker(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ workerCount: parseInt(e.target.value, 10) });
    }

    private handleChangeScheduler(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ schedulerCount: parseInt(e.target.value, 10) });
    }

    private handleSubmit(event: React.FormEvent<any>) {
        this.props.actions.gridInit({
            schedulers: this.state.schedulerCount,
            clusters: this.state.clusterCount,
            workers: this.state.workerCount
        });

        event.preventDefault();
    }
}

const mapStateToProps = (state: State) => ({
    grid: state.grid
});

const mapDispatchToProps = (dispatch: any) => ({
    actions: bindActionCreators(actionCreators, dispatch)
});

// tslint:disable-next-line variable-name
export default connect(mapStateToProps, mapDispatchToProps)(App);
