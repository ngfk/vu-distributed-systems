const main = () => {
    console.log('Hello World!');
};

(() => require.main === module && main())();
