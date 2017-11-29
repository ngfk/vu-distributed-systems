import * as React from 'react';

import { User } from '../components/User';
import { Cluster } from '../components/Cluster';
import { Scheduler } from '../components/Scheduler';

const logo = require('./logo.svg');

export interface AppProps {}

export interface AppState {}

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
    }

    public render(): JSX.Element {
        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>Welcome to React</h2>
                </div>
                <p className="App-intro">
                    To get started, edit
                    <code>src/App.tsx</code> and save to reload.
                </p>
                <User />
                <Scheduler />
                <Cluster workers={10} />
            </div>
        );
    }
}

export default App;
