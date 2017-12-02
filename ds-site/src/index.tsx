import './index.css';

import { createStore } from '@ngfk/ts-redux';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, compose } from 'redux';

import { ActionMap } from './actions/actions';
import App from './containers/App';
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
        case 'setup':
            store.dispatch('GRID_SETUP', message.grid);
            console.log('setup', message);
            break;
        case 'state':
            console.log('state', message);
            break;
        case 'data':
            console.log('data', message);
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
