import { Simulation } from './simulation';

const main = () => {
    const simulation = new Simulation(2, 1, 1);
    simulation.start();
};

(() => require.main === module && main())();
