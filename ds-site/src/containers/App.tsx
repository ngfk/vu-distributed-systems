import * as React from 'react';

import { User } from '../components/User';
import { Cluster } from '../components/Cluster';
import { Scheduler } from '../components/Scheduler';

// tslint:disable-next-line
const logo = require('./ludwig.jpg');

export interface AppProps {}

export interface AppState {}

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
    }

    public render(): JSX.Element {
        let clusters = [];
        for (let i = 0; i < 4; i++) {
            clusters.push(<Cluster workers={10} />);
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
                    <Scheduler schedulers={5} />
                    <div className="Cluster-box"> {clusters} </div>
                </div>
            </div>
        );
    }
}

export default App;
