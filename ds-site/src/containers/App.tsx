import * as React from 'react';

import { Counter } from '../components/Counter';

const logo = require('./logo.svg');

export interface AppProps {}

export interface AppState {
    counter: number;
}

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = { counter: 0 };
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
                <Counter />
            </div>
        );
    }
}

export default App;
