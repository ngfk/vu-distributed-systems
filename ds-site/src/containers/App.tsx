import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { ActionCreators, actionCreators } from '../actions/actions';
import { Grid } from '../components/Grid';
import { Settings } from '../components/Settings';
import { Grid as GridModel } from '../models/grid';
import { State } from '../reducers/reducer';

// tslint:disable-next-line
const logo = require('./ludwig.jpg');

export interface AppProps {
    grid: GridModel;
    actions: ActionCreators;
}

class App extends React.Component<AppProps> {
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
                <div className="app__settings">
                    <Settings actions={actions} />
                </div>
                <Grid model={grid} actions={actions} />
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

export default connect(mapStateToProps, mapDispatchToProps)(App);
