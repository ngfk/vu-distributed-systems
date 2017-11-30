import * as React from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Cluster } from '../components/Cluster';
import { Scheduler } from '../components/Scheduler';
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
    active: number;
    randomResource: number;
    randomCluster: number;
    randomWorker: number;
    randomScheduler: number;
}

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            active: 0,
            randomWorker: 0,
            randomCluster: 0,
            randomResource: 0,
            randomScheduler: 0
        };

        // setInterval(() => {
        //     this.setState(state => ({
        //         ...state,
        //         active: (this.state.active + 1) % 3,
        //         randomCluster: Math.floor(Math.random() * 20),
        //         randomResource: Math.floor(Math.random() * 20),
        //         randomWorker: Math.floor(Math.random() * 50),
        //         randomScheduler: Math.floor(Math.random() * 10)
        //     }));
        // }, 500);
    }

    public render(): JSX.Element {
        let clusters = [];

        for (let i = 1; i < 10; i++) {
            if (i === this.state.randomResource)
                clusters.push(
                    <Cluster
                        workers={50}
                        key={'ResourceDown' + i.toString()}
                        resourceActive={1}
                        workerActive={(this.state.active + 3) % 3}
                        workerNode={51}
                    />
                );
            else
                clusters.push(
                    <Cluster
                        workers={50}
                        key={'ResourceUp' + i.toString()}
                        resourceActive={2}
                        workerActive={(this.state.active + 3) % 3}
                        workerNode={51}
                    />
                );

            if (i === this.state.randomCluster)
                clusters.push(
                    <Cluster
                        workers={50}
                        key={'WorkerDown' + i.toString()}
                        resourceActive={2}
                        workerActive={(this.state.active + 3) % 3}
                        workerNode={this.state.randomWorker}
                    />
                );
            else
                clusters.push(
                    <Cluster
                        workers={50}
                        key={'WorkerUp' + i.toString()}
                        resourceActive={2}
                        workerActive={(this.state.active + 3) % 3}
                        workerNode={51}
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

                <div className="App-body">
                    <div className="User-box">
                        <User />
                    </div>
                    <Scheduler
                        schedulers={5}
                        active={1}
                        randomScheduler={this.state.randomScheduler}
                    />
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
