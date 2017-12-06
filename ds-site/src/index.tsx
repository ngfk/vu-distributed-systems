import './index.css';

import { createStore } from '@ngfk/ts-redux';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, compose, Middleware } from 'redux';

import { ActionMap } from './actions/actions';
import { gridSetupActionCreators } from './actions/grid-setup.actions';
import {
    resourceManagerActionCreators
} from './actions/resource-manager.actions';
import { schedulerActionCreators } from './actions/scheduler.actions';
import { userActionCreators } from './actions/user.actions';
import { workerActionCreators } from './actions/worker.actions';
import App from './containers/App';
import { GridContext } from './grid/grid-context';
import { Simulation } from './grid/simulation';
import { NodeType } from './models/node-type';
import { reducer, State } from './reducers/reducer';
import registerServiceWorker from './registerServiceWorker';

let grid: Simulation | undefined;

export const gridMiddleware: Middleware = store => next => action => {
    // Unfortunately it would be too much effort to make this function type
    // safe, so this function simply uses a lot of casting.
    const p: any = (action as any).payload;

    const sendJobCount = (
        nodeType: NodeType,
        nodeId: string,
        jobCount: number
    ) => {
        switch (nodeType) {
            case NodeType.User:
                const userAction = userActionCreators.userJobs({
                    id: nodeId,
                    jobCount
                });
                store.dispatch(userAction);
                break;
            case NodeType.Scheduler:
                const schedulerAction = schedulerActionCreators.schedulerJobs({
                    id: nodeId,
                    jobCount
                });
                store.dispatch(schedulerAction);
                break;
            case NodeType.ResourceManager:
                const rmAction = resourceManagerActionCreators.resourceManagerJobs(
                    {
                        id: nodeId,
                        jobCount
                    }
                );
                store.dispatch(rmAction);
                break;
            case NodeType.Worker:
                const workerAction = workerActionCreators.workerJobs({
                    id: nodeId,
                    jobCount
                });
                store.dispatch(workerAction);
                break;
        }
    };

    switch (action.type) {
        case 'GRID_START': {
            const payload = p as ActionMap['GRID_START'];

            const context: GridContext = {
                schedulers: payload.schedulers,
                clusters: payload.clusters,
                workers: payload.workers,
                sendJobCount
            };

            grid = new Simulation(context);

            const setup = grid.getSetup();
            const setupAction = gridSetupActionCreators.gridSetup(setup);
            store.dispatch(setupAction);

            grid.start();
            break;
        }
        case 'GRID_STOP': {
            if (grid) grid.stop();
            break;
        }
        case 'SCHEDULER_TOGGLE': {
            const payload = p as ActionMap['SCHEDULER_TOGGLE'];
            if (grid) grid.toggleScheduler(payload.id);
            break;
        }
        case 'RESOURCE_MANAGER_TOGGLE': {
            const payload = p as ActionMap['RESOURCE_MANAGER_TOGGLE'];
            if (grid) grid.toggleResourceManager(payload.id);
            break;
        }
        case 'WORKER_TOGGLE': {
            const payload = p as ActionMap['WORKER_TOGGLE'];
            if (grid) grid.toggleWorker(payload.id);
            break;
        }
    }

    return next(action);
};

// Redux store
const enhancer = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;
const middleware = applyMiddleware(gridMiddleware);
const reduxStore = createStore<State, ActionMap>(reducer, enhancer(middleware));

// Render React components
ReactDOM.render(
    <Provider store={reduxStore}>
        <App />
    </Provider>,
    document.getElementById('root')
);
registerServiceWorker();
