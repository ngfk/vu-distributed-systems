import { Simulation } from './simulation';

const main = () => {
    const simulation = new Simulation(1, 1, 1);
    console.log('Hello World!');
};

(() => require.main === module && main())();
