import * as React from 'react';

import { User } from '../components/User';
import { Cluster } from '../components/Cluster';
import { Scheduler } from '../components/Scheduler';

// tslint:disable-next-line
const logo = require('./ludwig.jpg');

export interface AppProps {}

export interface AppState {
    active: number;
}

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = { active: 0 };

        setInterval(() => {
            this.setState(state => ({
                ...state,
                active: (this.state.active + 1) % 3
            }));
        }, 2000);
    }

    public render(): JSX.Element {
        let clusters = [];

        for (let i = 0; i < 4; i++) {
            clusters.push(
                <Cluster
                    workers={10}
                    key={i}
                    resourceActive={(this.state.active + 3) % 3}
                    workerActive={(this.state.active + 3) % 3}
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
                        <User />{' '}
                    </div>
                    <Scheduler schedulers={5} active={this.state.active} />
                    <div className="Cluster-box"> {clusters} </div>
                </div>
            </div>
        );
    }
}

export default App;
