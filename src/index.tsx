import './site/index.css';

import { createStore } from '@ngfk/ts-redux';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, compose, Middleware } from 'redux';

import { Simulation } from './grid/simulation';
import { NodeType } from './models/node-type';
import { actionCreators, ActionMap } from './site/actions/actions';
import { App } from './site/containers/App';
import { reducer, State } from './site/reducers/reducer';
import registerServiceWorker from './site/registerServiceWorker';

let grid: Simulation | undefined;

/**
 * The girdMiddleware function is used to catch actions triggered from the
 * interface and forward them to the grid.
 *
 * The internal sendJobCount function is passed as a context parameter to the
 * simulation and is used to reflect changes from the grid simulation on
 * interface.
 */
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
                const userAction = actionCreators.userJobs({
                    id: nodeId,
                    jobCount
                });
                store.dispatch(userAction);
                break;
            case NodeType.Scheduler:
                const schedulerAction = actionCreators.schedulerJobs({
                    id: nodeId,
                    jobCount
                });
                store.dispatch(schedulerAction);
                break;
            case NodeType.ResourceManager:
                const rmAction = actionCreators.resourceManagerJobs({
                    id: nodeId,
                    jobCount
                });
                store.dispatch(rmAction);
                break;
            case NodeType.Worker:
                const workerAction = actionCreators.workerJobs({
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

            grid = new Simulation(
                payload.schedulers,
                payload.clusters,
                payload.workers,
                sendJobCount
            );

            const setup = grid.getSetup();

            const user = setup.user;
            const schedulers = setup.schedulers;
            const resourceManagers = setup.clusters.map(c => c.resourceManager);
            const workers = setup.clusters.reduce(
                (acc, c) => [...acc, ...c.workers],
                []
            );

            const setupAction = actionCreators.gridSetup(setup);
            const schedulerAction = actionCreators.schedulerInit(schedulers);
            const rmAction = actionCreators.resourceManagerInit(
                resourceManagers
            );
            const workerAction = actionCreators.workerInit(workers);

            store.dispatch(setupAction);
            store.dispatch(schedulerAction);
            store.dispatch(rmAction);
            store.dispatch(workerAction);

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

// Setup redux store
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
