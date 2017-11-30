import './index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './containers/App';
import { GridConnection } from './utils/grid-connection';
import registerServiceWorker from './registerServiceWorker';

// Render React components
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

// Setup grid connection
const grid = new GridConnection();
grid.subscribe(message => {
    switch (message.type) {
        case 'data':
            console.log('data', message);
            break;
        case 'toggle':
            console.log('toggle', message);
            break;
    }
});
