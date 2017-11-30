import './index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { State, reducer } from './reducers/reducer';

import { ActionMap } from './actions/actions';
import App from './containers/App';
import { GridConnection } from './utils/grid-connection';
import { Provider } from 'react-redux';
import { createStore } from '@ngfk/ts-redux';
import registerServiceWorker from './registerServiceWorker';

// Redux store
const store = createStore<State, ActionMap>(reducer);

// Render React components
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
registerServiceWorker();

// Setup grid connection
const grid = new GridConnection();
grid.subscribe(message => {
    switch (message.type) {
        case 'setup':
            store.dispatch('GRID_SETUP', message.grid);
            console.log('setup', message);
            break;
        case 'data':
            console.log('data', message);
            break;
        case 'toggle':
            console.log('toggle', message);
            break;
    }
});
