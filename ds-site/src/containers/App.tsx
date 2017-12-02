import * as React from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Cluster } from '../components/Cluster';
import { SchedulerCluster } from '../components/SchedulerCluster';
import { User } from '../components/User';
import { State } from '../reducers/reducer';
import { actionCreators, ActionCreators } from '../actions/actions';
import { Grid } from '../models/grid';

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
    }

    // private getClusterCount = () => {
    //     return this.state.clusterCount.toString();
    // };
    private handleChangeCluster(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ clusterCount: parseInt(e.target.value) });
    }

    private handleChangeWorker(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ workerCount: parseInt(e.target.value) });
    }

    private handleChangeScheduler(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ schedulerCount: parseInt(e.target.value) });
    }

    public render(): JSX.Element {
        let clusters = [];

        for (let i = 0; i < this.state.clusterCount; i++) {
            clusters.push(
                <Cluster
                    workers={this.state.workerCount}
                    key={'ResourceDown' + i.toString()}
                />
            );
        }

        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>Welcome to Ludwig Dahl Fanclub</h2>
                </div>
                <h1 className="App-intro">Simulation of the grid schedulers</h1>
                <div className="inputForm">
                    <label>Clusters </label>
                    <input
                        type="text"
                        name="clusterCount"
                        onChange={this.handleChangeCluster.bind(this)}
                    />
                    <label>Workers </label>
                    <input
                        type="text"
                        name="workerCount"
                        onChange={this.handleChangeWorker.bind(this)}
                    />
                    <label>Schedulers </label>
                    <input
                        type="text"
                        name="schedulerCount"
                        onChange={this.handleChangeScheduler.bind(this)}
                    />
                </div>
                <div className="App-body">
                    <div className="User-box">
                        <User />
                    </div>
                    <SchedulerCluster schedulers={this.state.schedulerCount} />
                    <div className="Cluster-box"> {clusters} </div>
                </div>
            </div>
        );
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
