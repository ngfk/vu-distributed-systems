import { GridContext } from './grid-context';
import { Simulation } from './simulation';

const main = () => {
    const context: GridContext = {
        schedulers: 1,
        clusters: 10,
        workers: 64,
        jobs: 1,
        sendJobCount: () => {}
    };
    const simulation = new Simulation(context);
    simulation.start();

    console.log('Hello World!');
};

(() => require.main === module && main())();
