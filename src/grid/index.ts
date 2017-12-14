import { GridContext } from './grid-context';
import { Simulation } from './simulation';

// Note: this file is only used to debug the grid

const main = () => {
    const context: GridContext = {
        schedulers: 1,
        clusters: 10,
        workers: 64,
        jobs: 1
    };
    const simulation = new Simulation(context);
    simulation.start();

    console.log('Hello World!');
};

// Only execute the main if this file is executed directly: `node index.ts`. If
// this file is imported by another module the main function will not execute.
(() => require.main === module && main())();
