import { Simulation } from './simulation';

// Note: this file is only used to debug the grid

const main = () => {
    const simulation = new Simulation(2, 1, 1);
    simulation.start();
};

// Only execute the main if this file is executed directly: `node index.ts`. If
// this file is imported by another module the main function will not execute.
(() => require.main === module && main())();
