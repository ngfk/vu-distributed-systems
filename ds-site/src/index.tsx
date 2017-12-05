import './index.css';

import { createStore } from '@ngfk/ts-redux';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, compose } from 'redux';

import { ActionMap } from './actions/actions';
import App from './containers/App';
import { GridMessageType } from './models/grid-message';
import { NodeType } from './models/node-type';
import { reducer, State } from './reducers/reducer';
import registerServiceWorker from './registerServiceWorker';
import {
    GridConnection,
    gridMiddleware,
    Unsubscribe
} from './utils/grid-connection';
import { throttle } from './utils/throttle';

// Grid connection & redux store
const grid = new GridConnection();
const enhancer = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;
const middleware = applyMiddleware(gridMiddleware(grid));
const store = createStore<State, ActionMap>(reducer, enhancer(middleware));

// Monkey patch the redux subscribe function to add a debounce
const originalSubscribe = store.subscribe;
store.subscribe = (listener: () => void): Unsubscribe => {
    const debouncedListener = throttle(() => listener(), 200);
    return originalSubscribe(() => debouncedListener());
};

// Render React components
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
registerServiceWorker();

// Forward messages from back-end to store
grid.subscribe(message => {
    if (message.type === GridMessageType.Setup) {
        store.dispatch('GRID_SETUP', message.grid);

        const { user, schedulers, clusters } = message.grid;
        const resourceManagers = clusters.map(c => c.resourceManager);
        const workers = ([] as string[]).concat(
            ...clusters.map(c => c.workers)
        );

        store.dispatch('USER_INIT', user);
        store.dispatch('SCHEDULER_INIT', schedulers);
        store.dispatch('RESOURCE_MANAGER_INIT', resourceManagers);
        store.dispatch('WORKER_INIT', workers);

        grid.send({ type: GridMessageType.Start });

        return;
    }

    if (message.type === GridMessageType.Queue) {
        const payload = { id: message.nodeId, jobCount: message.jobs };

        type Action =
            | 'USER_JOBS'
            | 'SCHEDULER_JOBS'
            | 'RESOURCE_MANAGER_JOBS'
            | 'WORKER_JOBS';

        const map: { [id in NodeType]: Action } = {
            user: 'USER_JOBS',
            scheduler: 'SCHEDULER_JOBS',
            'resource-manager': 'RESOURCE_MANAGER_JOBS',
            worker: 'WORKER_JOBS'
        };

        store.dispatch(map[message.nodeType], payload);
    }
});
