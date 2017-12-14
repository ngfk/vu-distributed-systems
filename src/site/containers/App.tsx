import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { ActionCreators, actionCreators } from '../actions/actions';
import { Grid } from '../components/Grid';
import { Settings } from '../components/Settings';
import { State } from '../reducers/reducer';

// tslint:disable-next-line
const logo = require('./ludwig.jpg');

export interface AppProps {
    state: State;
    actions: ActionCreators;
}

/**
 * The root component of the application. The container component links the
 * react interface with the redux store and defines the overall structure of
 * the interface.
 */
class AppBase extends React.Component<AppProps> {
    public render(): JSX.Element {
        const { actions, state } = this.props;

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
                <Grid {...state} actions={actions} />
            </div>
        );
    }
}

const mapStateToProps = (state: State) => ({
    state: { ...state }
});

const mapDispatchToProps = (dispatch: any) => ({
    actions: bindActionCreators(actionCreators, dispatch)
});

/**
 * Inject the state and actions into the container component.
 */
export const App = connect(mapStateToProps, mapDispatchToProps)(AppBase);
