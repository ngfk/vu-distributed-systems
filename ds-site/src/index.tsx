import './index.css';

import { createStore } from '@ngfk/ts-redux';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, compose } from 'redux';

import { ActionMap } from './actions/actions';
import App from './containers/App';
import { GridMessageType } from './models/grid-message';
import { reducer, State } from './reducers/reducer';
import registerServiceWorker from './registerServiceWorker';
import { GridConnection, gridMiddleware } from './utils/grid-connection';

// Grid connection & redux store
const grid = new GridConnection();
const enhancer = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;
const middleware = applyMiddleware(gridMiddleware(grid));
const store = createStore<State, ActionMap>(reducer, enhancer(middleware));

// Forward messages from back-end to store
grid.subscribe(message => {
    switch (message.type) {
        case GridMessageType.Setup:
            store.dispatch('GRID_SETUP', message.grid);
            console.log('setup', message);
            break;
        case GridMessageType.Queue:
            store.dispatch('GRID_QUEUE', {
                id: message.nodeId,
                type: message.nodeType,
                jobs: message.jobs
            });
            console.log('jobqueue', message);
            break;
        case GridMessageType.State:
            store.dispatch('GRID_STATE', {
                id: message.nodeId,
                type: message.nodeType,
                state: message.nodeState
            });
            console.log('state', message);
            break;
    }
});

// Render React components
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
registerServiceWorker();
